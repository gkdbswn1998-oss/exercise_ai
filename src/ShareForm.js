import React, { useState, useEffect } from 'react';
import './ShareForm.css';
import { searchUsers, createShareRequest } from './shareApi';
import { getAllChallenges } from './challengeApi';

function ShareForm({ onSuccess, onCancel }) {
  const [toUserId, setToUserId] = useState(null);
  const [challengeId, setChallengeId] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    if (showSearchModal && searchQuery) {
      handleSearch();
    } else if (showSearchModal && !searchQuery) {
      // 검색어가 없으면 모든 사용자 조회
      handleSearch();
    }
  }, [searchQuery, showSearchModal]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await getAllChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('챌린지 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user) => {
    setToUserId(user.id);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!toUserId) {
      alert('공유할 사용자를 선택해주세요.');
      return;
    }

    if (!challengeId) {
      alert('공유할 챌린지를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await createShareRequest(toUserId, parseInt(challengeId));
      alert('공유 요청이 전송되었습니다.');
      onSuccess();
    } catch (error) {
      alert('공유 요청 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = searchResults.find(u => u.id === toUserId);

  return (
    <div className="share-form-container">
      <div className="share-form-header">
        <h2>공유하기 추가</h2>
        <button className="cancel-button" onClick={onCancel}>취소</button>
      </div>

      <form onSubmit={handleSubmit} className="share-form">
        <div className="form-group">
          <label>공유할 사용자</label>
          <div className="user-select-container">
            {selectedUser ? (
              <div className="selected-user">
                <span>{selectedUser.name || selectedUser.username} (ID: {selectedUser.id})</span>
                <button 
                  type="button" 
                  className="change-user-button"
                  onClick={() => {
                    setToUserId(null);
                    setShowSearchModal(true);
                  }}
                >
                  변경
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="search-user-button"
                onClick={() => setShowSearchModal(true)}
              >
                사용자 검색
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>공유할 챌린지</label>
          <select 
            value={challengeId} 
            onChange={(e) => setChallengeId(e.target.value)}
            required
          >
            <option value="">챌린지 선택</option>
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.name} ({challenge.startDate} ~ {challenge.endDate})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? '전송 중...' : '공유 요청 보내기'}
          </button>
        </div>
      </form>

      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>사용자 검색</h3>
              <button className="modal-close" onClick={() => setShowSearchModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="search-input"
                placeholder="사용자 ID 또는 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="search-results">
                {searchResults.length === 0 ? (
                  <div className="no-results">검색 결과가 없습니다.</div>
                ) : (
                  searchResults.map((user) => (
                    <div 
                      key={user.id} 
                      className="search-result-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="user-info">
                        <div className="user-name">{user.name || user.username}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareForm;


