import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiAward, FiStar } from 'react-icons/fi';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overall');
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
    if (user?.role === 'student') {
      fetchMyStats();
    }
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const [overallRes, weeklyRes] = await Promise.all([
        api.get('/leaderboard/overall'),
        api.get('/leaderboard/weekly')
      ]);
      setOverallLeaderboard(overallRes.data.data);
      setWeeklyLeaderboard(weeklyRes.data.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStats = async () => {
    try {
      const { data } = await api.get('/leaderboard/me');
      setMyStats(data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiAward />;
    if (rank === 2) return <FiAward />;
    if (rank === 3) return <FiStar />;
    return null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentLeaderboard = activeTab === 'overall' ? overallLeaderboard : weeklyLeaderboard;

  return (
    <div className="leaderboard-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1><FiTrendingUp /> Leaderboard</h1>
            <p>Compete with fellow students and climb the ranks!</p>
          </div>
        </div>

        {user?.role === 'student' && myStats && (
          <div className="my-stats-card">
            <h2>Your Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Overall Rank</div>
                <div className="stat-value">#{myStats.overallRank}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Weekly Rank</div>
                <div className="stat-value">#{myStats.weeklyRank}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Points</div>
                <div className="stat-value">{myStats.totalPoints}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Quiz Points</div>
                <div className="stat-value">{myStats.quizPoints}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Assignment Points</div>
                <div className="stat-value">{myStats.assignmentPoints}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Weekly Points</div>
                <div className="stat-value">{myStats.weeklyPoints}</div>
              </div>
            </div>
          </div>
        )}

        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveTab('overall')}
          >
            <FiAward /> Overall Leaderboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <FiTrendingUp /> Weekly Leaderboard
          </button>
        </div>

        <div className="leaderboard-content">
          {currentLeaderboard.length > 0 ? (
            <>
              {/* Top 3 Students */}
              <div className="top-three">
                {currentLeaderboard.slice(0, 3).map((entry) => (
                  <div 
                    key={entry.rank} 
                    className={`top-card ${getRankClass(entry.rank)} ${entry.rank === 1 ? 'first-place' : ''}`}
                  >
                    <div className="rank-icon">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="rank-number">#{entry.rank}</div>
                    <div className="student-name">{entry.student.name}</div>
                    <div className="points">
                      {activeTab === 'overall' ? entry.totalPoints : entry.weeklyPoints} points
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of the Leaderboard */}
              {currentLeaderboard.length > 3 && (
                <div className="leaderboard-list">
                  <div className="list-header">
                    <div className="col-rank">Rank</div>
                    <div className="col-name">Student</div>
                    <div className="col-points">Points</div>
                  </div>
                  {currentLeaderboard.slice(3).map((entry) => (
                    <div 
                      key={entry.rank} 
                      className={`list-item ${user?.role === 'student' && entry.student._id === user?.id ? 'highlighted' : ''}`}
                    >
                      <div className="col-rank">#{entry.rank}</div>
                      <div className="col-name">
                        <div className="name">{entry.student.name}</div>
                        {user?.role === 'student' && entry.student._id === user?.id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                      <div className="col-points">
                        {activeTab === 'overall' ? entry.totalPoints : entry.weeklyPoints}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FiTrendingUp />
              <h3>No data yet</h3>
              <p>Complete quizzes and assignments to earn points and appear on the leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

