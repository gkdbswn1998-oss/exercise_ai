/**
 * 루틴 관련 API 함수
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.124.207.117:8080/api';

/**
 * 모든 루틴 조회
 * @returns {Promise<Array>} 루틴 목록
 */
export async function getRoutines() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/routines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('루틴 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('루틴 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 타입의 루틴 조회
 * @param {string} routineType - "MORNING" or "EVENING"
 * @returns {Promise<Object|null>} 루틴 또는 null
 */
export async function getRoutineByType(routineType) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/routines/${routineType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('루틴 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('루틴 조회 오류:', error);
    throw error;
  }
}

/**
 * 루틴 저장 또는 수정
 * @param {Object} routineData - 루틴 데이터
 * @returns {Promise<Object>} 저장된 루틴
 */
export async function saveRoutine(routineData) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify(routineData)
    });

    if (!response.ok) {
      throw new Error('루틴 저장에 실패했습니다.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('루틴 저장 오류:', error);
    throw error;
  }
}

/**
 * 특정 날짜의 루틴 체크 조회
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Array>} 루틴 체크 목록
 */
export async function getRoutineChecksByDate(date) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/routines/checks/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('루틴 체크 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('루틴 체크 조회 오류:', error);
    throw error;
  }
}

/**
 * 루틴 체크 저장 또는 수정
 * @param {Object} checkData - 루틴 체크 데이터
 * @returns {Promise<Object>} 저장된 루틴 체크
 */
export async function saveRoutineCheck(checkData) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/routines/checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify(checkData)
    });

    if (!response.ok) {
      throw new Error('루틴 체크 저장에 실패했습니다.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('루틴 체크 저장 오류:', error);
    throw error;
  }
}

