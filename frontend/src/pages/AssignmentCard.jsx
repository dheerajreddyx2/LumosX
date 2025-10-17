import { useEffect, useState } from 'react';
import { FiClock, FiFileText } from 'react-icons/fi';
import api from '../utils/api';

const AssignmentCard = ({ assignment, user, isEnrolled, handleViewAssignment }) => {
  const [mySubmission, setMySubmission] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (user?.role === 'student' && isEnrolled) {
        try {
          const res = await api.get(`/submissions/assignment/${assignment._id}/my-submission`);
          setMySubmission(res.data.data);
        } catch {
          setMySubmission(null);
        }
      }
    };
    fetchSubmission();
  }, [assignment._id, user, isEnrolled]);

  return (
    <div className="item-card fade-in">
      <div className="item-info">
        <h3>{assignment.title}</h3>
        <p>{assignment.description}</p>
        <div className="item-meta">
          <span className="meta-item">
            <FiClock /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </span>
          <span className="meta-item">
            Max Points: {assignment.maxPoints}/10
          </span>
        </div>
      </div>
      {(isEnrolled || (user?.role === 'teacher')) && (
        user?.role === 'teacher' ? (
          <button 
            onClick={() => handleViewAssignment(assignment._id)}
            className="btn btn-outline btn-sm"
          >
            View Submissions
          </button>
        ) : (
          mySubmission ? (
            <button 
              onClick={() => handleViewAssignment(assignment._id)}
              className="btn btn-success btn-lg"
              style={{ fontSize: '1.15rem', padding: '12px 32px', minWidth: '160px' }}
            >
              View Results
            </button>
          ) : (
            <button 
              onClick={() => handleViewAssignment(assignment._id)}
              className="btn btn-primary btn-lg"
              style={{ fontSize: '1.15rem', padding: '12px 32px', minWidth: '160px' }}
            >
              Submit
            </button>
          )
        )
      )}
    </div>
  );
};

export default AssignmentCard;
