import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Please enter your email');
    }

    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      
      setSuccess(true);
      setResetToken(data.data.resetToken);
      toast.success('Password reset link generated!');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="success-icon">
                <FiCheckCircle />
              </div>
              <h1>Check Your Email</h1>
              <p>We've sent password reset instructions to your email</p>
            </div>

            <div className="reset-info">
              <div className="info-box">
                <h3>📧 What's Next?</h3>
                <ol>
                  <li>Check your email inbox</li>
                  <li>Click the reset link (or copy the token below)</li>
                  <li>Enter your new password</li>
                  <li>Login with your new password</li>
                </ol>
              </div>

              <div className="token-box">
                <p><strong>Demo Mode:</strong> In production, you'd receive an email. For now, use this token:</p>
                <div className="token-display">
                  <code>{resetToken}</code>
                </div>
                <Link to={`/reset-password/${resetToken}`} className="btn btn-primary btn-block">
                  Reset Password Now
                </Link>
              </div>

              <div className="info-note">
                <p>⏰ This link will expire in 10 minutes</p>
                <p>❌ Didn't receive anything? <button onClick={() => setSuccess(false)} className="link-btn">Try again</button></p>
              </div>
            </div>

            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password?</h1>
            <p>No worries! Enter your email and we'll send you reset instructions</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FiMail /> Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

