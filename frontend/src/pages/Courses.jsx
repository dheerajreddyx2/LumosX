import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiBook, FiPlus, FiUsers, FiClock, FiCheckCircle, FiUser, FiSearch } from 'react-icons/fi';
import CreateCourseModal from '../components/CreateCourseModal';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      const allCourses = data.data;
      
      if (user?.role === 'student') {
        // Separate enrolled courses (my courses) from all courses
        const enrolled = allCourses.filter(course => 
          course.enrolledStudents?.some(s => s._id === user?.id)
        );
        const notEnrolled = allCourses.filter(course => 
          !course.enrolledStudents?.some(s => s._id === user?.id)
        );
        setMyCourses(enrolled);
        setCourses(notEnrolled);
        // fetch progress for enrolled courses
        enrolled.forEach(async (course) => {
          try {
            const { data: prog } = await api.get(`/courses/${course._id}/progress`);
            course.progressPercent = prog.data.percent || 0;
          } catch (err) { course.progressPercent = 0; }
        });
      } else {
        // For teachers, show all courses they teach as "My Courses"
        const teacherCourses = allCourses.filter(course => course.teacher?._id === user?.id);
        // Show ALL other courses (teachers can see all courses in the system)
        const otherCourses = allCourses.filter(course => course.teacher?._id !== user?.id);
        setMyCourses(teacherCourses);
        setCourses(otherCourses);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setShowModal(false);
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Courses</h1>
            <p>Explore and enroll in available courses</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="courses-search">
              <FiSearch style={{ color: 'var(--gray)' }} />
              <input
                placeholder="Search courses, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ width: 300, marginLeft: 8 }}
              />
            </div>
            {user?.role === 'teacher' && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <FiPlus /> Create Course
              </button>
            )}
          </div>
        </div>

        {/* My Courses Section */}
        {myCourses.length > 0 && (
          <div className="courses-section">
            <div className="section-header">
              <h2>
                <FiCheckCircle /> My Courses
              </h2>
              <p>{myCourses.length} {user?.role === 'student' ? 'enrolled' : 'created'}</p>
            </div>
            <div className="courses-grid">
              {myCourses
                .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.teacher?.name || '').toLowerCase().includes(search.toLowerCase()))
                .map((course) => (
                <div key={course._id} className="course-card-full fade-in enrolled-course">
                  <div className="course-card-content">
                    <div className="course-card-full-header">
                      <h3>{course.title}</h3>
                      <span className="badge badge-success">
                        {user?.role === 'student' ? 'Enrolled' : 'Your Course'}
                      </span>
                    </div>
                    <p className="course-description">{course.description}</p>
                    <div className="course-info">
                      <div className="info-item">
                        <FiUser />
                        <span className="teacher-name">
                          <strong>Instructor:</strong> {course.teacher?.name || 'Not Assigned'}
                        </span>
                      </div>
                      <div className="info-item">
                        <FiUsers />
                        <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                      </div>
                      <div className="info-item">
                        <FiClock />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="star-icon">⭐</span>
                      <span><strong>Rating:</strong> {course.avgRating ? course.avgRating.toFixed(1) : '0.0'} / 5 ({course.ratingCount || 0} review{(course.ratingCount || 0) !== 1 ? 's' : ''})</span>
                    </div>
                    <Link to={`/courses/${course._id}`} className="btn btn-primary btn-block">
                      {user?.role === 'student' ? 'Continue Learning' : 'Manage Course'}
                    </Link>
                    {user?.role === 'teacher' && (
                      <button onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this course?')) return;
                        try {
                          await api.delete(`/courses/${course._id}`);
                          window.location.reload();
                        } catch (error) {
                          alert('Failed to delete course');
                        }
                      }} className="btn btn-danger" style={{marginTop: '10px'}}>
                        Delete Course
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section (hidden for teachers) */}
        {user?.role !== 'teacher' && (
          <div className="courses-section">
            <div className="section-header">
              <h2>
                <FiBook /> All Courses
              </h2>
              <p>{courses.length} available</p>
            </div>
            
            {courses.length > 0 ? (
              <div className="courses-grid">
                  {courses
                    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.teacher?.name || '').toLowerCase().includes(search.toLowerCase()))
                    .map((course) => (
                  <div key={course._id} className="course-card-full fade-in">
                    <div className="course-card-full-header">
                      <h3>{course.title}</h3>
                      <span className="badge badge-primary">{course.duration}</span>
                    </div>
                    
                    <p className="course-description">{course.description}</p>
                    
                    <div className="course-info">
                      <div className="info-item">
                        <FiUser />
                        <span className="teacher-name">
                          <strong>Instructor:</strong> {course.teacher?.name || 'Not Assigned'}
                        </span>
                      </div>
                      <div className="info-item">
                        <FiUsers />
                        <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                      </div>
                      <div className="info-item">
                        <FiClock />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="star-icon">⭐</span>
                      <span><strong>Rating:</strong> {course.avgRating ? course.avgRating.toFixed(1) : '0.0'} / 5 ({course.ratingCount || 0} review{(course.ratingCount || 0) !== 1 ? 's' : ''})</span>
                    </div>

                    <Link to={`/courses/${course._id}`} className="btn btn-outline btn-block">
                      {user?.role === 'teacher' ? 'View & Manage' : 'View Course'}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiBook />
                <h3>No other courses available</h3>
                <p>{user?.role === 'teacher' ? 'All available courses are shown above' : 'Check back later for new courses'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}
    </div>
  );
};

export default Courses;


