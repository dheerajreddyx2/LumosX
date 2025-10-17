import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';
import './Submissions.css';

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    try {
      const { data } = await api.get('/submissions/student/my-submissions');
      setSubmissions(data.data);
    } catch (error) {
      toast.error('Failed to load submissions');
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
    <div className="submissions-page">
      <div className="container">
        <div className="page-header">
          <h1>My Submissions</h1>
          <p>Track all your assignment submissions and grades</p>
        </div>

        {submissions.length > 0 ? (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div key={submission._id} className="submission-card-item fade-in">
                <div className="submission-card-header">
                  <div>
                    <h3>{submission.assignment?.title}</h3>
                    <p className="course-name">{submission.assignment?.course?.title}</p>
                  </div>
                  <span className={`badge ${submission.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                    {submission.status}
                  </span>
                </div>

                <div className="submission-card-content">
                  <p>{submission.content}</p>
                </div>

                <div className="submission-card-footer">
                  <div className="footer-info">
                    <div className="info-item">
                      <FiClock />
                      <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {submission.status === 'graded' && (
                      <div className="info-item">
                        <FiCheckCircle />
                        <span>Graded: {new Date(submission.gradedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {submission.status === 'graded' && (
                    <div className="grade-display-card">
                      <div className="grade-value">
                        {submission.grade}/{submission.assignment?.maxPoints}
                      </div>
                      <div className="grade-percent">
                        {((submission.grade / submission.assignment?.maxPoints) * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {submission.status === 'graded' && submission.feedback && (
                  <div className="feedback-section">
                    <strong>Feedback:</strong>
                    <p>{submission.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiFileText />
            <h3>No submissions yet</h3>
            <p>You haven't submitted any assignments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;


