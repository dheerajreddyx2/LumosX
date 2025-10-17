import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import './Quiz.css';

const Quiz = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchQuiz();
    if (user?.role === 'student') {
      checkAttempt();
    } else {
      fetchAttempts();
    }
  }, [id]);

  useEffect(() => {
    if (taking && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (taking && timeLeft === 0) {
      handleSubmit();
    }
  }, [taking, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      setQuiz(data.data);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkAttempt = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}/attempts`);
      if (data.data && data.data.length > 0) {
        setAttempts(data.data);
      }
    } catch (error) {
      console.error('Failed to check attempt');
    }
  };

  const fetchAttempts = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}/attempts`);
      setAttempts(data.data);
    } catch (error) {
      console.error('Failed to load attempts');
    }
  };

  const startQuiz = () => {
    setTaking(true);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
    setCurrentAnswers({});
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setCurrentAnswers({
      ...currentAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleSubmit = async () => {
    try {
      const answers = Object.keys(currentAnswers).map(qIndex => ({
        questionIndex: parseInt(qIndex),
        selectedAnswer: currentAnswers[qIndex]
      }));

      await api.post(`/quizzes/${id}/attempt`, { answers });
      toast.success('Quiz submitted successfully!');
      setTaking(false);
      checkAttempt();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) return null;

  const hasAttempted = attempts.length > 0;
  const studentAttempt = hasAttempted ? attempts[0] : null;

  return (
    <div className="quiz-page">
      <div className="container">
        {!taking ? (
          <div className="quiz-overview">
            <div className="quiz-header">
              <h1>{quiz.title}</h1>
              <p>{quiz.description}</p>
              
              <div className="quiz-info">
                <div className="info-item">
                  <FiClock />
                  <span>Duration: {quiz.duration} minutes</span>
                </div>
                <div className="info-item">
                  <FiCheckCircle />
                  <span>Total Points: {quiz.totalPoints}/10</span>
                </div>
                <div className="info-item">
                  <FiAlertTriangle />
                  <span>Questions: {quiz.questions?.length || 0}</span>
                </div>
              </div>
            </div>

            {user?.role === 'student' && (
              <div className="quiz-action">
                {hasAttempted ? (
                  <div className="attempt-result">
                    <h2>Your Result</h2>
                    <div className="score-display">
                      <div className="score">{studentAttempt.score}/10</div>
                      <div className="score-details">
                        <p>Correct Answers: {studentAttempt.correctAnswers}/{studentAttempt.totalQuestions}</p>
                        <p>Submitted: {new Date(studentAttempt.submittedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>Ready to take the quiz?</h2>
                    <p>You have {quiz.duration} minutes to complete this quiz. Once you start, the timer cannot be paused.</p>
                    <button onClick={startQuiz} className="btn btn-primary btn-eq-large">
                      Start Quiz
                    </button>
                  </>
                )}
              </div>
            )}

            {user?.role === 'teacher' && (
              <div className="attempts-list">
                <h2>Student Attempts ({attempts.length})</h2>
                {attempts.length > 0 ? (
                  <div className="attempts-grid">
                    {attempts.map((attempt) => (
                      <div key={attempt._id} className="attempt-card">
                        <div className="student-info">
                          <h3>{attempt.student.name}</h3>
                          <p>{attempt.student.email}</p>
                        </div>
                        <div className="attempt-stats">
                          <div className="stat">
                            <span className="label">Score</span>
                            <span className="value">{attempt.score}/10</span>
                          </div>
                          <div className="stat">
                            <span className="label">Correct</span>
                            <span className="value">{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                          </div>
                        </div>
                        <div className="attempt-date">
                          {new Date(attempt.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No student has attempted this quiz yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-taking">
            <div className="quiz-timer">
              <FiClock />
              <span>Time Remaining: {formatTime(timeLeft)}</span>
            </div>

            <div className="questions-container">
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="question-card">
                  <h3>Question {qIndex + 1}</h3>
                  <p className="question-text">{question.question}</p>
                  
                  <div className="options-list">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="option-item">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={currentAnswers[qIndex] === oIndex}
                          onChange={() => handleAnswerChange(qIndex, oIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSubmit} 
              className="btn btn-primary btn-eq-large"
              disabled={Object.keys(currentAnswers).length < quiz.questions.length}
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;

