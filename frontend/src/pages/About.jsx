import React from 'react';
import { Header } from '../components/Header';
import '../styles/About.css';

function About() {
    return (
    <>
        <Header />
        
        <section className="team-section">
        <div className="container">
            <h2 className="section-title">Meet Our Team</h2>

            <div className="team-grid">
            <div className="profile-box">
                <h3 className="member-name">Mason Orton</h3>
                <p className="member-role">Lead Designer</p>
                <p className="member-experience">3rd Year</p>
                <p className="member-description">
                I have experience in self-made projects as well as research groups at schools such as Cal State Fullerton.
                </p>
            </div>

            <div className="profile-box">
                <h3 className="member-name">Kelechi Duru</h3>
                <p className="member-role">CEO & Lead Back-End Engineer</p>
                <p className="member-experience">4th Year</p>
            </div>

            <div className="profile-box">
                <h3 className="member-name">Jack Woline</h3>
                <p className="member-role">Lead Front-End Developer</p>
                <p className="member-experience">*** Year</p>
            </div>

            <div className="profile-box">
                <h3 className="member-name">Helena Crowley</h3>
                <p className="member-role">Back-End Engineer</p>
                <p className="member-experience">*** Year</p>
            </div>

            <div className="profile-box">
                <h3 className="member-name">Daniel Castillo</h3>
                <p className="member-role">Back-End Engineer</p>
                <p className="member-experience">*** Year</p>
            </div>
            </div>
        </div>
        </section>
    </>
    );
}

export default About;