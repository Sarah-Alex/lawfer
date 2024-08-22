import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import SenderLogin from './SenderLogin';

const Home = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  const renderComponent = () => {
    if (activeComponent === 'user') {
      return <Login />;
    } else if (activeComponent === 'sender') {
      return <SenderLogin />;
    }
    return null;
  };

  return (
    <div className="Home">
      <header className="App-header">
        <h1>Login</h1>
        <button type="button" onClick={() => setActiveComponent('user')}>User</button>
        <button type="button" onClick={() => setActiveComponent('sender')}>Sender</button>
      </header>
      {renderComponent()}
    </div>
  );
}

export default Home;
