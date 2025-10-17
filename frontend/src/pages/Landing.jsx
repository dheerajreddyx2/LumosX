import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <div className="landing-container">
          <div className="brand">
            <span className="brand-logo">🎓</span>
            <span className="brand-name">LumosX</span>
          </div>
          <nav className="top-actions">
            <Link to="/register" className="btn btn-outline">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container hero-inner">
          <div className="badge">AI‑Powered Learning Platform</div>
          <h1>
            Learn Smarter <span className="accent">Not Harder</span>
          </h1>
          <p className="subtitle">
            Experience modern education with AI tutoring, gamification, and real‑time collaboration.
          </p>
          <div className="cta-group">
            <Link to="/register" className="btn btn-primary">Start Learning Free</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <span>Built for learners and educators.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
