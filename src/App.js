import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import ExerciseRecord from './ExerciseRecord';
import ExerciseRecordList from './ExerciseRecordList';
import ChallengeList from './ChallengeList';
import ChallengeForm from './ChallengeForm';
import ChallengeDetail from './ChallengeDetail';
import ShareList from './ShareList';
import ShareForm from './ShareForm';
import ShareDetail from './ShareDetail';
import Navbar from './Navbar';
import { isAuthenticated, getCurrentUser } from './auth';

function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('record');
  const [challengeView, setChallengeView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [shareView, setShareView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedShareId, setSelectedShareId] = useState(null);

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
  }, []);

  const handleLoginSuccess = (response) => {
    console.log('로그인 성공:', response);
    setIsLoggedIn(true);
    setCurrentPage('record');
  };

  const handleSignupSuccess = (response) => {
    console.log('회원가입 성공:', response);
    // 회원가입 성공 후 로그인 페이지로 이동
    setShowSignup(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('record');
  };

  // 로그인된 경우 운동 기록 페이지 표시
  if (isLoggedIn) {
    const handlePageChange = (page) => {
      setCurrentPage(page);
      if (page === 'challenge') {
        setChallengeView('list');
        setSelectedChallengeId(null);
      } else if (page === 'share') {
        setShareView('list');
        setSelectedShareId(null);
      }
    };

    const handleCreateChallenge = () => {
      setChallengeView('form');
    };

    const handleChallengeFormSuccess = () => {
      setChallengeView('list');
      setRefreshTrigger(prev => prev + 1); // 목록 새로고침 트리거
    };

    const handleChallengeFormCancel = () => {
      setChallengeView('list');
    };

    const handleViewChallengeDetail = (challengeId) => {
      setSelectedChallengeId(challengeId);
      setChallengeView('detail');
    };

    const handleBackFromDetail = () => {
      setChallengeView('list');
      setSelectedChallengeId(null);
    };

    const handleCreateShare = () => {
      setShareView('form');
    };

    const handleShareFormSuccess = () => {
      setShareView('list');
    };

    const handleShareFormCancel = () => {
      setShareView('list');
    };

    const handleViewSharedDetail = (shareId) => {
      setSelectedShareId(shareId);
      setShareView('detail');
    };

    const handleBackFromShareDetail = () => {
      setShareView('list');
      setSelectedShareId(null);
    };

    return (
      <div className="app-container">
        <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
        <div className="app-content">
          {currentPage === 'record' ? (
            <ExerciseRecord />
          ) : currentPage === 'list' ? (
            <ExerciseRecordList />
          ) : currentPage === 'challenge' ? (
            challengeView === 'list' ? (
              <ChallengeList 
                onViewDetail={handleViewChallengeDetail}
                onCreateChallenge={handleCreateChallenge}
                onRefresh={refreshTrigger}
              />
            ) : challengeView === 'form' ? (
              <ChallengeForm 
                onSuccess={handleChallengeFormSuccess}
                onCancel={handleChallengeFormCancel}
              />
            ) : (
              <ChallengeDetail 
                challengeId={selectedChallengeId}
                onBack={handleBackFromDetail}
              />
            )
          ) : currentPage === 'share' ? (
            shareView === 'list' ? (
              <ShareList 
                onCreateShare={handleCreateShare}
                onViewSharedDetail={handleViewSharedDetail}
              />
            ) : shareView === 'form' ? (
              <ShareForm 
                onSuccess={handleShareFormSuccess}
                onCancel={handleShareFormCancel}
              />
            ) : (
              <ShareDetail 
                shareId={selectedShareId}
                onBack={handleBackFromShareDetail}
              />
            )
          ) : null}
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 로그인/회원가입 페이지 표시
  return (
    <div className="App">
      {showSignup ? (
        <Signup 
          onSignupSuccess={handleSignupSuccess}
          onBackToLogin={() => setShowSignup(false)}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSignupClick={() => setShowSignup(true)}
        />
      )}
    </div>
  );
}

export default App;
