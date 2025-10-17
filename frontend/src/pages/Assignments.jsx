import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiFileText, FiClock, FiCheck } from 'react-icons/fi';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';
import GradeSubmissionModal from '../components/GradeSubmissionModal';
import './Assignments.css';

const Assignments = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const assignmentId = location.state?.assignmentId;

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    } else {
      setLoading(false);
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      const assignmentRes = await api.get(`/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data.data);

      if (user?.role === 'teacher') {
        const submissionsRes = await api.get(`/submissions/assignment/${assignmentId}`);
        setSubmissions(submissionsRes.data.data);
      } else {
        try {
          const mySubmissionRes = await api.get(`/submissions/assignment/${assignmentId}/my-submission`);
          setMySubmission(mySubmissionRes.data.data);
        } catch (error) {
          // No submission yet
          setMySubmission(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSuccess = () => {
    setShowSubmitModal(false);
    fetchAssignmentDetails();
  };

  const handleGradeSuccess = () => {
    setSelectedSubmission(null);
    fetchAssignmentDetails();
  };

  const handleDownloadSubmission = async (submissionId, filename) => {
    try {
      const response = await api.get(`/submissions/${submissionId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'submission');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      toast.error('Failed to download submission file');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!assignmentId || !assignment) {
    return (
      <div className="assignments-page">
        <div className="container">
          <div className="empty-state">
            <FiFileText />
            <h3>No assignment selected</h3>
            <p>Please select an assignment from a course page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="container">
        <div className="assignment-header-card">
          <div className="assignment-header-content">
            <h1>{assignment.title}</h1>
            <p>{assignment.description}</p>
            
            <div className="assignment-details">
              <div className="detail-item">
                <FiClock />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <FiFileText />
                <span>Max Points: {assignment.maxPoints}</span>
              </div>
            </div>

            {user?.role === 'student' && !mySubmission && (
              <button 
                onClick={() => setShowSubmitModal(true)} 
                className="btn btn-primary assignment-action-btn"
              >
                Submit Assignment
              </button>
            )}

            {user?.role === 'student' && mySubmission && (
              <div className="submission-status">
                <FiCheck className="check-icon" />
                <div>
                  <strong>Submitted</strong>
                  <p>on {new Date(mySubmission.submittedAt).toLocaleString()}</p>
                  {mySubmission.status === 'graded' && (
                    <p className="grade-display">
                      Grade: <strong>{mySubmission.grade}/{assignment.maxPoints}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {user?.role === 'student' && mySubmission && (
          <div className="submission-card">
            <h2>Your Submission</h2>
            <div className="submission-content">
              <p>{mySubmission.content}</p>
            </div>
            
            {mySubmission.status === 'graded' && (
              <div className="grade-section">
                <h3>Grade & Feedback</h3>
                <div className="grade-info">
                  <div className="grade-score">
                    {mySubmission.grade}/{assignment.maxPoints}
                  </div>
                  <div className="grade-percentage">
                    ({((mySubmission.grade / assignment.maxPoints) * 100).toFixed(1)}%)
                  </div>
                </div>
                {mySubmission.feedback && (
                  <div className="feedback">
                    <strong>Feedback:</strong>
                    <p>{mySubmission.feedback}</p>
                  </div>
                )}
                {!mySubmission.reevalRequested && (
                  <button
                    className="btn btn-warning"
                    style={{marginTop: '18px'}}
                    onClick={async () => {
                      try {
                        await api.post(`/submissions/${mySubmission._id}/request-reevaluation`);
                        toast.success('Re-evaluation requested!');
                        fetchAssignmentDetails();
                      } catch (error) {
                        toast.error(error.response?.data?.message || 'Failed to request re-evaluation');
                      }
                    }}
                  >
                    Request Re-evaluation
                  </button>
                )}
                {mySubmission.reevalRequested && (
                  <div style={{marginTop: '18px', color: '#b8860b'}}>
                    <strong>Re-evaluation requested. Waiting for teacher's response.</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {user?.role === 'teacher' && (
          <div className="submissions-section">
            <h2>Student Submissions ({submissions.length})</h2>
            
            {submissions.length > 0 ? (
              <div className="submissions-grid">
                {submissions.map((submission) => (
                  <div key={submission._id} className="submission-item fade-in">
                    <div className="submission-header">
                      <h3>{submission.student?.name}</h3>
                      <span className={`badge ${submission.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <p className="submission-excerpt">{submission.content}</p>
                    
                    <div className="submission-footer">
                      <span className="submission-date">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>

                      <div className="submission-actions">
                        {submission.status === 'graded' && !submission.reevalRequested ? (
                          <span className="grade-badge">
                            Grade: {submission.grade}/{assignment.maxPoints}
                          </span>
                        ) : (
                          <button 
                            onClick={() => setSelectedSubmission(submission)}
                            className="btn btn-primary btn-sm"
                          >
                            Grade Submission
                          </button>
                        )}
                        {submission.reevalRequested && (
                          <span style={{color: '#f093fb', fontWeight: 'bold'}}>Re-eval requested</span>
                        )}
                        {submission.filepath && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => handleDownloadSubmission(submission._id, submission.filename)}>
                              Download File
                            </button>
                            <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={async () => {
                              try {
                                const resp = await api.get(`/submissions/${submission._id}/download`, { responseType: 'blob' });
                                const mime = resp.headers['content-type'] || resp.data.type || '';
                                const url = window.URL.createObjectURL(new Blob([resp.data], { type: mime }));
                                // open grade modal and attach preview url onto selected submission
                                setSelectedSubmission({ ...submission, previewUrl: url, previewMime: mime });
                              } catch (err) {
                                toast.error('Failed to fetch file for preview');
                              }
                            }}>
                              Preview File
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiFileText />
                <h3>No submissions yet</h3>
                <p>No students have submitted this assignment</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showSubmitModal && (
        <SubmitAssignmentModal
          assignmentId={assignmentId}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      {selectedSubmission && (
        <GradeSubmissionModal
          submission={selectedSubmission}
          maxPoints={assignment.maxPoints}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  );
};

export default Assignments;


