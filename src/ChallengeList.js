import React, { useState, useEffect } from 'react';
import './ChallengeList.css';
import { getAllChallenges } from './challengeApi';
import ShareForm from './ShareForm';
import { getSharedUsersByChallenge } from './shareApi';

function ChallengeList({ onViewDetail, onCreateChallenge, onRefresh }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [showShareForm, setShowShareForm] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [sharedUsers, setSharedUsers] = useState({}); // { challengeId: [users] }
  const [hoveredChallengeId, setHoveredChallengeId] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  // onRefresh가 변경되면 목록 새로고침
  useEffect(() => {
    if (onRefresh) {
      loadChallenges();
    }
  }, [onRefresh]);

  // 각 챌린지의 공유된 사용자 로드
  useEffect(() => {
    const loadSharedUsers = async () => {
      const usersMap = {};
      for (const challenge of challenges) {
        try {
          const users = await getSharedUsersByChallenge(challenge.id);
          usersMap[challenge.id] = users;
        } catch (error) {
          console.error(`챌린지 ${challenge.id}의 공유 사용자 조회 오류:`, error);
          usersMap[challenge.id] = [];
        }
      }
      setSharedUsers(usersMap);
    };

    if (challenges.length > 0) {
      loadSharedUsers();
    }
  }, [challenges]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await getAllChallenges();
      console.log('📋 받은 챌린지 데이터:', data);
      console.log('📋 각 챌린지의 isActive:', data.map(c => ({ name: c.name, isActive: c.isActive })));
      setChallenges(data);
    } catch (error) {
      console.error('챌린지 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleShareClick = (challengeId) => {
    setSelectedChallengeId(challengeId);
    setShowShareForm(true);
  };

  const handleShareSuccess = () => {
    setShowShareForm(false);
    setSelectedChallengeId(null);
    loadChallenges(); // 목록 새로고침
  };

  const handleShareCancel = () => {
    setShowShareForm(false);
    setSelectedChallengeId(null);
  };

  const activeChallenges = challenges.filter(c => c.isActive);
  const completedChallenges = challenges.filter(c => !c.isActive);
  const displayedChallenges = activeTab === 'active' ? activeChallenges : completedChallenges;

  return (
    <div className="challenge-list-container">
      <div className="challenge-list-header">
        <h2>챌린지 조회</h2>
        <button className="create-button" onClick={onCreateChallenge}>
          + 챌린지 추가
        </button>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          진행중인 챌린지 ({activeChallenges.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          종료된 챌린지 ({completedChallenges.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">챌린지를 불러오는 중...</div>
      ) : displayedChallenges.length === 0 ? (
        <div className="no-challenges">
          {activeTab === 'active' ? '진행중인 챌린지가 없습니다.' : '종료된 챌린지가 없습니다.'}
        </div>
      ) : (
        <div className="challenges-list">
          {displayedChallenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className="challenge-item"
              onMouseEnter={() => setHoveredChallengeId(challenge.id)}
              onMouseLeave={() => setHoveredChallengeId(null)}
            >
              <div className="challenge-info">
                <h3 className="challenge-name">{challenge.name}</h3>
                <div className="challenge-date">
                  {formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}
                </div>
              </div>
              <div className="challenge-actions">
                <button 
                  className="detail-button"
                  onClick={() => onViewDetail(challenge.id)}
                >
                  상세보기
                </button>
                <button 
                  className="share-button"
                  onClick={() => handleShareClick(challenge.id)}
                >
                  공유하기
                </button>
              </div>
              {sharedUsers[challenge.id] && sharedUsers[challenge.id].length > 0 && (
                <div className="shared-users-container">
                  <div className="shared-users-icon">👤</div>
                  {hoveredChallengeId === challenge.id && (
                    <div className="shared-users-tooltip">
                      {sharedUsers[challenge.id].map((user, index) => (
                        <div key={user.id}>
                          {user.name} (ID: {user.id})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showShareForm && (
        <div className="share-form-modal-overlay" onClick={handleShareCancel}>
          <div className="share-form-modal-content" onClick={(e) => e.stopPropagation()}>
            <ShareForm 
              challengeId={selectedChallengeId}
              onSuccess={handleShareSuccess}
              onCancel={handleShareCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengeList;

