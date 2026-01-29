import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* Left Side: Logo and Description */}
        <div className="footerLeft">
          <div className="flex items-center gap-3">
            <div className="footerLogoContainer">
              <img 
                src="/src/Image/logo skillxChange.jpeg" 
                alt="SkillXchange Logo" 
                className="footerLogo"
              />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SkillXchange</span>
          </div>
          <p className="footerDescription">
            SkillXchange is a collaborative platform where learners and professionals exchange skills, share knowledge, and grow together.
          </p>
        </div>

        {/* Middle Section: Quick Links */}
        <div className="footerMiddle">
          <h3 className="footerHeading">Quick Links</h3>
          <div className="footerLinks">
            <Link to="/" className="footerLink">Home</Link>
            <Link to="/about" className="footerLink">About Us</Link>
            <Link to="/services" className="footerLink">Services</Link>
            <Link to="/contact" className="footerLink">Contact</Link>
            <Link to="/privacy" className="footerLink">Privacy Policy</Link>
          </div>
        </div>

        {/* Right Side: Contact Information */}
        <div className="footerRight">
          <h3 className="footerHeading">Contact Information</h3>
          <div className="space-y-4">
            <div className="footerContactItem">
              <span className="footerIcon">📞</span> 
              <span>9829395174</span>
            </div>
            <div className="footerContactItem">
              <span className="footerIcon">📍</span> 
              <span>Inaruwa-3, Sunsari, Nepal</span>
            </div>
            <div className="footerContactItem">
              <span className="footerIcon">✉️</span> 
              <span>munnarajyad@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="footerBottom">
        <p>&copy; 2026 SkillXchange | All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
