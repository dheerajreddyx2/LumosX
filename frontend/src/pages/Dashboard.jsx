import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiBook, FiFileText, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    submissions: 0,
    averageGrade: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, notificationsRes] = await Promise.all([
        api.get('/courses/my-courses'),
        api.get('/notifications')
      ]);

      const courses = coursesRes.data.data;
      setRecentCourses(courses.slice(0, 3));

      if (user?.role === 'teacher') {
        const totalStudents = courses.reduce((sum, course) => 
          sum + (course.enrolledStudents?.length || 0), 0
        );
        setStats({
          courses: courses.length,
          students: totalStudents,
          notifications: notificationsRes.data.data.unreadCount
        });
      } else {
        const gradesRes = await api.get(`/submissions/student/${user.id}/grades`);
        setStats({
          courses: courses.length,
          submissions: gradesRes.data.data.submissions.length,
          averageGrade: gradesRes.data.data.statistics.averageGrade,
          notifications: notificationsRes.data.data.unreadCount
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Here's what's happening with your learning today</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card fade-in">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <FiBook />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.courses}</div>
              <div className="stat-label">{user?.role === 'teacher' ? 'Courses Created' : 'Enrolled Courses'}</div>
            </div>
          </div>

          {user?.role === 'teacher' ? (
            <div className="stat-card fade-in">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FiUsers />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.students}</div>
                <div className="stat-label">Total Students</div>
              </div>
            </div>
          ) : (
            <>
              <div className="stat-card fade-in">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FiFileText />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.submissions}</div>
                  <div className="stat-label">Submissions</div>
                </div>
              </div>

              <div className="stat-card fade-in">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <FiAward />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.averageGrade}%</div>
                  <div className="stat-label">Average Grade</div>
                </div>
              </div>
            </>
          )}

        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>{user?.role === 'teacher' ? 'Your Courses' : 'Recent Courses'}</h2>
            <Link to="/my-courses" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {recentCourses.length > 0 ? (
            <div className="courses-grid">
              {recentCourses.map((course) => (
                <Link to={`/courses/${course._id}`} key={course._id} className="course-card fade-in">
                  <div className="course-card-header">
                    <h3>{course.title}</h3>
                    <span className="badge badge-primary">{course.duration}</span>
                  </div>
                  <p className="course-description">{course.description}</p>
                  <div className="course-footer">
                    {user?.role === 'teacher' ? (
                      <div className="course-meta">
                        <FiUsers /> {course.enrolledStudents?.length || 0} students
                      </div>
                    ) : (
                      <div className="course-meta">
                        <FiBook /> {course.teacher?.name}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiBook />
              <h3>No courses yet</h3>
              <p>{user?.role === 'teacher' ? 'Create your first course to get started' : 'Enroll in courses to start learning'}</p>
              <Link to="/courses" className="btn btn-primary">
                {user?.role === 'teacher' ? 'Create Course' : 'Browse Courses'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


