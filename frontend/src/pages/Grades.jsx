import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiAward, FiTrendingUp, FiFileText } from 'react-icons/fi';
import './Grades.css';

const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const [{ data: subsData }, { data: quizAttempts }] = await Promise.all([
        api.get(`/submissions/student/${user.id}/grades`),
        api.get(`/quizzes/student/${user.id}/attempts`)
      ]);

      const submissions = subsData.data.submissions || [];
      const quizList = (quizAttempts.data || []).map(a => ({
        _id: a._id,
        assignment: { title: `Quiz: ${a.quiz?.title}`, maxPoints: 10, course: a.quiz?.course },
        grade: a.score,
        gradedAt: a.submittedAt
      }));

      setGrades([...submissions, ...quizList].sort((a,b) => new Date(b.gradedAt) - new Date(a.gradedAt)));
      setStats(subsData.data.statistics);
    } catch (error) {
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'var(--success)';
    if (percentage >= 80) return 'var(--info)';
    if (percentage >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="grades-page">
      <div className="container">
        <div className="page-header">
          <h1>My Grades</h1>
          <p>Track your academic performance</p>
        </div>

        {stats && (
          <div className="stats-cards">
            <div className="stat-card fade-in">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiFileText />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalGraded}</div>
                <div className="stat-label">Graded Assignments</div>
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

            <div className="stat-card fade-in">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {stats.averageGrade >= 70 ? 'Passing' : 'Needs Improvement'}
                </div>
                <div className="stat-label">Status</div>
              </div>
            </div>
          </div>
        )}

        {grades.length > 0 ? (
          <div className="grades-table-container">
            <h2>Grade History</h2>
            <div className="grades-table">
              <div className="table-header">
                <div className="table-cell">Assignment</div>
                <div className="table-cell">Course</div>
                <div className="table-cell">Score</div>
                <div className="table-cell">Percentage</div>
                <div className="table-cell">Graded On</div>
              </div>
              {grades.map((submission) => {
                const percentage = (submission.grade / submission.assignment?.maxPoints) * 100;
                return (
                  <div key={submission._id} className="table-row fade-in">
                    <div className="table-cell">
                      <strong>{submission.assignment?.title}</strong>
                    </div>
                    <div className="table-cell">
                      {submission.assignment?.course?.title}
                    </div>
                    <div className="table-cell">
                      <span className="score-badge">
                        {submission.grade}/{submission.assignment?.maxPoints}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            background: getGradeColor(percentage)
                          }}
                        />
                        <span className="percentage-text">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      {new Date(submission.gradedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FiAward />
            <h3>No grades yet</h3>
            <p>Your graded assignments will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;


