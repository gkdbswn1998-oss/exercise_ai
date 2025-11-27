import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ currentPage, onPageChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (page) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">운동 기록</h1>
        <div className="navbar-right">
          <button 
            className="navbar-logout desktop-only"
            onClick={handleLogout}
          >
            로그아웃
          </button>
          <button 
            className="hamburger-button mobile-only"
            onClick={handleMenuToggle}
            aria-label="메뉴"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <button 
            className={`navbar-item ${currentPage === 'record' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('record')}
          >
            운동기록
          </button>
          <button 
            className={`navbar-item ${currentPage === 'list' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('list')}
          >
            운동 기록 조회
          </button>
          <button 
            className={`navbar-item ${currentPage === 'challenge' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('challenge')}
          >
            챌린지
          </button>
          <button 
            className={`navbar-item ${currentPage === 'share' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('share')}
          >
            공유하기
          </button>
          <button 
            className={`navbar-item ${currentPage === 'routine' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('routine')}
          >
            루틴설정
          </button>
          <button 
            className="navbar-logout mobile-only"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

