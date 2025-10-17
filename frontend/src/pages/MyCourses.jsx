import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiBook, FiUsers, FiPlus, FiUser, FiClock } from 'react-icons/fi';
import CreateCourseModal from '../components/CreateCourseModal';
import './Courses.css';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const { data } = await api.get('/courses/my-courses');
      setCourses(data.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setShowModal(false);
    fetchMyCourses();
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
            <h1>{user?.role === 'teacher' ? 'My Courses' : 'Enrolled Courses'}</h1>
            <p>
              {user?.role === 'teacher' 
                ? 'Manage your created courses' 
                : 'Courses you are currently enrolled in'}
            </p>
          </div>
          {user?.role === 'teacher' && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <FiPlus /> Create Course
            </button>
          )}
        </div>

        {courses.length > 0 ? (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card-full fade-in">
                <div className="course-card-content">
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

                  <Link to={`/courses/${course._id}`} className="btn btn-primary btn-block">
                    {user?.role === 'teacher' ? 'Manage Course' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBook />
            <h3>No courses yet</h3>
            <p>
              {user?.role === 'teacher' 
                ? 'Create your first course to get started' 
                : 'You are not enrolled in any courses yet'}
            </p>
            {user?.role === 'teacher' ? (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <FiPlus /> Create Course
              </button>
            ) : (
              <Link to="/courses" className="btn btn-primary">
                Browse Courses
              </Link>
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

export default MyCourses;


