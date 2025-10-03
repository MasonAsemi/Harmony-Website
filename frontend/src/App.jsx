import React, { useState } from 'react';
import DataPopup from './components/DataPopup';
import './App.css';

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const displayGrid = () => {
    setIsPopupOpen(true);
  };

  return (
    <div className="App">
      <header>
        <div className="title-box">
          <h1 className="title-text">Harmony</h1>
        </div>
      </header>

      <main>
        <section className="team-section">
          <div className="container">
            <h2 className="section-title">Meet Our Team</h2>

            <div className="team-grid">
              <div className="profile-box">
                <h3 className="member-name">Mason Orton</h3>
                <p className="member-role">Front-End Developer</p>
                <p className="member-experience">3rd Year</p>
                <p className="member-description">
                  I have experience in self-made projects as well as research groups at schools such as Cal State Fullerton.
                </p>
              </div>

              <div className="profile-box">
                <h3 className="member-name">Kelechi Duru</h3>
                <p className="member-role">Full-Stack Developer</p>
                <p className="member-experience">4th Year</p>
              </div>

              <div className="profile-box">
                <h3 className="member-name">Jack Woline</h3>
                <p className="member-role">**********</p>
                <p className="member-experience">*** Year</p>
              </div>

              <div className="profile-box">
                <h3 className="member-name">Helena Crowley</h3>
                <p className="member-role">**********</p>
                <p className="member-experience">*** Year</p>
              </div>

              <div className="profile-box">
                <h3 className="member-name">Daniel Castillo</h3>
                <p className="member-role">**********</p>
                <p className="member-experience">*** Year</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="team-area">
            <div className="button-grid">
              <button onClick={displayGrid}>Check Data</button>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 Harmony</p>
        </div>
      </footer>

      <DataPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
}

export default App;