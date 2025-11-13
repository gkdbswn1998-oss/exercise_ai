/**
 * 운동 기록 관련 API 함수
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * 특정 날짜의 운동 기록 조회
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<Object|null>} 운동 기록 또는 null
 */
export async function getExerciseRecord(date) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/exercise-records/date/${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    // 204 No Content는 기록이 없음을 의미
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('기록 조회에 실패했습니다.');
    }

    // 응답 본문이 비어있는지 확인
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '' || responseText === 'null') {
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return null;
    }
  } catch (error) {
    console.error('기록 조회 오류:', error);
    // 네트워크 오류가 아닌 경우 null 반환 (기록이 없는 경우)
    if (error.message && !error.message.includes('fetch')) {
      throw error;
    }
    return null;
  }
}

/**
 * 운동 기록 저장 또는 수정
 * @param {Object} recordData - 운동 기록 데이터
 * @returns {Promise<Object>} 저장된 기록
 */
export async function saveExerciseRecord(recordData) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    // 숫자 필드 변환
    const data = {
      ...recordData,
      weight: recordData.weight ? parseFloat(recordData.weight) : null,
      bodyFatPercentage: recordData.bodyFatPercentage ? parseFloat(recordData.bodyFatPercentage) : null,
      muscleMass: recordData.muscleMass ? parseFloat(recordData.muscleMass) : null,
      musclePercentage: recordData.musclePercentage ? parseFloat(recordData.musclePercentage) : null,
      exerciseDuration: recordData.exerciseDuration ? parseInt(recordData.exerciseDuration) : null,
      imageUrl: recordData.imageUrl || null
    };

    const response = await fetch(`${API_BASE_URL}/exercise-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('기록 저장에 실패했습니다.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('기록 저장 오류:', error);
    throw error;
  }
}

/**
 * 모든 운동 기록 조회
 * @returns {Promise<Array>} 운동 기록 목록
 */
export async function getAllExerciseRecords() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const response = await fetch(`${API_BASE_URL}/exercise-records`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    if (!response.ok) {
      throw new Error('기록 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('기록 조회 오류:', error);
    throw error;
  }
}

/**
 * 기간별 운동 기록 조회
 * @param {string} startDate - 시작일 (YYYY-MM-DD 형식)
 * @param {string} endDate - 종료일 (YYYY-MM-DD 형식)
 * @returns {Promise<Array>} 운동 기록 목록
 */
export async function getExerciseRecordsByDateRange(startDate, endDate) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const url = `${API_BASE_URL}/exercise-records/range?startDate=${startDate}&endDate=${endDate}`;
    console.log('📅 기간별 기록 조회 요청:', { url, startDate, endDate, userId });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    });

    console.log('📥 기간별 기록 조회 응답:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 기간별 기록 조회 실패:', errorText);
      throw new Error(`기록 조회에 실패했습니다. (${response.status})`);
    }

    const data = await response.json();
    console.log('✅ 기간별 기록 조회 성공:', data.length, '건');
    return data;
  } catch (error) {
    console.error('기간별 기록 조회 오류:', error);
    throw error;
  }
}

/**
 * 운동 기록에 사진 업로드 (단일)
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export async function uploadExerciseImage(file) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/exercise-records/upload`, {
      method: 'POST',
      headers: {
        'X-User-Id': userId.toString()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '파일 업로드에 실패했습니다.');
    }

    const imageUrl = await response.text();
    return imageUrl;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

/**
 * 운동 기록에 여러 사진 업로드
 * @param {File[]} files - 업로드할 이미지 파일 배열
 * @returns {Promise<string[]>} 업로드된 이미지 URL 배열
 */
export async function uploadExerciseImages(files) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 1;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/exercise-records/upload-multiple`, {
      method: 'POST',
      headers: {
        'X-User-Id': userId.toString()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '파일 업로드에 실패했습니다.');
    }

    const imageUrls = await response.json();
    return imageUrls;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
}

