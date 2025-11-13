/**
 * 인증 관련 API 함수
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * 로그인 API 호출
 * @param {string} username - 사용자 아이디
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 로그인 결과
 */
export async function loginUser(username, password) {
  console.log('🚀 로그인 요청 시작:', { username, url: `${API_BASE_URL}/auth/login` });
  
  try {
    const requestBody = {
      username,
      password
    };
    console.log('📤 요청 데이터:', requestBody);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 응답 상태:', response.status, response.statusText);
    console.log('📥 응답 헤더:', Object.fromEntries(response.headers.entries()));

    // 응답 본문을 텍스트로 먼저 읽어서 확인
    const responseText = await response.text();
    console.log('📥 응답 본문 (텍스트):', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📥 응답 본문 (JSON):', data);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      console.error('❌ 원본 응답:', responseText);
      return {
        success: false,
        message: '서버 응답 형식이 올바르지 않습니다.'
      };
    }

    if (!response.ok) {
      console.warn('⚠️ 로그인 실패:', data);
      return {
        success: false,
        message: data.message || '로그인에 실패했습니다.'
      };
    }

    console.log('✅ 로그인 성공:', data);
    return {
      success: true,
      token: data.token || data.accessToken,
      user: data.user || { username },
      message: '로그인 성공'
    };
  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    console.error('❌ 오류 상세:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 회원가입 API 호출
 * @param {Object} signupData - 회원가입 데이터
 * @returns {Promise<Object>} 회원가입 결과
 */
export async function signupUser(signupData) {
  console.log('🚀 회원가입 요청 시작:', { username: signupData.username, url: `${API_BASE_URL}/auth/signup` });
  
  try {
    console.log('📤 요청 데이터:', signupData);

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    console.log('📥 응답 상태:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📥 응답 본문 (텍스트):', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📥 응답 본문 (JSON):', data);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      return {
        success: false,
        message: '서버 응답 형식이 올바르지 않습니다.'
      };
    }

    if (!response.ok) {
      console.warn('⚠️ 회원가입 실패:', data);
      return {
        success: false,
        message: data.message || '회원가입에 실패했습니다.'
      };
    }

    console.log('✅ 회원가입 성공:', data);
    return {
      success: true,
      userId: data.userId,
      message: data.message || '회원가입 성공'
    };
  } catch (error) {
    console.error('❌ 회원가입 오류:', error);
    return {
      success: false,
      message: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 로그아웃 처리
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 * @returns {Object|null} 사용자 정보 또는 null
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * 인증 토큰 가져오기
 * @returns {string|null} 토큰 또는 null
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * 로그인 상태 확인
 * @returns {boolean} 로그인 여부
 */
export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

/**
 * API 요청에 인증 헤더 추가
 * @param {Object} headers - 기존 헤더 객체
 * @returns {Object} 인증 헤더가 추가된 헤더 객체
 */
export function getAuthHeaders(headers = {}) {
  const token = getToken();
  return {
    ...headers,
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

/**
 * 토큰 유효성 검증 (선택적)
 * @returns {Promise<boolean>} 토큰 유효성
 */
export async function validateToken() {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

