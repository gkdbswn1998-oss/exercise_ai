import React, { useState, useEffect } from 'react';
import './ChallengeDetail.css';
import { getChallengeDetail } from './challengeApi';

function ChallengeDetail({ challengeId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [challengeId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await getChallengeDetail(challengeId);
      setDetail(data);
    } catch (error) {
      console.error('챌린지 상세 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}-${month}-${day} (${weekday})`;
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDay = String(start.getDate()).padStart(2, '0');
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');
    return `${start.getFullYear()}.${startMonth}.${startDay} ~ ${end.getFullYear()}.${endMonth}.${endDay}`;
  };

  if (loading) {
    return <div className="loading">챌린지 상세 정보를 불러오는 중...</div>;
  }

  if (!detail) {
    return <div className="error">챌린지 정보를 불러올 수 없습니다.</div>;
  }

  const { challenge, dailyProgress, overallProgress } = detail;

  return (
    <div className="challenge-detail-container">
      <button className="back-button" onClick={onBack}>← 뒤로</button>
      <div className="detail-header">
        <h2>{challenge.name}</h2>
        <div className="challenge-period">
          {formatDateRange(challenge.startDate, challenge.endDate)}
        </div>
      </div>

      <div className="targets-section">
        <h3>목표</h3>
        <div className="targets-grid">
          <div className="target-item">
            <span className="target-label">목표 체중</span>
            <span className="target-value">{challenge.targetWeight ? `${challenge.targetWeight} kg` : '-'}</span>
          </div>
          <div className="target-item">
            <span className="target-label">목표 체지방률</span>
            <span className="target-value">{challenge.targetBodyFatPercentage ? `${challenge.targetBodyFatPercentage}%` : '-'}</span>
          </div>
          <div className="target-item">
            <span className="target-label">목표 근육량</span>
            <span className="target-value">{challenge.targetMuscleMass ? `${challenge.targetMuscleMass} kg` : '-'}</span>
          </div>
          <div className="target-item">
            <span className="target-label">목표 근육률</span>
            <span className="target-value">{challenge.targetMusclePercentage ? `${challenge.targetMusclePercentage}%` : '-'}</span>
          </div>
          <div className="target-item">
            <span className="target-label">목표 운동시간</span>
            <span className="target-value">{challenge.targetExerciseDuration ? `${challenge.targetExerciseDuration}분` : '-'}</span>
          </div>
        </div>
      </div>

      <div className="overall-progress-section">
        <h3>전체 달성률</h3>
        <div className="overall-stats">
          <div className="stat-item">
            <span className="stat-label">체중</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${overallProgress.weightSuccessRate <= 100 ? 'success' : 'fail'}`}
                  style={{ width: `${Math.min(overallProgress.weightSuccessRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-target">
              {challenge.targetWeight ? `${challenge.targetWeight} kg` : '-'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">체지방률</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${overallProgress.bodyFatSuccessRate <= 100 ? 'success' : 'fail'}`}
                  style={{ width: `${Math.min(overallProgress.bodyFatSuccessRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-target">
              {challenge.targetBodyFatPercentage ? `${challenge.targetBodyFatPercentage}%` : '-'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">근육량</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${overallProgress.muscleMassSuccessRate >= 100 ? 'success' : 'fail'}`}
                  style={{ width: `${Math.min(overallProgress.muscleMassSuccessRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-target">
              {challenge.targetMuscleMass ? `${challenge.targetMuscleMass} kg` : '-'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">근육률</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${overallProgress.musclePercentageSuccessRate >= 100 ? 'success' : 'fail'}`}
                  style={{ width: `${Math.min(overallProgress.musclePercentageSuccessRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-target">
              {challenge.targetMusclePercentage ? `${challenge.targetMusclePercentage}%` : '-'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">운동시간</span>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar ${overallProgress.exerciseDurationSuccessRate >= 100 ? 'success' : 'fail'}`}
                  style={{ width: `${Math.min(overallProgress.exerciseDurationSuccessRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <span className="stat-target">
              {challenge.targetExerciseDuration ? `${challenge.targetExerciseDuration}분` : '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="daily-progress-section">
        <h3>일별 진행상황</h3>
        {(() => {
          // 기록이 실제로 있는 항목만 필터링 (모든 필드가 null이 아닌 경우)
          const validProgress = dailyProgress.filter(progress => 
            progress.weight != null || 
            progress.bodyFatPercentage != null || 
            progress.muscleMass != null || 
            progress.musclePercentage != null || 
            progress.exerciseDuration != null
          );
          
          return validProgress.length === 0 ? (
            <div className="no-records">기록이 없습니다. 운동 기록을 입력해주세요.</div>
          ) : (
            <div className="progress-list">
              {validProgress.map((progress, index) => (
                <div key={index} className="progress-item">
                <div className="progress-date">{formatDate(progress.date)}</div>
                <div className="progress-content">
                  <div className="progress-row">
                    <div className="progress-field">
                      <span className="field-label">체중:</span>
                      <span className="field-value">{progress.weight ? `${progress.weight} kg` : '-'}</span>
                      <span className={`status-badge ${progress.weightSuccess ? 'success' : 'fail'}`}>
                        {progress.weightSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    <div className="progress-field">
                      <span className="field-label">체지방률:</span>
                      <span className="field-value">{progress.bodyFatPercentage ? `${progress.bodyFatPercentage}%` : '-'}</span>
                      <span className={`status-badge ${progress.bodyFatSuccess ? 'success' : 'fail'}`}>
                        {progress.bodyFatSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                  </div>
                  <div className="progress-row">
                    <div className="progress-field">
                      <span className="field-label">근육량:</span>
                      <span className="field-value">{progress.muscleMass ? `${progress.muscleMass} kg` : '-'}</span>
                      <span className={`status-badge ${progress.muscleMassSuccess ? 'success' : 'fail'}`}>
                        {progress.muscleMassSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    <div className="progress-field">
                      <span className="field-label">근육률:</span>
                      <span className="field-value">{progress.musclePercentage ? `${progress.musclePercentage}%` : '-'}</span>
                      <span className={`status-badge ${progress.musclePercentageSuccess ? 'success' : 'fail'}`}>
                        {progress.musclePercentageSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                  </div>
                  <div className="progress-row">
                    <div className="progress-field">
                      <span className="field-label">운동시간:</span>
                      <span className="field-value">{progress.exerciseDuration ? `${progress.exerciseDuration}분` : '-'}</span>
                      <span className={`status-badge ${progress.exerciseDurationSuccess ? 'success' : 'fail'}`}>
                        {progress.exerciseDurationSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default ChallengeDetail;

