import React, { useState } from 'react';
import './Signup.css';
import { signupUser } from './auth';

function Signup({ onSignupSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    birthDate: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 필수 필드 확인
    if (!formData.username || !formData.password || !formData.name || 
        !formData.birthDate || !formData.gender) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 회원가입 API 호출 시작...');
      const response = await signupUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email || '',
        birthDate: formData.birthDate,
        gender: formData.gender
      });
      console.log('🔄 회원가입 API 응답:', response);
      
      if (response.success) {
        console.log('✅ 회원가입 성공');
        alert('회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.');
        
        // 부모 컴포넌트에 회원가입 성공 알림
        if (onSignupSuccess) {
          onSignupSuccess(response);
        }
        
        // 로그인 페이지로 이동
        if (onBackToLogin) {
          onBackToLogin();
        }
      } else {
        console.warn('⚠️ 회원가입 실패:', response.message);
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 회원가입 처리 중 예외 발생:', err);
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('🏁 회원가입 처리 완료');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">회원가입</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">아이디 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">비밀번호 확인 *</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthDate">생년월일 *</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">성별 *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button 
              type="submit" 
              className="signup-submit-button"
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
            <button 
              type="button" 
              className="back-button"
              onClick={onBackToLogin}
            >
              로그인으로
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;



