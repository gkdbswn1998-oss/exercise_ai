import React, { useState } from 'react';
import './ChallengeForm.css';
import { createChallenge } from './challengeApi';

function ChallengeForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    targetWeight: '',
    targetBodyFatPercentage: '',
    targetMuscleMass: '',
    targetMusclePercentage: '',
    targetExerciseDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 유효성 검사
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('챌린지명, 시작일, 종료일은 필수 입력 항목입니다.');
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('시작일이 종료일보다 늦을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      const challengeData = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
        targetBodyFatPercentage: formData.targetBodyFatPercentage ? parseFloat(formData.targetBodyFatPercentage) : null,
        targetMuscleMass: formData.targetMuscleMass ? parseFloat(formData.targetMuscleMass) : null,
        targetMusclePercentage: formData.targetMusclePercentage ? parseFloat(formData.targetMusclePercentage) : null,
        targetExerciseDuration: formData.targetExerciseDuration ? parseInt(formData.targetExerciseDuration) : null
      };

      await createChallenge(challengeData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || '챌린지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="challenge-form-container">
      <div className="challenge-form-box">
        <h2>챌린지 설정</h2>
        <form onSubmit={handleSubmit} className="challenge-form">
          <div className="form-group">
            <label htmlFor="name">챌린지명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 1개월 다이어트 챌린지"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">시작일 *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">종료일 *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetWeight">목표 체중 (kg)</label>
              <input
                type="number"
                id="targetWeight"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
                placeholder="예: 70.0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetBodyFatPercentage">목표 체지방률 (%)</label>
              <input
                type="number"
                id="targetBodyFatPercentage"
                name="targetBodyFatPercentage"
                value={formData.targetBodyFatPercentage}
                onChange={handleChange}
                placeholder="예: 15.0"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetMuscleMass">목표 근육량 (kg)</label>
              <input
                type="number"
                id="targetMuscleMass"
                name="targetMuscleMass"
                value={formData.targetMuscleMass}
                onChange={handleChange}
                placeholder="예: 55.0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetMusclePercentage">목표 근육률 (%)</label>
              <input
                type="number"
                id="targetMusclePercentage"
                name="targetMusclePercentage"
                value={formData.targetMusclePercentage}
                onChange={handleChange}
                placeholder="예: 45.0"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="targetExerciseDuration">목표 운동 시간 (분)</label>
            <input
              type="number"
              id="targetExerciseDuration"
              name="targetExerciseDuration"
              value={formData.targetExerciseDuration}
              onChange={handleChange}
              placeholder="예: 60"
              min="0"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? '생성 중...' : '챌린지 생성'}
            </button>
            {onCancel && (
              <button type="button" className="cancel-button" onClick={onCancel}>
                취소
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChallengeForm;



