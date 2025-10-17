import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingField, setEditingField] = useState(null); // field key being edited
  const [form, setForm] = useState({});
  const fieldRefs = useRef({});

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${id}`);
      setUser(data.data);
      setForm({
        name: data.data.name || '',
        email: data.data.email || '',
        college: data.data.college || '',
        experience: data.data.experience || '',
        bio: data.data.bio || '',
        location: data.data.location || '',
        phone: data.data.phone || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/${id}`, form);
      toast.success('Profile updated');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const startEdit = (field) => {
    setEditingField(field);
    setEditing(true);
    // focus will be handled in effect when editingField updates
  };

  // Focus the input/textarea when editingField changes
  useEffect(() => {
    if (editingField) {
      const ref = fieldRefs.current[editingField];
      if (ref && ref.focus) {
        // Slight delay to ensure element is rendered
        setTimeout(() => ref.focus(), 50);
      }
    }
  }, [editingField]);

  const cancelEdit = (field) => {
    // revert the form value to user value
    setForm((prev) => ({ ...prev, [field]: user[field] || '' }));
    setEditingField(null);
    setEditing(false);
  };

  const saveField = async (field) => {
    try {
      const payload = { [field]: form[field] };
      await api.put(`/users/${id}`, payload);
      toast.success('Field updated');
      setEditingField(null);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update field');
    }
  };

  if (!user) return <div className="loading"><div className="spinner"/></div>;

  const isStudent = user.role === 'student';

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card wide">
          <div className="profile-header">
            <div>
              <h1>{user.name}</h1>
              <p className="role">{user.role}</p>
            </div>
          </div>
          <div className="profile-boxes">
            {/* Badges box */}
            {user.badges && user.badges.length > 0 && (
              <div className="profile-box">
                <div className="box-main">
                  <div>
                    <div className="box-label">Badges</div>
                    <div className="box-value">
                      <div className="badges-list">
                        {user.badges.map((b, i) => (
                          <div key={i} className="badge badge-primary" title={b.title}>
                            {b.title} <small style={{marginLeft:8, opacity:0.8}}>{new Date(b.awardedAt).toLocaleDateString()}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Name box */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">Name</div>
                  {!editingField || editingField !== 'name' ? (
                    <div className="box-value">{user.name || '—'}</div>
                  ) : (
                    <input ref={(el) => fieldRefs.current['name'] = el} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== 'name' ? (
                    <button className="icon-btn small" onClick={() => startEdit('name')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit('name')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField('name')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Email box */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">Email</div>
                  {!editingField || editingField !== 'email' ? (
                    <div className="box-value">{user.email || '—'}</div>
                  ) : (
                    <input ref={(el) => fieldRefs.current['email'] = el} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== 'email' ? (
                    <button className="icon-btn small" onClick={() => startEdit('email')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit('email')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField('email')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Role-specific field */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">{isStudent ? 'College' : 'Experience'}</div>
                  {!editingField || editingField !== (isStudent ? 'college' : 'experience') ? (
                    <div className="box-value">{isStudent ? (user.college || '—') : (user.experience || '—')}</div>
                  ) : (
                    <input ref={(el) => fieldRefs.current[isStudent ? 'college' : 'experience'] = el} value={isStudent ? form.college : form.experience} onChange={(e) => setForm({...form, [isStudent ? 'college' : 'experience']: e.target.value})} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== (isStudent ? 'college' : 'experience') ? (
                    <button className="icon-btn small" onClick={() => startEdit(isStudent ? 'college' : 'experience')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit(isStudent ? 'college' : 'experience')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField(isStudent ? 'college' : 'experience')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Phone box */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">Phone</div>
                  {!editingField || editingField !== 'phone' ? (
                    <div className="box-value">{user.phone || '—'}</div>
                  ) : (
                    <input ref={(el) => fieldRefs.current['phone'] = el} value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== 'phone' ? (
                    <button className="icon-btn small" onClick={() => startEdit('phone')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit('phone')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField('phone')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location box */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">Location</div>
                  {!editingField || editingField !== 'location' ? (
                    <div className="box-value">{user.location || '—'}</div>
                  ) : (
                    <input ref={(el) => fieldRefs.current['location'] = el} value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== 'location' ? (
                    <button className="icon-btn small" onClick={() => startEdit('location')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit('location')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField('location')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bio box */}
            <div className="profile-box">
              <div className="box-main">
                <div>
                  <div className="box-label">Bio</div>
                  {!editingField || editingField !== 'bio' ? (
                    <div className="box-value bio">{user.bio || '—'}</div>
                  ) : (
                    <textarea ref={(el) => fieldRefs.current['bio'] = el} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={4} />
                  )}
                </div>
                <div className="box-actions">
                  {!editingField || editingField !== 'bio' ? (
                    <button className="icon-btn small" onClick={() => startEdit('bio')}><FiEdit2/></button>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelEdit('bio')}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => saveField('bio')} style={{marginLeft:8}}>Save</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
