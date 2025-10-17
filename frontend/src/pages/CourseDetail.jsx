import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiBook, FiUsers, FiClock, FiFileText, FiPlus, FiCheckCircle, FiUpload, FiDownload, FiTrash2, FiX, FiAward } from 'react-icons/fi';
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import AssignmentCard from '../components/AssignmentCard';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('syllabus');
  const [completedModules, setCompletedModules] = useState([]);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [summaryModal, setSummaryModal] = useState({ open: false, text: '', title: '' });
  const [previewModal, setPreviewModal] = useState({ open: false, url: null, filename: '', mime: '' });
  const [courseProgressPercent, setCourseProgressPercent] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ stars: 0, review: '' });
  const [userRating, setUserRating] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  useEffect(() => {
    fetchCourseDetails();
    fetchAssignments();
    fetchQuizzes();
    fetchMaterials();
    fetchReviews();
    if (user?.role === 'student') fetchQuizAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      console.log('Fetching course details for ID:', id);
      const { data } = await api.get(`/courses/${id}`);
      console.log('Course data received:', data);
      
      if (!data.data) {
        throw new Error('No course data received');
      }
      
      setCourse(data.data);
      setIsEnrolled(data.data.enrolledStudents?.some(s => s._id === user?.id));
      
      // Set user rating if exists
      setUserRating(data.data.ratings?.find(r => r.user?._id === user?.id)?.stars || 0);
      setRatingReview(data.data.ratings?.find(r => r.user?._id === user?.id)?.review || '');
      
      // compute progress for teacher from course.modules
      if (user?.role === 'teacher') {
        const total = data.data.modules?.length || 0;
        const completed = data.data.modules?.filter(m => m.completed).length || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        setCourseProgressPercent(percent);
      } else if (user?.role === 'student') {
        // fetch student progress
        try {
          const { data: prog } = await api.get(`/courses/${id}/progress`);
          setCourseProgressPercent(prog.data.percent || 0);
          setCompletedModules(prog.data.completedModules || []);
        } catch (err) {
          console.error('Failed to fetch course progress', err);
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/announcements`);
      setAnnouncements(data.data || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments/course/${id}`);
      setAssignments(data.data);
    } catch (error) {
      console.error('Failed to load assignments');
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get(`/quizzes/course/${id}`);
      setQuizzes(data.data);
    } catch (error) {

              {/* Rating summary */}
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 6 }}><strong>Rating:</strong> {course.avgRating ? course.avgRating.toFixed(1) : '0.0'} / 5 ({course.ratingCount || 0})</div>
              </div>
              {/* Rating input for enrolled students */}
              {user?.role === 'student' && isEnrolled && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setUserRating(s)}
                        className={`btn ${userRating >= s ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '6px 8px', minWidth: 36 }}
                        aria-label={`Rate ${s} stars`}
                      >
                        {'★'}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <input type="text" className="form-input" placeholder="Write a short review (optional)" value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} />
                  </div>
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={async () => {
                      try {
                        const { data } = await api.post(`/courses/${id}/rate`, { stars: userRating, review: ratingReview });
                        toast.success('Thanks for rating!');
                        // update course object to reflect new rating summary
                        setCourse(prev => ({ ...prev, ratingCount: data.data.ratingCount, avgRating: data.data.avgRating }));
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Failed to submit rating');
                      }
                    }}>Submit Rating</button>
                  </div>
                </div>
              )}
      console.error('Failed to load quizzes');
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const { data } = await api.get(`/quizzes/student/${user.id}/attempts`);
      setQuizAttempts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch quiz attempts', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/materials`);
      setMaterials(data.data);
    } catch (error) {
      console.error('Failed to load materials');
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/reviews`);
      setReviews(data.data);
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      fetchCourseDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleUnenroll = async () => {
    if (window.confirm('Are you sure you want to unenroll from this course?')) {
      try {
        await api.post(`/courses/${id}/unenroll`);
        toast.success('Successfully unenrolled from course');
        fetchCourseDetails();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to unenroll');
      }
    }
  };

  const handleAssignmentCreated = () => {
    setShowAssignmentModal(false);
    fetchAssignments();
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/assignments`, { state: { assignmentId, courseId: id } });
  };

  const handleViewQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleMaterialUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    setUploadingMaterial(true);
    try {
      await api.post(`/courses/${id}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Material uploaded successfully');
      fetchMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploadingMaterial(false);
      e.target.value = '';
    }
  };

  const handleDownloadMaterial = async (materialId, filename) => {
    try {
      const response = await api.get(`/courses/${id}/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download material');
    }
  };

  const handlePreviewMaterial = async (materialId, filename) => {
    try {
      const response = await api.get(`/courses/${id}/materials/${materialId}/download`, { responseType: 'blob' });
      const mime = response.headers['content-type'] || response.data.type || '';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
      setPreviewModal({ open: true, url, filename, mime });
    } catch (error) {
      console.error(error);
      toast.error('Failed to preview material');
    }
  };

  const handleSummarize = async (materialId, title) => {
    try {
      const { data } = await api.get(`/courses/${id}/materials/${materialId}/summary`);
      setSummaryModal({ open: true, text: data.data.excerpt || 'No summary available', title: title || 'Summary' });
    } catch (err) {
      toast.error('Failed to summarize material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await api.delete(`/courses/${id}/materials/${materialId}`);
        toast.success('Material deleted');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.stars === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await api.post(`/courses/${id}/rate`, {
        stars: newReview.stars,
        review: newReview.review
      });
      toast.success('Review submitted successfully!');
      setNewReview({ stars: 0, review: '' });
      setShowReviewForm(false);
      fetchReviews();
      fetchCourseDetails(); // Update course rating summary
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  console.log('CourseDetail render - loading:', loading, 'course:', course);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    console.log('No course data, returning null');
    return (
      <div className="course-detail-page">
        <div className="container">
          <div className="empty-state">
            <h3>Course not found</h3>
            <p>The course you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/courses')} className="btn btn-primary">
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.role === 'teacher' && course.teacher?._id === user?.id;

  return (
    <div className="course-detail-page">
      <div className="container">
        <div className="course-hero">
          <div className="course-hero-content">
            <div className="course-hero-left">
              <span className="badge badge-primary">{course.duration}</span>
              <h1>{course.title}</h1>
              <p>{course.description}</p>
              
              <div className="course-meta-info">
                <div className="meta-item">
                  <FiBook /> <span>Instructor: {course.teacher?.name}</span>
                </div>
                <div className="meta-item">
                  <FiUsers /> <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                </div>
              </div>
            </div>

            <div className="course-hero-right">
              <div className="course-actions">
                {user?.role === 'student' && (
                  isEnrolled ? (
                    <>
                      <button className="btn btn-success" disabled>
                        <FiCheckCircle /> Enrolled
                      </button>
                      <button onClick={handleUnenroll} className="btn btn-outline">
                        Unenroll
                      </button>
                    </>
                  ) : (
                    <button onClick={handleEnroll} className="btn btn-primary">
                      Enroll Now
                    </button>
                  )
                )}

                {/* Progress circle */}
                {/* progress moved to the right aside (rendered inside the hero) */}
              </div>
            </div>
          </div>
          {/* progress removed */}
        </div>

        {/* Tabs Navigation */}
  <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
            onClick={() => setActiveTab('syllabus')}
          >
            <FiBook /> Syllabus
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <FiFileText /> Assignments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <FiBook /> Quizzes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <FiUpload /> Materials
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'assignments' && (
            <div className="assignments-tab">
              <div className="section-header">
                <h2><FiFileText /> Assignments</h2>
                {isOwner && (
                  <button onClick={() => setShowAssignmentModal(true)} className="btn btn-primary btn-sm">
                    <FiPlus /> Create Assignment
                  </button>
                )}
              </div>

              {assignments.length > 0 ? (
                <div className="items-list">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      user={user}
                      isEnrolled={isEnrolled}
                      handleViewAssignment={handleViewAssignment}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiFileText />
                  <h3>No assignments yet</h3>
                  <p>{isOwner ? 'Create your first assignment for this course' : 'No assignments have been posted yet'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="quizzes-tab">
              <div className="section-header">
                <h2><FiBook /> Quizzes</h2>
                {isOwner && (
                  <button onClick={() => navigate(`/quiz/create/${id}`)} className="btn btn-primary btn-sm">
                    <FiPlus /> Create Quiz
                  </button>
                )}
              </div>

                      {quizzes.length > 0 ? (
                <div className="items-list">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="item-card fade-in">
                      <div className="item-info">
                        <h3>{quiz.title}</h3>
                        <p>{quiz.description}</p>
                        <div className="item-meta">
                          <span className="meta-item">
                            <FiClock /> Due: {new Date(quiz.dueDate).toLocaleDateString()}
                          </span>
                          <span className="meta-item">
                            Duration: {quiz.duration} min
                          </span>
                          <span className="meta-item">
                            Points: {quiz.totalPoints}/10
                          </span>
                        </div>
                      </div>
                      {(isEnrolled || isOwner) && (
                        (() => {
                          const attempted = quizAttempts.some(a => a.quiz === quiz._id || (a.quiz && a.quiz._id === quiz._id));
                          const btnLabel = user?.role === 'teacher' ? 'View Results' : (attempted ? 'View Results' : 'Take Quiz');
                          // Use regular primary button size (not too large)
                          const btnClass = 'btn btn-primary btn-eq-large';
                          return (
                            <button 
                              onClick={() => handleViewQuiz(quiz._id)}
                              className={btnClass}
                            >
                              {btnLabel}
                            </button>
                          );
                        })()
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiBook />
                  <h3>No quizzes yet</h3>
                  <p>{isOwner ? 'Create your first quiz for this course' : 'No quizzes have been posted yet'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="materials-tab">
              <div className="section-header">
                <h2><FiUpload /> Course Materials</h2>
                {isOwner && (
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    <FiUpload /> Upload Material
                    <input 
                      type="file" 
                      hidden 
                      onChange={handleMaterialUpload}
                      disabled={uploadingMaterial}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    />
                  </label>
                )}
              </div>

              {materials.length > 0 ? (
                <div className="items-list">
                  {materials.map((material) => (
                    <div key={material._id} className="item-card fade-in">
                      <div className="item-info">
                        <h3>{material.title}</h3>
                        <div className="item-meta">
                          <span className="meta-item">
                            <FiClock /> Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
                          </span>
                          <span className="meta-item">
                            File: {material.filename}
                          </span>
                        </div>
                      </div>
                      <div className="item-actions">
                        <button 
                          onClick={() => handleDownloadMaterial(material._id, material.filename)}
                          className="btn btn-outline btn-sm"
                        >
                          <FiDownload /> Download
                        </button>
                        {user?.role === 'student' && (
                          <button
                            onClick={() => handleSummarize(material._id, material.title)}
                            className="btn btn-outline btn-sm"
                            style={{ marginLeft: 8 }}
                          >
                            Summary
                          </button>
                        )}
                        <button
                          onClick={() => handlePreviewMaterial(material._id, material.filename)}
                          className="btn btn-outline btn-sm"
                          style={{ marginLeft: 8 }}
                        >
                          Preview
                        </button>
                        {isOwner && (
                          <button 
                            onClick={() => handleDeleteMaterial(material._id)}
                            className="btn btn-danger btn-sm"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiUpload />
                  <h3>No materials yet</h3>
                  <p>{isOwner ? 'Upload course materials for your students' : 'No materials have been uploaded yet'}</p>
                </div>
              )}
            </div>
            )}


            {activeTab === 'announcements' && (
              <div className="announcements-tab">
                <div className="section-header">
                  <h2>Announcements</h2>
                  {isOwner && (
                    <button onClick={fetchAnnouncements} className="btn btn-outline btn-sm">Refresh</button>
                  )}
                </div>

                {isOwner && (
                  <div className="create-announcement card">
                    <input className="form-input" placeholder="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} />
                    <textarea className="form-textarea" placeholder="Message" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-primary" onClick={async () => {
                        try {
                          await api.post(`/courses/${id}/notify`, { title: newAnnouncement.title, message: newAnnouncement.message });
                          setNewAnnouncement({ title: '', message: '' });
                          fetchAnnouncements();
                          toast.success('Announcement sent');
                        } catch (err) {
                          toast.error('Failed to send announcement');
                        }
                      }}>Send Announcement</button>
                    </div>
                  </div>
                )}

                {announcements.length > 0 ? (
                  <div className="items-list">
                    {announcements.map(a => (
                      <div key={a._id} className="item-card fade-in">
                        <div className="item-info">
                          <h3>{a.title}</h3>
                          <p>{a.message}</p>
                          <small>{new Date(a.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No announcements yet</h3>
                  </div>
                )}
              </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="syllabus-tab">
              <div className="section-header">
                <h2>Syllabus</h2>
              </div>
              {course.modules?.length > 0 ? (
                <div className="items-list">
                  {course.modules.map((mod, idx) => (
                    <div key={idx} className="item-card fade-in">
                      <div className="item-info">
                        <h3>{mod.title} {mod.completed && <span className="badge badge-success">Completed</span>}</h3>
                        <p>{mod.content}</p>
                      </div>
                      <div className="item-actions">
                        {isOwner ? (
                          // teacher action becomes non-interactive once completed
                          mod.completed ? (
                            <span className="badge badge-success">Completed</span>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={async () => {
                              try {
                                await api.post(`/courses/${id}/modules/${idx}/teacher-complete`);
                                toast.success('Module marked complete');
                                fetchCourseDetails();
                              } catch (err) {
                                toast.error('Failed to mark module complete');
                              }
                            }}>Mark as Completed</button>
                          )
                        ) : (
                          // students cannot mark modules complete; they only see completed label when it's completed
                          isEnrolled ? (
                            completedModules.includes(idx) ? (
                              <span className="badge badge-success">Completed</span>
                            ) : null
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><p>No syllabus modules provided.</p></div>
              )}

              {/* Reviews Section */}
              <div className="reviews-section" style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <div className="section-header">
                  <h2><FiAward /> Reviews & Ratings</h2>
                  {user?.role === 'student' && isEnrolled && (
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)} 
                      className="btn btn-primary btn-sm"
                    >
                      {showReviewForm ? 'Cancel' : 'Write Review'}
                    </button>
                  )}
                </div>

                {/* Rating Summary */}
                <div className="rating-summary card" style={{ marginBottom: '20px' }}>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {course.avgRating ? course.avgRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className={`text-lg ${star <= (course.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {course.ratingCount || 0} review{(course.ratingCount || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex-1">
                      {[5,4,3,2,1].map((rating) => {
                        const count = reviews.filter(r => r.stars === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center space-x-2 mb-1">
                            <span className="text-sm w-6">{rating}★</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && user?.role === 'student' && isEnrolled && (
                  <div className="review-form card" style={{ marginBottom: '20px' }}>
                    <h3>Write a Review</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({...newReview, stars: star})}
                            className={`text-2xl ${star <= newReview.stars ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                      <textarea
                        value={newReview.review}
                        onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                        placeholder="Share your experience with this course..."
                        className="form-textarea"
                        rows="3"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={handleSubmitReview} className="btn btn-primary">
                        Submit Review
                      </button>
                      <button 
                        onClick={() => setShowReviewForm(false)} 
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="review-item card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {review.user?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{review.user?.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[1,2,3,4,5].map((star) => (
                              <span key={star} className={`text-sm ${star <= review.stars ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.review && (
                          <p className="text-gray-700 dark:text-gray-300">{review.review}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <FiAward />
                      <h3>No reviews yet</h3>
                      <p>Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {isOwner && course.enrolledStudents?.length > 0 && (
          <div className="enrolled-students-section">
            <h2><FiUsers /> Enrolled Students</h2>
            <div className="students-list">
              {course.enrolledStudents.map((student) => (
                <div key={student._id} className="student-item">
                  <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-email">{student.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAssignmentModal && (
        <CreateAssignmentModal
          courseId={id}
          onClose={() => setShowAssignmentModal(false)}
          onSuccess={handleAssignmentCreated}
        />
      )}
      {summaryModal.open && (
        <div className="modal-overlay" onClick={() => setSummaryModal({ open: false, text: '', title: '' })}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{summaryModal.title}</h3>
            <div style={{ maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{summaryModal.text}</div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={() => setSummaryModal({ open: false, text: '', title: '' })}>Close</button>
            </div>
          </div>
        </div>
      )}
      {previewModal.open && (
        <div className="modal-overlay" onClick={() => { window.URL.revokeObjectURL(previewModal.url); setPreviewModal({ open: false, url: null, filename: '', mime: '' }); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: 'min(90%, 920px)', position: 'relative' }}>
            <button className="modal-close" style={{ position: 'absolute', right: 12, top: 12 }} onClick={() => { window.URL.revokeObjectURL(previewModal.url); setPreviewModal({ open: false, url: null, filename: '', mime: '' }); }}><FiX /></button>
            <h3 style={{ marginTop: 8 }}>Preview: {previewModal.filename}</h3>
            <div style={{ maxHeight: '70vh', overflow: 'auto', marginTop: 12 }}>
              {previewModal.mime.includes('pdf') ? (
                <object data={previewModal.url} type="application/pdf" width="100%" height="600px">
                  <p>PDF preview is not available. <a href={previewModal.url} target="_blank" rel="noreferrer">Open in new tab</a></p>
                </object>
              ) : previewModal.mime.startsWith('text') ? (
                <iframe src={previewModal.url} title={previewModal.filename} style={{ width: '100%', height: '600px', border: 'none' }} />
              ) : (
                // fallback: use iframe for other file types or allow download
                <iframe src={previewModal.url} title={previewModal.filename} style={{ width: '100%', height: '600px', border: 'none' }} />
              )}
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={() => { window.URL.revokeObjectURL(previewModal.url); setPreviewModal({ open: false, url: null, filename: '', mime: '' }); }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* announcements handled in-tab */}
    </div>
  );
};

export default CourseDetail;
