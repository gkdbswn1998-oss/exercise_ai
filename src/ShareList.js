import React, { useState, useEffect } from 'react';
import './ShareList.css';
import { getReceivedShares, getSentShares, getAcceptedShares, updateShareStatus } from './shareApi';

function ShareList({ onCreateShare, onViewSharedDetail }) {
  const [activeTab, setActiveTab] = useState('received'); // 'received', 'sent', 'accepted'
  const [receivedShares, setReceivedShares] = useState([]);
  const [sentShares, setSentShares] = useState([]);
  const [acceptedShares, setAcceptedShares] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadShares();
  }, [activeTab]);

  const loadShares = async () => {
    setLoading(true);
    try {
      if (activeTab === 'received') {
        const data = await getReceivedShares();
        setReceivedShares(data);
      } else if (activeTab === 'sent') {
        const data = await getSentShares();
        setSentShares(data);
      } else if (activeTab === 'accepted') {
        const data = await getAcceptedShares();
        setAcceptedShares(data);
      }
    } catch (error) {
      console.error('공유 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (shareId) => {
    try {
      await updateShareStatus(shareId, 'ACCEPTED');
      alert('공유 요청을 수락했습니다.');
      loadShares();
    } catch (error) {
      alert('공유 요청 수락에 실패했습니다.');
    }
  };

  const handleReject = async (shareId) => {
    try {
      await updateShareStatus(shareId, 'REJECTED');
      alert('공유 요청을 거절했습니다.');
      loadShares();
    } catch (error) {
      alert('공유 요청 거절에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'ACCEPTED': return '수락됨';
      case 'REJECTED': return '거절됨';
      default: return status;
    }
  };

  const displayedShares = activeTab === 'received' ? receivedShares 
    : activeTab === 'sent' ? sentShares 
    : acceptedShares;

  return (
    <div className="share-list-container">
      <div className="share-list-header">
        <h2>공유하기</h2>
        <button className="create-button" onClick={onCreateShare}>
          + 공유하기 추가
        </button>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          받은 요청 ({receivedShares.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          보낸 요청 ({sentShares.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          수락된 공유 ({acceptedShares.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : displayedShares.length === 0 ? (
        <div className="no-shares">
          {activeTab === 'received' && '받은 공유 요청이 없습니다.'}
          {activeTab === 'sent' && '보낸 공유 요청이 없습니다.'}
          {activeTab === 'accepted' && '수락된 공유가 없습니다.'}
        </div>
      ) : (
        <div className="shares-list">
          {displayedShares.map((share) => (
            <div key={share.id} className="share-item">
              <div className="share-info">
                <h3 className="share-challenge-name">{share.challengeName}</h3>
                <div className="share-details">
                  {activeTab === 'received' && (
                    <div className="share-from">보낸 사람: {share.fromUserName}</div>
                  )}
                  {activeTab === 'sent' && (
                    <div className="share-to">받는 사람 ID: {share.toUserId}</div>
                  )}
                  <div className="share-date">요청일: {formatDate(share.createdAt)}</div>
                  <div className="share-status">상태: {getStatusText(share.status)}</div>
                </div>
              </div>
              <div className="share-actions">
                {activeTab === 'received' && share.status === 'PENDING' && (
                  <>
                    <button 
                      className="accept-button"
                      onClick={() => handleAccept(share.id)}
                    >
                      수락
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleReject(share.id)}
                    >
                      거절
                    </button>
                  </>
                )}
                {activeTab === 'accepted' && (
                  <button 
                    className="detail-button"
                    onClick={() => onViewSharedDetail(share.id)}
                  >
                    상세보기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShareList;


