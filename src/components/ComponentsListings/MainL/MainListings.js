import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ListingsPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    country: '',
    price: '',
    description: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [menuActive, setMenuActive] = useState(false); 
  const [allListingsActive, setAllListingsActive] = useState(false); 
  const [circleButtonActive, setCircleButtonActive] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/listings');
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error('Помилка завантаження оголошень:', err);
      }
    };
    fetchListings();

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.name) {
      setCurrentUser(storedUser.name);
    }
  }, []);

  const handleAddListingClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ title: '', city: '', country: '', price: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.name) {
    return alert('Будь ласка, увійдіть перед створенням оголошення');
  }

  // include username in payload
  const payload = {
    ...formData,
    price: Number(formData.price),      // ensure it's a number
    username: storedUser.name
  };

  try {
    const response = await fetch('http://localhost:5000/api/CreateListing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const newListing = await response.json();
      setListings(prev => [
        ...prev,
        { ...payload, id: newListing.id }
      ]);
      handleCloseModal();
    } else {
      const err = await response.json();
      alert('Помилка: ' + (err.error || response.statusText));
    }
  } catch (error) {
    console.error('Помилка:', error);
    alert('Не вдалося створити оголошення');
  }
};


  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuActive(prevState => !prevState);
    setAllListingsActive(prevState => !prevState); 
    setCircleButtonActive(prevState => !prevState);
  };

const handleAcceptTask = async (taskId) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser?.id) return alert('Будь ласка, увійдіть');

  try {
    const res = await fetch('http://localhost:5000/api/acceptTask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: storedUser.id, taskId })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Unknown error');
    }

    
    localStorage.setItem('taskOwner', JSON.stringify(data.username));

  } catch (err) {
    console.error('Помилка при прийнятті завдання:', err);
    alert('Не вдалося прийняти завдання: ' + err.message);
  }
};

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <p>Залишилось оголошень: {listings.length}</p>
          <div className="user">
            {currentUser ? (
              <div className="user-info">
                <span className="username">{currentUser}</span>
                <button className="logout-button" onClick={handleLogout}>Вийти</button>
              </div>
            ) : (
              <>
                <button className="button" onClick={() => navigate('/register')}>Реєстрація</button>
                <button className="button" onClick={() => navigate('/login')}>Увійти</button>
              </>
            )}
          </div>
        </nav>
      </header>

      <button 
        id="menuToggle" 
        className={`menu-toggle ${menuActive ? 'active' : ''}`} 
        onClick={toggleMenu}
      >
        ☰
      </button>

      <div id="rightMenu" className={`right-menu ${menuActive ? 'active' : ''}`}>
        <div className="menu-content">
          <ul>
            <li><a href="/listings">Головна</a></li>
            <li><a href="/profile">Профіль</a></li>
            <li><a href="#">Послуги</a></li>
            <li><a href="#">Контакти</a></li>
            <li><a href="/">Повернутись</a></li>
          </ul>
        </div>
      </div>

      <div className="content">
        <div id="listings" className="listings-container">
          {listings.map((listing) => (
            <div 
              key={listing.id} 
              className={`listing-card ${allListingsActive ? 'active' : ''}`}
            >
              <h3>{listing.title}</h3>
              <p>{listing.description}</p>
              <p>Місто: {listing.city}, {listing.country}</p>
              <p>Ціна: €{listing.price}/год</p>
              <button className="button" onClick={() => handleAcceptTask(listing.id)}>
                Прийняти
              </button>
            </div>
          ))}
        </div>
        <button 
          id="addListing" 
          className={`Circlebutton ${circleButtonActive ? 'active' : ''}`} 
          onClick={handleAddListingClick}
        >
          +
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-form" onClick={(e) => e.stopPropagation()}>
            <h2>Нове оголошення</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Заголовок"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="Місто"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="country"
                placeholder="Країна"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Ціна/год"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="description"
                placeholder="Опис"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <div className="modal-actions">
                <button type="submit" className="button">Створити</button>
                <button type="button" className="button cancel" onClick={handleCloseModal}>Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
