import { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const NotifyCourseModal = ({ courseId, onClose, onSent }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Please provide title and message');
    setLoading(true);
    try {
      await api.post(`/courses/${courseId}/notify`, { title, message });
      toast.success('Notification sent to enrolled students');
      onSent && onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Notify Class</h2>
          <button onClick={onClose} className="modal-close"><FiX /></button>
        </div>

        <form onSubmit={handleSend} style={{padding:'0 24px 24px'}}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message to the class..." />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{marginLeft:8}}>{loading ? 'Sending...' : 'Send Notification'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotifyCourseModal;
