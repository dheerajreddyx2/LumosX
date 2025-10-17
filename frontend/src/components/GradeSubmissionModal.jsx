import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const GradeSubmissionModal = ({ submission, maxPoints, onClose, onSuccess }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > maxPoints) {
      return toast.error(`Grade must be between 0 and ${maxPoints}`);
    }

    setLoading(true);

    try {
      await api.put(`/submissions/${submission._id}/grade`, {
        grade: gradeNum,
        feedback
      });
      toast.success('Submission graded successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Grade Submission</h2>
          <button onClick={onClose} className="modal-close">
            <FiX />
          </button>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ 
            background: 'var(--light)', 
            padding: '16px', 
            borderRadius: 'var(--border-radius)',
            marginBottom: '24px'
          }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>
              Student: {submission.student?.name}
            </strong>
            <p style={{ color: 'var(--gray)', fontSize: '14px', lineHeight: '1.6' }}>
              {submission.content}
            </p>
            {submission.previewUrl && (
              <div style={{ marginTop: 12 }}>
                <h4>File Preview</h4>
                {submission.previewMime && submission.previewMime.includes('pdf') ? (
                  <object data={submission.previewUrl} type="application/pdf" width="100%" height="360px">
                    <p>Preview not available. <a href={submission.previewUrl} target="_blank" rel="noreferrer">Open in new tab</a></p>
                  </object>
                ) : (
                  <iframe src={submission.previewUrl} title="submission-preview" style={{ width: '100%', height: '360px', border: 'none' }} />
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          <div className="form-group">
            <label className="form-label">Grade (out of {maxPoints})</label>
            <input
              type="number"
              className="form-input"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max={maxPoints}
              placeholder="Enter grade"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Feedback (Optional)</label>
            <textarea
              className="form-textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows="5"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Grading...' : 'Submit Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeSubmissionModal;


