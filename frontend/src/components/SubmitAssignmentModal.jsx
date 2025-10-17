import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FiX, FiUpload, FiFile } from 'react-icons/fi';
import './Modal.css';

const SubmitAssignmentModal = ({ assignmentId, onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF and image files (JPG, PNG) are allowed');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !file) {
      return toast.error('Please provide either text content or upload a file');
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('assignment', assignmentId);
      formData.append('content', content || 'File submission');
      if (file) {
        formData.append('file', file);
      }

      await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Assignment submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Submit Assignment</h2>
          <button onClick={onClose} className="modal-close">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Text Submission (Optional)</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your assignment submission here..."
              rows="6"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiUpload /> Upload File (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="form-input"
            />
            {file && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <FiFile />
                <span>{file.name}</span>
              </div>
            )}
            <small style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'block', marginTop: '8px' }}>
              Accepted formats: PDF, JPG, PNG (Max 5MB)
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignmentModal;


