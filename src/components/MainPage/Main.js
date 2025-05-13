import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const Main = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.name) {
      setCurrentUser(storedUser.name);
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const showModal = (id) => {
    alert(`Показати модальне вікно: ${id}`);
  };

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <img
            style={{ overflow: 'hidden', marginTop: '5px' }}
            src="https://media.discordapp.net/attachments/716658941924343889/1342872277246804018/Sleekshot_2025-02-22_16-40-39.png?ex=67bb36c4&is=67b9e544&hm=d74c4ec46ef879a604f3dbf207e9500600c39cc4c7ec0c1d296358284bc626f7&=&format=webp&quality=lossless&width=841&height=670"
            alt="Логотип"
            className="logo"
          />

          <div className="nav-links">
            <button onClick={() => handleNavigation('/services')}>Послуги</button>
            <button style={{ color: "#4a6fa5" }} onClick={() => handleNavigation('/')}>Головна</button>
            <button onClick={() => handleNavigation('/listings')}>Оголошення</button>
          </div>

          <div className="auth-buttons">
            {currentUser ? (
              <div className="user-info">
                <span className="username">{currentUser}</span>
                <button className="logout-button" onClick={logout}>Вийти</button>
              </div>
            ) : (
              <>
                <button className="button" onClick={() => handleNavigation('/register')}>Реестрація</button>
                <button className="button" onClick={() => handleNavigation('/login')}>Увійти</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="section">
          <h1>ЗНАЙДІТЬ ФАХІВЦЯ ДЛЯ БУДЬ-ЯКОГО ЗАВДАННЯ</h1>
          <p>Від вигулу собак до перевезення меблів — усі послуги в одному місці.</p>
          <button className="GetStarted">
            <a href="/listings">Get Started</a>
          </button>
        </div>
      </section>

      <section id="services" className="section">
        <h2>Наші послуги</h2>
        <div className="services-grid">
          <div className="service-card">
            <img src="/api/placeholder/64/64" alt="Перевезення" />
            <h3>Перевезення</h3>
            <p>Перевезення меблів, техніки та інших вантажів</p>
          </div>
          <div className="service-card">
            <img src="/api/placeholder/64/64" alt="Догляд за тваринами" />
            <h3>Догляд за тваринами</h3>
            <p>Вигул собак, передержка, догляд за улюбленцями</p>
          </div>
          <div className="service-card">
            <img src="/api/placeholder/64/64" alt="Побутові послуги" />
            <h3>Побутові послуги</h3>
            <p>Прибирання, дрібний ремонт, допомога по дому</p>
          </div>
        </div>
      </section>

      <section id="testimonials" className="sectionTest testimonials">
        <h2>Відгуки</h2>
        <div className="testimonial-card">
          <p>"Чудовий сервіс! Швидко знайшов виконавця для перевезення меблів"</p>
          <h4>Олександр</h4>
        </div>
        <div className="testimonial-card">
          <p>"Регулярно користуюся послугами вигулу собак. Все чудово!"</p>
          <h4>Марія</h4>
        </div>
      </section>

      <div className="policy">Текст політики, контакти та інше бла-бла-бла</div>
    </div>
  );
};

export default Main;