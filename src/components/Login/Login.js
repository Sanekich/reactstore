import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to connect to: http://localhost:5000/api/login');
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('Response received:', response.status);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseErr) {
        console.error('Failed to parse JSON response:', parseErr);
        throw new Error('Server response was not valid JSON');
      }

      if (!response.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      const user = data.user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Login successful, redirecting to dashboard');
      
      navigate('/');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to connect to the server. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  return (
    <div className="login">
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-form" onClick={(e) => e.stopPropagation()}>
          <h2>Логін</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <div className="modal-actions">
              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? 'Зачекайте...' : 'Увійти'}
              </button>
              <button type="button" className="button cancel" onClick={handleCloseModal}>
                Скасувати
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;