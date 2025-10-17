import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiPlus, FiSend, FiUser, FiClock, FiMapPin, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import './Forum.css';

const Forum = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Lumos AI — your course assistant. Ask me anything about the course or platform." }
  ]);
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchPosts();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/my-courses');
      setCourses(data.data);
      if (data.data.length > 0) {
        setSelectedCourse(data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/forum/course/${selectedCourse}`);
      setPosts(data.data);
    } catch (error) {
      toast.error('Failed to load forum posts');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum', {
        courseId: selectedCourse,
        title: newPost.title,
        content: newPost.content
      });
      toast.success('Post created successfully');
      setShowCreatePost(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleReply = async (postId) => {
    if (!replyContent.trim()) return;
    
    try {
      await api.post(`/forum/${postId}/reply`, { content: replyContent });
      toast.success('Reply posted');
      setReplyContent('');
      fetchPosts();
      if (selectedPost) {
        const updatedPost = posts.find(p => p._id === postId);
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handlePinPost = async (postId) => {
    try {
      await api.put(`/forum/${postId}/pin`);
      toast.success('Post pin status updated');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/forum/${postId}`);
      toast.success('Post deleted');
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleAIChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput };
    setAiMessages([...aiMessages, userMessage]);

    try {
      const res = await api.post('/chatbot', { message: aiInput });
      const aiReply = res.data.reply || 'Sorry, I could not process your request.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'AI service error.' }]);
    }
    setAiInput('');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="forum-page">
        <div className="container">
          <div className="empty-state">
            <FiMessageSquare />
            <h3>No courses available</h3>
            <p>Enroll in courses to access their discussion forums</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1><FiMessageSquare /> Discussion Forum</h1>
            <p>Ask questions, share knowledge, and collaborate with peers</p>
          </div>
          <button 
            onClick={() => window.open('https://lumos--ai.created.app', '_blank')} 
            className="btn btn-secondary"
          >
            <FiMessageCircle /> Lumos AI
          </button>
        </div>

        <div className="forum-container">
          <div className="forum-sidebar">
            <div className="course-selector">
              <h3>Select Course</h3>
              {courses.map((course) => (
                <button
                  key={course._id}
                  className={`course-btn ${selectedCourse === course._id ? 'active' : ''}`}
                  onClick={() => setSelectedCourse(course._id)}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>

          <div className="forum-main">
            <div className="forum-header">
              <h2>Discussions</h2>
              <button onClick={() => setShowCreatePost(true)} className="btn btn-primary btn-sm">
                <FiPlus /> New Post
              </button>
            </div>

            {showCreatePost && (
              <form onSubmit={handleCreatePost} className="create-post-form">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="form-textarea"
                  required
                />
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Post</button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreatePost(false)} 
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="posts-list">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div 
                    key={post._id} 
                    className={`post-item ${post.isPinned ? 'pinned' : ''}`}
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.isPinned && (
                      <div className="pinned-badge">
                        <FiMapPin /> Pinned
                      </div>
                    )}
                    <div className="post-header">
                      <h3>{post.title}</h3>
                      <div className="post-meta">
                        <span className="author">
                          <FiUser /> {post.author.name} ({post.author.role})
                        </span>
                        <span className="date">
                          <FiClock /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="replies">
                          <FiMessageSquare /> {post.replies.length} replies
                        </span>
                      </div>
                    </div>
                    <p className="post-preview">{post.content.substring(0, 150)}...</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FiMessageSquare />
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {selectedPost && (
          <div className="post-modal" onClick={() => setSelectedPost(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedPost.title}</h2>
                <div className="modal-actions">
                  {user?.role === 'teacher' && (
                    <button 
                      onClick={() => handlePinPost(selectedPost._id)}
                      className="btn btn-outline btn-sm"
                    >
                      <FiMapPin /> {selectedPost.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {(user?.id === selectedPost.author._id || user?.role === 'teacher') && (
                    <button 
                      onClick={() => handleDeletePost(selectedPost._id)}
                      className="btn btn-danger btn-sm"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  )}
                  <button onClick={() => setSelectedPost(null)} className="btn btn-outline btn-sm">
                    Close
                  </button>
                </div>
              </div>
              
              <div className="post-detail">
                <div className="post-author-info">
                  <FiUser /> {selectedPost.author.name} ({selectedPost.author.role})
                  <span className="separator">•</span>
                  <FiClock /> {new Date(selectedPost.createdAt).toLocaleString()}
                </div>
                <p className="post-content">{selectedPost.content}</p>
              </div>

              <div className="replies-section">
                <h3>Replies ({selectedPost.replies.length})</h3>
                <div className="replies-list">
                  {selectedPost.replies.map((reply, idx) => (
                    <div key={idx} className="reply-item">
                      <div className="reply-author">
                        <FiUser /> {reply.author.name} ({reply.author.role})
                        <span className="reply-date">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>

                <div className="reply-form">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="form-textarea"
                  />
                  <button 
                    onClick={() => handleReply(selectedPost._id)}
                    className="btn btn-primary"
                  >
                    <FiSend /> Post Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;

