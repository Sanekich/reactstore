import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const servicesData = [
  {
    title: 'Перевезення',
    subtitle: 'Перевезення меблів, техніки та інших вантажів',
    description:
      ' Ми пропонуємо професійні послуги з перевезення з гарантією збереження вашого майна. Наші фахівці забезпечать швидке та безпечне транспортування будь-яких вантажів на будь-які відстані.',
    img: '/api/placeholder/64/64',
  },
  {
    title: 'Догляд за тваринами', 
    subtitle: 'Вигул собак, передержка, догляд за улюбленцями',
    description:
      ' Довірте турботу про своїх улюбленців професіоналам. Ми пропонуємо широкий спектр послуг: вигул, годування, ігри та медичний догляд за потреби.',
    img: '/api/placeholder/64/64',
  },
  {
    title: 'Побутові послуги',
    subtitle: 'Прибирання, дрібний ремонт, допомога по дому',
    description:
      ' Наші спеціалісти допоможуть з будь-якими побутовими задачами. Від регулярного прибирання до дрібного ремонту — зробимо ваше життя зручнішим.',
    img: '/api/placeholder/64/64',
  },
];

const Services = () => {
  const [currentText, setCurrentText] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const intervalRef = useRef(null);
  
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleCardHover = (index) => {
    if (index === activeCardIndex) {
      return;
    }
    
    setActiveCardIndex(index);
    setIsTypingComplete(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const description = servicesData[index].description;
    setCurrentText('');
    let charIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (charIndex < description.length) {
        setCurrentText(prev => prev + description.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(intervalRef.current);
        setIsTypingComplete(true);
      }
    }, 30);
  };

  useEffect(() => {
    // Check if there's a user in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.name) {
      setCurrentUser(storedUser.name);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <img
            style={{ overflow: 'hidden', marginTop: '5px', width: '100px', height: '100px' }}
            src="https://media.discordapp.net/attachments/716658941924343889/1342872277246804018/Sleekshot_2025-02-22_16-40-39.png?ex=67bb36c4&is=67b9e544&hm=d74c4ec46ef879a604f3dbf207e9500600c39cc4c7ec0c1d296358284bc626f7&=&format=webp&quality=lossless&width=841&height=670"
            alt="Логотип"
            className="logo"
          />
          <div className="nav-links">
            <button style={{ color: "#4a6fa5" }} onClick={() => handleNavigation('/services')}>Послуги</button>
            <button onClick={() => handleNavigation('/')}>Головна</button>
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
                <button className="button" onClick={() => handleNavigation('/register')}>Реєстрація</button>
                <button className="button" onClick={() => handleNavigation('/login')}>Увійти</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section id="service-list">
          <div className="services-grid">
            {servicesData.map((service, idx) => (
              <div
                key={idx}
                className={`service-card ${activeCardIndex === idx ? 'active' : ''}`}
                onMouseEnter={() => handleCardHover(idx)}
              >
                <img src={service.img} alt={service.title} />
                <h3>{service.title}</h3>
                <p>{service.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="Description">
        <p id="typing-text">{currentText}</p>
      </div>

      <footer>
        <p>&copy; 2023 Ваша компанія</p>
      </footer>
    </div>
  );
};

export default Services;
