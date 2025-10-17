import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiBook, FiBell, FiLogOut, FiUser, FiHome, FiAward, FiSun, FiMoon, FiMessageSquare, FiTrendingUp, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const notifRef = useRef();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications');
      // Use backend unreadCount for badge
      setUnreadCount(data.data.unreadCount);
      setRecentNotifications(data.data.notifications.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  // hide app navbar for unauthenticated users (landing has its own)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <FiBook className="brand-icon" />
          <span>LumosX</span>
        </Link>

            <div className="navbar-menu">
              <Link to="/home" className={`nav-link ${isActive('/home')}`}>
                <FiHome /> Dashboard
              </Link>
              <Link to="/courses" className={`nav-link ${isActive('/courses')}`}> 
                <FiBook /> Courses
              </Link>
              {user?.role === 'student' && (
                <Link to="/grades" className={`nav-link ${isActive('/grades')}`}> 
                  <FiAward /> Grades
                </Link>
              )}
              <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}> 
                <FiTrendingUp /> Leaderboard
              </Link>
              <Link to="/forum" className={`nav-link ${isActive('/forum')}`}> 
                <FiMessageSquare /> Forum
              </Link>
            </div>

            <div className="navbar-right">
              <button 
                className="icon-btn theme-toggle" 
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <FiSun /> : <FiMoon />}
              </button>

              <div className="notification-wrapper" ref={notifRef}>
                <button 
                  className="icon-btn notification-btn" 
                  onClick={handleNotificationClick}
                  title="Notifications"
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="unread-count">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="notification-list">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => {
                          const isReeval = notification.type === 'reevaluation';
                          return (
                            <div 
                              key={notification._id} 
                              className={`notification-item ${!notification.read ? 'unread' : ''} ${isReeval ? 'reeval-notification' : ''}`}
                              style={isReeval ? { borderLeft: '4px solid #f093fb', background: '#fff7f0' } : {}}
                            >
                              <div className="notification-main">
                                <div className="notification-text">
                                  <p>
                                    {isReeval ? <span style={{color:'#f093fb',fontWeight:'bold'}}>Re-evaluation Request: </span> : null}
                                    {notification.message}
                                  </p>
                                  {notification.courseTitle && (
                                    <div className="notification-course">From: {notification.courseTitle}</div>
                                  )}
                                </div>
                              </div>

                              <div className="notification-actions" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start'}}>
                                <span className="notification-time">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                                <div style={{display:'flex',gap:'8px'}}>
                                  {!notification.read && (
                                    <button 
                                      className="icon-btn mark-read-btn" 
                                      title="Mark as read"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          // optimistic update
                                          setRecentNotifications((prev) => prev.map(n => n._id === notification._id ? {...n, read: true} : n));
                                          setUnreadCount((c) => Math.max(0, c - 1));
                                          await api.put(`/notifications/${notification._id}/read`);
                                        } catch (err) {
                                          fetchUnreadCount();
                                        }
                                      }}
                                    >
                                      <FiCheckCircle style={{color:'#43e97b',fontSize:'18px'}} />
                                    </button>
                                  )}
                                  <button 
                                    className="icon-btn delete-btn" 
                                    title="Delete notification"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        // optimistic remove from preview
                                        setRecentNotifications((prev) => prev.filter(n => n._id !== notification._id));
                                        // if it was unread, decrement badge
                                        if (!notification.read) setUnreadCount((c) => Math.max(0, c - 1));
                                        await api.delete(`/notifications/${notification._id}`);
                                      } catch (err) {
                                        fetchUnreadCount();
                                      }
                                    }}
                                  >
                                    <FiTrash2 style={{color:'#f5576c',fontSize:'18px'}} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="empty-notifications">
                          <FiBell />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                    <button 
                      className="view-all-btn" 
                      onClick={handleViewAllNotifications}
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>

              <div className="user-info" style={{cursor: 'pointer'}} onClick={() => navigate(`/profile/${user.id}`)}>
                <FiUser className="user-icon" />
                <div className="user-details">
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role">{user?.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
                <FiLogOut /> Logout
              </button>
            </div>
      </div>
    </nav>
  );
};

export default Navbar;


