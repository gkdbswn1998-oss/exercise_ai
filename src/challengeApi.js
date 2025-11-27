/**
 * 챌린지 관련 API 함수
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.124.207.117:8080/api';

/**
 * 챌린지 생성
 */
export async function createChallenge(challengeData) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify(challengeData)
    });

    if (!response.ok) {
      throw new Error('챌린지 생성에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('챌린지 생성 오류:', error);
    throw error;
  }
}

/**
 * 모든 챌린지 조회
 */
export async function getAllChallenges() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('챌린지 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('챌린지 조회 오류:', error);
    throw error;
  }
}

/**
 * 챌린지 상세 조회
 */
export async function getChallengeDetail(challengeId) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('챌린지 상세 조회에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('챌린지 상세 조회 오류:', error);
    throw error;
  }
}

/**
 * 챌린지 목표 수정
 */
export async function updateChallengeTargets(challengeId, targetData) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/targets`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify(targetData)
    });

    if (!response.ok) {
      throw new Error('챌린지 목표 수정에 실패했습니다.');
    }

    return await response.json();
  } catch (error) {
    console.error('챌린지 목표 수정 오류:', error);
    throw error;
  }
}



