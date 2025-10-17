import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordField = ({ name, value, onChange, placeholder, required = false, className = '' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input-wrapper ${className}`}>
      <input
        type={visible ? 'text' : 'password'}
        name={name}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};

export default PasswordField;
