import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmed: ''
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [step, setStep] = useState(1); 

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendVerificationEmail = async (name, email, code) => {
    try {
        await emailjs.send(
            'service_fv0f2qo',
            'template_zn93brw',
            {
              name: name,
              verification_code: code,
              to_email: email,       
              reply_to: email        
            },
            '7Gw-RPTO7wMAtHcSb'
          );
          
      console.log('Verification code sent to email.');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmed) {
      alert('Паролі не співпадають');
      return;
    }

    const code = generateCode();
    setGeneratedCode(code);
    await sendVerificationEmail(formData.name, formData.email, code);

    setStep(2); // Move to confirmation step
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (userCode !== generatedCode) {
      alert('Невірний код підтвердження');
      return;
    }

    // Register the user to the backend
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Помилка реєстрації');
      } else {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      }
    } catch (error) {
      alert('Сталася помилка сервера');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  return (
    <div className="register">
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-form" onClick={(e) => e.stopPropagation()}>
          {step === 1 ? (
            <>
              <h2>Реєстрація</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Ім'я"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
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
                <input
                  type="password"
                  name="passwordConfirmed"
                  placeholder="Підтвердження паролю"
                  value={formData.passwordConfirmed}
                  onChange={handleInputChange}
                  required
                />
                <div className="modal-actions">
                  <button type="submit" className="button">Зареєструватись</button>
                  <button type="button" className="button cancel" onClick={handleCloseModal}>Скасувати</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2>Підтвердження електронної пошти</h2>
              <p>Ми надіслали 6-значний код на вашу електронну адресу.</p>
              <form onSubmit={handleVerifyCode}>
                <input
                  type="text"
                  name="verificationCode"
                  placeholder="Введіть код підтвердження"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  required
                />
                <div className="modal-actions">
                  <button type="submit" className="button">Підтвердити</button>
                  <button type="button" className="button cancel" onClick={handleCloseModal}>Скасувати</button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
