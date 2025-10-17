import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctAnswer: 1, points: 1 });

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };
  const updateOption = (qi, oi, value) => {
    const copy = [...questions];
    copy[qi].options[oi] = value;
    setQuestions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // validation
      if (!title || !dueDate || questions.length === 0) throw new Error('Please fill required fields');
      for (const q of questions) {
        if (!q.question) throw new Error('All questions must have text');
        if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error('Each question must have 4 options');
      }

      const payload = {
        courseId,
        title,
        description,
        dueDate,
        duration: Number(duration),
        questions,
        totalPoints: 10
      };

  await api.post('/quizzes', payload);
  toast.success('Quiz posted successfully');
  // allow toast to show, then navigate back to course
  setTimeout(() => navigate(`/courses/${courseId}`), 700);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Create Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="datetime-local" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Duration (minutes)</label>
          <input className="form-input" type="number" value={duration} onChange={(e)=>setDuration(e.target.value)} />
        </div>

        <h3>Questions</h3>
        {questions.map((q, qi) => (
          <div key={qi} className="card" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label">Question {qi+1}</label>
              <input className="form-input" value={q.question} onChange={(e)=>updateQuestion(qi, 'question', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Options (4)</label>
              {q.options.map((opt, oi) => (
                <input key={oi} className="form-input" value={opt} placeholder={`Option ${oi+1}`} onChange={(e)=>updateOption(qi, oi, e.target.value)} required />
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Correct Answer (1-4)</label>
              <input className="form-input" type="number" min={1} max={4} value={q.correctAnswer} onChange={(e)=>updateQuestion(qi, 'correctAnswer', Number(e.target.value))} required />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-outline" onClick={()=>removeQuestion(qi)}>Remove Question</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add Question</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
