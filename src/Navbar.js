import React from 'react';
import './Navbar.css';

function Navbar({ currentPage, onPageChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">운동 기록</h1>
        <div className="navbar-menu">
          <button 
            className={`navbar-item ${currentPage === 'record' ? 'active' : ''}`}
            onClick={() => onPageChange('record')}
          >
            운동기록
          </button>
          <button 
            className={`navbar-item ${currentPage === 'list' ? 'active' : ''}`}
            onClick={() => onPageChange('list')}
          >
            운동 기록 조회
          </button>
          <button 
            className={`navbar-item ${currentPage === 'challenge' ? 'active' : ''}`}
            onClick={() => onPageChange('challenge')}
          >
            챌린지
          </button>
          <button 
            className={`navbar-item ${currentPage === 'share' ? 'active' : ''}`}
            onClick={() => onPageChange('share')}
          >
            공유하기
          </button>
        </div>
        <button 
          className="navbar-logout"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

