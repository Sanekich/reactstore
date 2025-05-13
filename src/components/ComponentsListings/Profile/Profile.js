import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ChatWindow = ({ onClose, recipient }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const senderId = currentUser?.id;

  
  const [receiverId, setReceiverId] = useState(null);

  useEffect(() => {
    if (!recipient) return;
    fetch(`http://localhost:5000/api/getUserIdByName/${recipient}`)
      .then(res => res.json())
      .then(data => setReceiverId(data.id))
      .catch(err => console.error("Failed to get recipient ID:", err));
  }, [recipient]);

  // Load messages between sender and recipient
  useEffect(() => {
    if (!senderId || !receiverId) return;
    fetch(`http://localhost:5000/api/messages/${senderId}/${receiverId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error loading messages:", err));
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiverId,
          content: newMessage.trim()
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Не вдалося надіслати повідомлення');
    }
  };

  return (
    <div className="chat-modal">
      <div className="chat-backdrop" onClick={onClose} />
      <div className="chat-window">
        <header className="chat-header">
          <h2>Чат з {recipient}</h2>
          <button className="chat-close" onClick={onClose}>×</button>
        </header>

        <div className="chat-body">
          {messages.length === 0 ? (
            <p className="chat-placeholder">Немає повідомлень</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={msg.sender_id === senderId ? 'chat-msg sent' : 'chat-msg received'}>
                <span>{msg.content}</span>
              </div>
            ))
          )}
        </div>

        <footer className="chat-footer">
          <input
            type="text"
            placeholder="Напишіть повідомлення…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Відправити</button>
        </footer>
      </div>
    </div>
  );
};


const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [menuActive, setMenuActive] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [userId, setUserId] = useState(null);
  const [description, setDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentListing, setCurrentListing] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [taskOwner, setTaskOwner] = useState('');


  const openChat = () => {
    if (taskOwner) {
      setShowChat(true)
    }
    else {
      alert('Спочатку виберіть замовлення');
    }
  };
  const closeChat = () => setShowChat(false);



  const fetchUserData = (id) => {
    fetch(`http://localhost:5000/api/users/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(userData => {
        if (userData.profile_pic) setPicPreview(userData.profile_pic);
        if (userData.description) setDescription(userData.description);
        if (userData.current_task_id) setCurrentTaskId(userData.current_task_id);
      })
      .catch(err => console.error("Error fetching user data:", err));
  };
  

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setPicPreview(base64Image);
      try {
        const response = await fetch("http://localhost:5000/updateProfilePicture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, profile_picture: base64Image })
        });
        if (!response.ok) throw new Error("Server error " + response.status);
        fetchUserData(userId);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
  };

const handleTaskFinish = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/completeTask', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to finish task');
    }

    const { message } = await response.json();
    console.log(message);

    setCurrentTaskId(null);
    setCurrentListing(null);
  } catch (error) {
    console.error('Error finishing task:', error);
    alert('Error finishing task: ' + error.message);
  }
};


  const handleDescriptionUpdate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/updateDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, description })
      });
  
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unknown error');

      setEditMode(false);
    } catch (err) {
      console.error('Error updating description:', err);
      alert(`Помилка: ${err.message}`);
    }
  };
  

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.name) {
      setCurrentUser(storedUser.name);
      setUserEmail(storedUser.email);
      setUserId(storedUser.id);
      fetchUserData(storedUser.id);
    }

    const storedTaskOwner = JSON.parse(localStorage.getItem('taskOwner'));
    if (storedTaskOwner) {
      setTaskOwner(storedTaskOwner);
    }
  }, []);

  useEffect(() => {
    if (!currentTaskId) return;
    fetch(`http://localhost:5000/api/listings/${currentTaskId}`)
      .then(res => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(listing => setCurrentListing(listing))
      .catch(err => console.error("Error fetching listing:", err));
  }, [currentTaskId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const toggleMenu = () => setMenuActive(prev => !prev);

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <p>{currentUser ? `Вітаємо, ${currentUser}` : 'Гість'}</p>
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

      <button id="menuToggle" className={`menu-toggle ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>☰</button>

      <div id="rightMenu" className={`right-menu ${menuActive ? 'active' : ''}`}>
        <div className="menu-content">
          <ul>
            <li><a href="/listings">Головна</a></li>
            <li><a href="/profile">Профіль</a></li>
            <li><a href="/services">Послуги</a></li>
            <li><a href="/contacts">Контакти</a></li>
            <li><a href="/reactstore">Повернутись</a></li>
          </ul>
        </div>
      </div>

      <div className="Top">
        <div className="ProfilePicture">
          {picPreview && <img src={picPreview} alt="Profile" style={{maxWidth: "100%", maxHeight: "100%", objectFit: "cover"}} />}
          <input id="profilePicInput" type="file" accept="image/*" onChange={handleProfilePictureChange} />
        </div>
        <label htmlFor="profilePicInput" className="upload-btn">+</label>
        <div className='ProfileName'>
          <h1 style={{position:"absolute",top:"15%",left:"46%",width:"70px"}}>{currentUser}</h1>
          <h2 style={{position:"absolute",top:"35%",left:"46%",width:"70px"}}>{userEmail}</h2>
          <h3 style={{position:"absolute",top:"50%",left:"46%",width:"70px"}}>Опис</h3>
          <h3 style={{ position: "absolute", top: "50%", left: "46%", width: "70px" }}>Опис</h3>
          <div className='description' style={{ position: "absolute", top: "58%", left: "46%" }}>
            {editMode ? (
              <>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  cols={30}
                />
                <br />
                
              </>
            ) : (
              <p>{description || "Немає опису"}</p>
            )}
          </div>
          <button
            className='button'
            style={{ position: "absolute", top: "80%", left: "46%" }}
            onClick={editMode ? handleDescriptionUpdate : () => setEditMode(true)}
          >
            {editMode ? 'Зберегти' : 'Редагувати'}
          </button>


        </div>
      </div>
      <div className="Bottom">
        <h1 style={{position:"absolute",top:"5%",left:"2%"}}>Поточний заказ</h1>
        {currentListing ? (
          <div className="task-details" style={{ padding: '1rem', marginTop: '2rem' }}>
            <h2>{currentListing.title}</h2>
            <p>{currentListing.description}</p>
            <p>
              <strong>Місто:</strong> {currentListing.city}<br/>
              <strong>Країна:</strong> {currentListing.country}<br/>
              <strong>Ціна:</strong> ${currentListing.price.toFixed(2)}
            </p>
          </div>
        ) : (
          <p style={{ marginTop: '2rem', paddingLeft: '1rem' }}>Немає активного замовлення</p>
        )}
        <button className='FinishTask' onClick={handleTaskFinish}>Завершити</button>
        <button className='ContactUser' onClick={openChat}>Відкрити чат</button>
      </div>
      {showChat && (
        <ChatWindow onClose={closeChat} recipient={taskOwner} />
      )}
    </div>
  );
};

export default Profile;