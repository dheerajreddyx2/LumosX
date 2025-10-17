import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const CreateCourseModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: ''
  });
  const [modules, setModules] = useState([
    { title: '', content: '', order: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModuleChange = (index, field, value) => {
    const copy = [...modules];
    copy[index][field] = value;
    setModules(copy);
  };

  const addModule = () => {
    setModules([...modules, { title: '', content: '', order: modules.length }]);
  };

  const removeModule = (index) => {
    const copy = modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i }));
    setModules(copy.length ? copy : [{ title: '', content: '', order: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // include modules in payload
      const payload = { ...formData, modules };
      await api.post('/courses', payload);
      toast.success('Course created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button onClick={onClose} className="modal-close">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to React"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <input
              type="text"
              name="duration"
              className="form-input"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 8 weeks, 3 months"
              required
            />
          </div>

          <div className="form-group modules-section">
            <label className="form-label">Modules (Syllabus)</label>
            {modules.map((mod, idx) => (
              <div key={idx} className="module-item">
                <input
                  type="text"
                  className="form-input module-title"
                  placeholder={`Module ${idx + 1} title`}
                  value={mod.title}
                  onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                  required
                />
                <textarea
                  className="form-textarea module-content"
                  placeholder={`Module ${idx + 1} content / syllabus`}
                  value={mod.content}
                  onChange={(e) => handleModuleChange(idx, 'content', e.target.value)}
                  required
                />
                <div className="module-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => removeModule(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addModule} style={{ marginTop: 10 }}>Add Module</button>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;


