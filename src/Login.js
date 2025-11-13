import React, { useState } from 'react';
import './Login.css';
import { loginUser } from './auth';

function Login({ onLoginSuccess, onSignupClick }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    console.log('📝 폼 제출:', formData);
    setError('');
    setLoading(true);

    try {
      console.log('🔄 로그인 API 호출 시작...');
      const response = await loginUser(formData.username, formData.password);
      console.log('🔄 로그인 API 응답:', response);
      
      if (response.success) {
        console.log('✅ 로그인 성공 처리 시작');
        // 로그인 성공 시 토큰 저장
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user || {}));
          console.log('💾 토큰 저장 완료');
        }
        
        // 로그인 성공 alert 표시
        const userName = response.user?.name || response.user?.username || formData.username;
        alert(`로그인 성공!\n환영합니다, ${userName}님!`);
        
        // 부모 컴포넌트에 로그인 성공 알림
        if (onLoginSuccess) {
          onLoginSuccess(response);
        }
      } else {
        console.warn('⚠️ 로그인 실패:', response.message);
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 로그인 처리 중 예외 발생:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('🏁 로그인 처리 완료');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">아이디</label>
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
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <button 
              type="button" 
              className="signup-button"
              onClick={onSignupClick}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

