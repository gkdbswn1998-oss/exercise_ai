/**
 * 공유하기 관련 API 함수
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * 사용자 검색
 */
export async function searchUsers(query) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const url = query 
      ? `${API_BASE_URL}/challenge-shares/users/search?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/challenge-shares/users/search`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('사용자 검색에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('사용자 검색 오류:', error);
    throw error;
  }
}

/**
 * 공유 요청 생성
 */
export async function createShareRequest(toUserId, challengeId) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify({
        toUserId,
        challengeId
      })
    });

    if (!response.ok) {
      throw new Error('공유 요청 생성에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('공유 요청 생성 오류:', error);
    throw error;
  }
}

/**
 * 받은 공유 요청 조회
 */
export async function getReceivedShares() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares/received`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('공유 요청 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('공유 요청 조회 오류:', error);
    throw error;
  }
}

/**
 * 보낸 공유 요청 조회
 */
export async function getSentShares() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares/sent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('보낸 공유 요청 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('보낸 공유 요청 조회 오류:', error);
    throw error;
  }
}

/**
 * 수락된 공유 조회
 */
export async function getAcceptedShares() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares/accepted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('수락된 공유 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('수락된 공유 조회 오류:', error);
    throw error;
  }
}

/**
 * 공유 요청 수락/거절
 */
export async function updateShareStatus(shareId, status) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares/${shareId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('공유 요청 상태 변경에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('공유 요청 상태 변경 오류:', error);
    throw error;
  }
}

/**
 * 공유된 챌린지 상세 조회
 */
export async function getSharedChallengeDetail(shareId) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenge-shares/accepted/${shareId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('공유된 챌린지 상세 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('공유된 챌린지 상세 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 챌린지의 공유된 사용자 목록 조회
 */
export async function getSharedUsersByChallenge(challengeId) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    // 보낸 공유 요청 중에서 수락된 것만 필터링
    const sentShares = await getSentShares();
    const acceptedShares = sentShares.filter(share => 
      share.challengeId === challengeId && share.status === 'ACCEPTED'
    );
    
    // 공유된 사용자 ID 목록 반환
    return acceptedShares.map(share => ({
      id: share.toUserId,
      name: share.toUserName || `사용자 ${share.toUserId}`
    }));
  } catch (error) {
    console.error('공유된 사용자 조회 오류:', error);
    return [];
  }
}


