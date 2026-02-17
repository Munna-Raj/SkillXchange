import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* Logo Section */}
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

        {/* Links */}
        <div className="footerMiddle">
          <h3 className="footerHeading">Quick Links</h3>
          <div className="footerLinks">
            <Link to="/" className="footerLink">Home</Link>
            <Link to="/about" className="footerLink">About Us</Link>
            <Link to="/services" className="footerLink">Services</Link>
            <a
              href="https://wa.me/919829395174"
              target="_blank"
              rel="noopener noreferrer"
              className="footerLink"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="footerRight">
          <h3 className="footerHeading">Contact Information</h3>
          <div className="space-y-4">
            <a
              href="https://wa.me/919829395174"
              target="_blank"
              rel="noopener noreferrer"
              className="footerContactItem"
            >
              <span className="footerIcon">📞</span> 
              <span>9829395174 (WhatsApp)</span>
            </a>
            <div className="footerContactItem">
              <span className="footerIcon">📍</span> 
              <span>Inaruwa-3, Sunsari, Nepal</span>
            </div>
            <a
              href="mailto:munnarajyad@gmail.com"
              className="footerContactItem"
            >
              <span className="footerIcon">✉️</span> 
              <span>munnarajyad@gmail.com</span>
            </a>
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
