import React, { useState, useEffect } from 'react';
import './ShareDetail.css';
import { getSharedChallengeDetail } from './shareApi';

function ShareDetail({ shareId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [shareId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await getSharedChallengeDetail(shareId);
      setDetail(data);
    } catch (error) {
      console.error('공유된 챌린지 상세 조회 오류:', error);
      alert('상세 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDiff = (diff, isLowerBetter = false) => {
    if (diff === null || diff === undefined) return '-';
    const sign = diff >= 0 ? '+' : '';
    const color = isLowerBetter 
      ? (diff <= 0 ? 'success' : 'fail')
      : (diff >= 0 ? 'success' : 'fail');
    return <span className={`diff-value ${color}`}>{sign}{diff.toFixed(1)}</span>;
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!detail) {
    return <div className="error">데이터를 불러올 수 없습니다.</div>;
  }

  const { challenge, dailyProgress, overallProgress } = detail;

  return (
    <div className="share-detail-container">
      <div className="share-detail-header">
        <button className="back-button" onClick={onBack}>← 뒤로</button>
        <h2>{challenge.name}</h2>
      </div>

      <div className="overall-progress-section">
        <h3>전체 성공률</h3>
        <div className="overall-stats">
          <div className="stat-item">
            <span className="stat-label">체중</span>
            <span className="stat-value">
              {overallProgress.weightSuccessCount} / {overallProgress.weightRecordedDays || overallProgress.totalDays}
            </span>
            <span className="stat-percentage">
              {overallProgress.weightSuccessRate.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">체지방률</span>
            <span className="stat-value">
              {overallProgress.bodyFatSuccessCount} / {overallProgress.bodyFatRecordedDays || overallProgress.totalDays}
            </span>
            <span className="stat-percentage">
              {overallProgress.bodyFatSuccessRate.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">근육량</span>
            <span className="stat-value">
              {overallProgress.muscleMassSuccessCount} / {overallProgress.muscleMassRecordedDays || overallProgress.totalDays}
            </span>
            <span className="stat-percentage">
              {overallProgress.muscleMassSuccessRate.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">운동시간</span>
            <span className="stat-value">
              {overallProgress.exerciseDurationSuccessCount} / {overallProgress.exerciseDurationRecordedDays || overallProgress.totalDays}
            </span>
            <span className="stat-percentage">
              {overallProgress.exerciseDurationSuccessRate.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">아침루틴 | 운동루틴</span>
            <span className="stat-value">
              {overallProgress.morningRoutineSuccessDays || 0} / {overallProgress.morningRoutineRecordedDays || 0} | {overallProgress.eveningRoutineSuccessDays || 0} / {overallProgress.eveningRoutineRecordedDays || 0}
            </span>
            <span className="stat-percentage">
              {overallProgress.morningRoutineSuccessRate ? overallProgress.morningRoutineSuccessRate.toFixed(1) : '0.0'}% | {overallProgress.eveningRoutineSuccessRate ? overallProgress.eveningRoutineSuccessRate.toFixed(1) : '0.0'}%
            </span>
          </div>
        </div>
      </div>

      <div className="daily-progress-section">
        <h3>일별 진행상황 (목표 대비 차이)</h3>
        {(() => {
          // 기록이 실제로 있는 항목만 필터링 (최소 하나의 필드에 데이터가 있어야 함)
          const validProgress = (dailyProgress || []).filter(progress => {
            // diff 값이 null이 아니거나, 원본 데이터 필드가 있는 경우만 표시
            const hasData = 
              (progress.weightDiff != null && progress.weightDiff !== undefined) ||
              (progress.bodyFatDiff != null && progress.bodyFatDiff !== undefined) ||
              (progress.muscleMassDiff != null && progress.muscleMassDiff !== undefined) ||
              (progress.exerciseDurationDiff != null && progress.exerciseDurationDiff !== undefined) ||
              (progress.weight != null && progress.weight !== '') ||
              (progress.bodyFatPercentage != null && progress.bodyFatPercentage !== '') ||
              (progress.muscleMass != null && progress.muscleMass !== '') ||
              (progress.exerciseDuration != null && progress.exerciseDuration !== '') ||
              (progress.morningRoutineTotal != null && progress.morningRoutineTotal > 0) ||
              (progress.eveningRoutineTotal != null && progress.eveningRoutineTotal > 0);
            return hasData;
          });

          return validProgress.length === 0 ? (
            <div className="no-records">기록이 없습니다. 운동 기록을 입력해주세요.</div>
          ) : (
            <div className="daily-progress-list">
              {validProgress.map((progress, index) => (
                <div key={index} className="daily-progress-item">
                  <div className="progress-date">{formatDate(progress.date)}</div>
                  <div className="progress-fields">
                    <div className="progress-field">
                      <span className="field-label">체중</span>
                      <span className="field-value">{formatDiff(progress.weightDiff, true)} kg</span>
                      <span className={`status-badge ${progress.weightSuccess ? 'success' : 'fail'}`}>
                        {progress.weightSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    <div className="progress-field">
                      <span className="field-label">체지방률</span>
                      <span className="field-value">{formatDiff(progress.bodyFatDiff, true)} %</span>
                      <span className={`status-badge ${progress.bodyFatSuccess ? 'success' : 'fail'}`}>
                        {progress.bodyFatSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    <div className="progress-field">
                      <span className="field-label">근육량</span>
                      <span className="field-value">{formatDiff(progress.muscleMassDiff, false)} kg</span>
                      <span className={`status-badge ${progress.muscleMassSuccess ? 'success' : 'fail'}`}>
                        {progress.muscleMassSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    <div className="progress-field">
                      <span className="field-label">운동시간</span>
                      <span className="field-value">{formatDiff(progress.exerciseDurationDiff, false)} 분</span>
                      <span className={`status-badge ${progress.exerciseDurationSuccess ? 'success' : 'fail'}`}>
                        {progress.exerciseDurationSuccess ? '성공' : '실패'}
                      </span>
                    </div>
                    {((progress.morningRoutineTotal != null && progress.morningRoutineTotal > 0) || 
                      (progress.eveningRoutineTotal != null && progress.eveningRoutineTotal > 0)) && (
                      <div className="progress-field">
                        <span className="field-label">아침루틴 | 운동루틴</span>
                        <span className="field-value">
                          {(() => {
                            const morningTotal = progress.morningRoutineTotal != null ? progress.morningRoutineTotal : 0;
                            const morningChecked = progress.morningRoutineChecked != null ? progress.morningRoutineChecked : 0;
                            const morningFailed = morningTotal - morningChecked;
                            const eveningTotal = progress.eveningRoutineTotal != null ? progress.eveningRoutineTotal : 0;
                            const eveningChecked = progress.eveningRoutineChecked != null ? progress.eveningRoutineChecked : 0;
                            const eveningFailed = eveningTotal - eveningChecked;
                            
                            const morningText = morningTotal > 0 
                              ? `${morningChecked}/${morningTotal} ${morningFailed > 0 ? `실패(${morningFailed})` : '성공'}`
                              : '-';
                            const eveningText = eveningTotal > 0 
                              ? `${eveningChecked}/${eveningTotal} ${eveningFailed > 0 ? `실패(${eveningFailed})` : '성공'}`
                              : '-';
                            
                            return `${morningText} | ${eveningText}`;
                          })()}
                        </span>
                      </div>
                    )}
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

export default ShareDetail;


