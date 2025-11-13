import React, { useState, useEffect } from 'react';
import './ChallengeDetail.css';
import { getChallengeDetail, updateChallengeTargets } from './challengeApi';
import { saveExerciseRecord } from './exerciseApi';

function ChallengeDetail({ challengeId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    targetWeight: '',
    targetBodyFatPercentage: '',
    targetMuscleMass: '',
    targetMusclePercentage: '',
    targetExerciseDuration: ''
  });
  const [saving, setSaving] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);
  const [editProgressFormData, setEditProgressFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    musclePercentage: '',
    exerciseType: '',
    exerciseDuration: ''
  });
  const [savingProgress, setSavingProgress] = useState(false);

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

  // 시작 날짜의 기록 데이터 가져오기
  const getStartRecord = () => {
    if (!dailyProgress || dailyProgress.length === 0) return null;
    // 날짜순으로 정렬된 상태이므로 첫 번째 요소
    return dailyProgress[0];
  };

  // 마지막 날짜의 기록 데이터 가져오기
  const getLastRecord = () => {
    if (!dailyProgress || dailyProgress.length === 0) return null;
    // 날짜순으로 정렬된 상태이므로 마지막 요소
    return dailyProgress[dailyProgress.length - 1];
  };

  const startRecord = getStartRecord();
  const lastRecord = getLastRecord();

  // 달성률 계산 함수
  // 0% = 시작 날짜 데이터, 100% = 목표 데이터
  // 현재 = 최신 날짜 데이터
  const calculateProgressRate = (start, current, target, higherIsBetter = false) => {
    if (start == null || current == null || target == null) return 0;
    
    if (higherIsBetter) {
      // 근육량, 근육률, 운동시간: 높을수록 좋음
      // 시작값이 목표값보다 크거나 같으면 계산 불가
      if (start >= target) {
        // 시작값이 목표값 이상이면, 현재값이 목표값 이상이면 100%, 아니면 0%
        return current >= target ? 100 : 0;
      }
      // 시작 < 목표
      const totalRange = target - start;
      if (totalRange <= 0) return 0; // 범위가 없거나 음수면 0%
      const progress = current - start;
      // 현재값이 시작값보다 작으면 0%
      if (progress < 0) return 0;
      // 현재값이 목표값 이상이면 100%
      if (current >= target) return 100;
      // 정상 계산: (현재 - 시작) / (목표 - 시작) * 100
      const rate = (progress / totalRange) * 100;
      return Math.min(Math.max(rate, 0), 100);
    } else {
      // 체중, 체지방률: 낮을수록 좋음
      // 목표값이 시작값보다 크거나 같으면 계산 불가
      if (target >= start) {
        // 목표값이 시작값 이상이면, 현재값이 목표값 이하이면 100%, 아니면 0%
        return current <= target ? 100 : 0;
      }
      // 시작 > 목표
      const totalRange = start - target;
      if (totalRange <= 0) return 0; // 범위가 없거나 음수면 0%
      const progress = start - current;
      // 현재값이 시작값보다 크면 0%
      if (progress < 0) return 0;
      // 현재값이 목표값 이하이면 100%
      if (current <= target) return 100;
      // 정상 계산: (시작 - 현재) / (시작 - 목표) * 100
      const rate = (progress / totalRange) * 100;
      return Math.min(Math.max(rate, 0), 100);
    }
  };

  // 각 항목별 달성률 계산
  const getProgressData = () => {
    const data = [];
    
    // 체중
    if (challenge.targetWeight && startRecord?.weight != null && lastRecord?.weight != null) {
      const rate = calculateProgressRate(startRecord.weight, lastRecord.weight, challenge.targetWeight, false);
      data.push({
        label: '체중',
        unit: 'kg',
        start: startRecord.weight,
        current: lastRecord.weight,
        target: challenge.targetWeight,
        rate: Math.min(Math.max(rate, 0), 100),
        higherIsBetter: false
      });
    }
    
    // 체지방률
    if (challenge.targetBodyFatPercentage && startRecord?.bodyFatPercentage != null && lastRecord?.bodyFatPercentage != null) {
      const rate = calculateProgressRate(startRecord.bodyFatPercentage, lastRecord.bodyFatPercentage, challenge.targetBodyFatPercentage, false);
      data.push({
        label: '체지방률',
        unit: '%',
        start: startRecord.bodyFatPercentage,
        current: lastRecord.bodyFatPercentage,
        target: challenge.targetBodyFatPercentage,
        rate: Math.min(Math.max(rate, 0), 100),
        higherIsBetter: false
      });
    }
    
    // 근육량
    if (challenge.targetMuscleMass && startRecord?.muscleMass != null && lastRecord?.muscleMass != null) {
      const rate = calculateProgressRate(startRecord.muscleMass, lastRecord.muscleMass, challenge.targetMuscleMass, true);
      data.push({
        label: '근육량',
        unit: 'kg',
        start: startRecord.muscleMass,
        current: lastRecord.muscleMass,
        target: challenge.targetMuscleMass,
        rate: Math.min(Math.max(rate, 0), 100),
        higherIsBetter: true
      });
    }
    
    // 근육률
    if (challenge.targetMusclePercentage && startRecord?.musclePercentage != null && lastRecord?.musclePercentage != null) {
      const rate = calculateProgressRate(startRecord.musclePercentage, lastRecord.musclePercentage, challenge.targetMusclePercentage, true);
      data.push({
        label: '근육률',
        unit: '%',
        start: startRecord.musclePercentage,
        current: lastRecord.musclePercentage,
        target: challenge.targetMusclePercentage,
        rate: Math.min(Math.max(rate, 0), 100),
        higherIsBetter: true
      });
    }
    
    // 운동시간 (시작일 기록과 현재 합산 비교)
    if (challenge.targetExerciseDuration) {
      let startDuration = startRecord?.exerciseDuration || 0;
      let totalDuration = 0;
      dailyProgress.forEach(dp => {
        if (dp.exerciseDuration) {
          totalDuration += dp.exerciseDuration;
        }
      });
      // 시작일 기록이 있거나 전체 합산이 0보다 크면 표시
      if (startDuration > 0 || totalDuration > 0) {
        // 시작값이 0이면 0으로 설정
        if (startDuration === 0) startDuration = 0;
        const rate = calculateProgressRate(startDuration, totalDuration, challenge.targetExerciseDuration, true);
        data.push({
          label: '운동시간',
          unit: '분',
          start: startDuration,
          current: totalDuration,
          target: challenge.targetExerciseDuration,
          rate: Math.min(Math.max(rate, 0), 100),
          higherIsBetter: true
        });
      }
    }
    
    return data;
  };

  const progressData = getProgressData();

  const handleEditClick = () => {
    if (detail && detail.challenge) {
      const c = detail.challenge;
      setEditFormData({
        targetWeight: c.targetWeight || '',
        targetBodyFatPercentage: c.targetBodyFatPercentage || '',
        targetMuscleMass: c.targetMuscleMass || '',
        targetMusclePercentage: c.targetMusclePercentage || '',
        targetExerciseDuration: c.targetExerciseDuration || ''
      });
      setShowEditModal(true);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const targetData = {
        targetWeight: editFormData.targetWeight ? parseFloat(editFormData.targetWeight) : null,
        targetBodyFatPercentage: editFormData.targetBodyFatPercentage ? parseFloat(editFormData.targetBodyFatPercentage) : null,
        targetMuscleMass: editFormData.targetMuscleMass ? parseFloat(editFormData.targetMuscleMass) : null,
        targetMusclePercentage: editFormData.targetMusclePercentage ? parseFloat(editFormData.targetMusclePercentage) : null,
        targetExerciseDuration: editFormData.targetExerciseDuration ? parseInt(editFormData.targetExerciseDuration) : null
      };

      await updateChallengeTargets(challengeId, targetData);
      setShowEditModal(false);
      // 상세 정보 다시 로드
      await loadDetail();
    } catch (error) {
      console.error('목표 수정 오류:', error);
      alert('목표 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleEditProgress = (progress) => {
    setEditProgressFormData({
      weight: progress.weight || '',
      bodyFatPercentage: progress.bodyFatPercentage || '',
      muscleMass: progress.muscleMass || '',
      musclePercentage: progress.musclePercentage || '',
      exerciseType: progress.exerciseType || '',
      exerciseDuration: progress.exerciseDuration || ''
    });
    setEditingProgress(progress);
  };

  const handleEditProgressFormChange = (e) => {
    const { name, value } = e.target;
    setEditProgressFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProgress = async () => {
    if (!editingProgress) return;
    
    setSavingProgress(true);
    try {
      const recordData = {
        recordDate: editingProgress.date,
        weight: editProgressFormData.weight ? parseFloat(editProgressFormData.weight) : null,
        bodyFatPercentage: editProgressFormData.bodyFatPercentage ? parseFloat(editProgressFormData.bodyFatPercentage) : null,
        muscleMass: editProgressFormData.muscleMass ? parseFloat(editProgressFormData.muscleMass) : null,
        musclePercentage: editProgressFormData.musclePercentage ? parseFloat(editProgressFormData.musclePercentage) : null,
        exerciseType: editProgressFormData.exerciseType || null,
        exerciseDuration: editProgressFormData.exerciseDuration ? parseInt(editProgressFormData.exerciseDuration) : null
      };

      await saveExerciseRecord(recordData);
      setEditingProgress(null);
      // 상세 정보 다시 로드
      await loadDetail();
    } catch (error) {
      console.error('기록 수정 오류:', error);
      alert('기록 수정에 실패했습니다.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleCancelProgressEdit = () => {
    setEditingProgress(null);
  };

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
        <div className="targets-header">
          <h3>목표</h3>
          <button className="edit-targets-button" onClick={handleEditClick}>
            수정
          </button>
        </div>
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
        {progressData.length === 0 ? (
          <div className="no-progress-data">기록된 데이터가 없습니다.</div>
        ) : (
          <div className="overall-stats">
            {progressData.map((item, index) => (
              <div key={index} className="stat-item-new">
                <div className="stat-label-new">{item.label}</div>
                <div className="progress-bar-container-new">
                  <div className="progress-bar-labels">
                    <span className="progress-value-left">
                      시작 {item.start.toFixed(item.unit === '분' ? 0 : 1)}{item.unit}
                    </span>
                    <span className="progress-value-right">
                      목표 {item.target.toFixed(item.unit === '분' ? 0 : 1)}{item.unit}
                    </span>
                  </div>
                  <div className="progress-bar-wrapper-new">
                    <div className="progress-bar-track">
                      <div 
                        className={`progress-bar-fill ${item.rate >= 100 ? 'success' : item.rate >= 50 ? 'warning' : 'fail'}`}
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-info">
                    <div className="progress-info-left">
                      <div className="progress-current">현재: {item.current.toFixed(item.unit === '분' ? 0 : 1)}{item.unit}</div>
                      <div className="progress-rate">{item.rate.toFixed(1)}% 달성</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          
          // 날짜순으로 정렬 (오름차순) - 전날 데이터를 찾기 위해
          const sortedByDate = [...validProgress].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB; // 날짜순 (오름차순)
          });
          
          // 최신순으로 정렬 (날짜 내림차순) - 표시용
          const sortedProgress = [...validProgress].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // 최신순 (내림차순)
          });
          
          // 전날 데이터를 찾는 함수 (가장 최근의 이전 기록)
          const getPreviousDayData = (currentDate) => {
            const current = new Date(currentDate);
            const currentDateStr = current.toISOString().split('T')[0];
            
            // sortedByDate는 날짜순 오름차순이므로, 뒤에서부터 찾으면 가장 최근 이전 기록을 찾을 수 있음
            for (let i = sortedByDate.length - 1; i >= 0; i--) {
              const record = sortedByDate[i];
              const recordDate = new Date(record.date);
              const recordDateStr = recordDate.toISOString().split('T')[0];
              
              // 현재 날짜보다 이전인 기록 중 가장 최근 것
              if (recordDateStr < currentDateStr) {
                return record;
              }
            }
            
            return null;
          };
          
          // 증감 표시 함수
          const formatChange = (current, previous, unit = '') => {
            if (current == null || previous == null) return null;
            const diff = current - previous;
            if (diff === 0) return null;
            const absDiff = Math.abs(diff);
            const sign = diff > 0 ? '↑' : '↓';
            return `(${absDiff.toFixed(1)}${sign})`;
          };
          
          return sortedProgress.length === 0 ? (
            <div className="no-records">기록이 없습니다. 운동 기록을 입력해주세요.</div>
          ) : (
            <div className="progress-list">
              {sortedProgress.map((progress, index) => {
                const previousDay = getPreviousDayData(progress.date);
                
                return (
                  <div key={index} className="progress-item">
                    <div className="progress-date-header">
                      <div className="progress-date">{formatDate(progress.date)}</div>
                      <button 
                        className="edit-progress-button"
                        onClick={() => handleEditProgress(progress)}
                      >
                        수정하기
                      </button>
                    </div>
                    <div className="progress-content">
                      <div className={`progress-field ${progress.weightSuccess !== null && progress.weightSuccess !== undefined ? (progress.weightSuccess ? 'success' : 'fail') : ''}`}>
                        <span className="field-label">
                          체중: <span className="field-value">{progress.weight ? `${progress.weight} kg` : '-'}</span>
                          {progress.weight != null && previousDay?.weight != null && (
                            <span className="field-change">{formatChange(progress.weight, previousDay.weight)}</span>
                          )}
                        </span>
                      </div>
                      <div className={`progress-field ${progress.bodyFatSuccess !== null && progress.bodyFatSuccess !== undefined ? (progress.bodyFatSuccess ? 'success' : 'fail') : ''}`}>
                        <span className="field-label">
                          체지방률: <span className="field-value">{progress.bodyFatPercentage ? `${progress.bodyFatPercentage}%` : '-'}</span>
                          {progress.bodyFatPercentage != null && previousDay?.bodyFatPercentage != null && (
                            <span className="field-change">{formatChange(progress.bodyFatPercentage, previousDay.bodyFatPercentage)}</span>
                          )}
                        </span>
                      </div>
                      <div className={`progress-field ${progress.muscleMassSuccess !== null && progress.muscleMassSuccess !== undefined ? (progress.muscleMassSuccess ? 'success' : 'fail') : ''}`}>
                        <span className="field-label">
                          근육량: <span className="field-value">{progress.muscleMass ? `${progress.muscleMass} kg` : '-'}</span>
                          {progress.muscleMass != null && previousDay?.muscleMass != null && (
                            <span className="field-change">{formatChange(progress.muscleMass, previousDay.muscleMass)}</span>
                          )}
                        </span>
                      </div>
                      <div className={`progress-field ${progress.musclePercentageSuccess !== null && progress.musclePercentageSuccess !== undefined ? (progress.musclePercentageSuccess ? 'success' : 'fail') : ''}`}>
                        <span className="field-label">
                          근육률: <span className="field-value">{progress.musclePercentage ? `${progress.musclePercentage}%` : '-'}</span>
                          {progress.musclePercentage != null && previousDay?.musclePercentage != null && (
                            <span className="field-change">{formatChange(progress.musclePercentage, previousDay.musclePercentage)}</span>
                          )}
                        </span>
                      </div>
                      <div className={`progress-field ${progress.exerciseDurationSuccess !== null && progress.exerciseDurationSuccess !== undefined ? (progress.exerciseDurationSuccess ? 'success' : 'fail') : ''}`}>
                        <span className="field-label">
                          운동시간: <span className="field-value">{progress.exerciseDuration ? `${progress.exerciseDuration}분` : '-'}</span>
                          {progress.exerciseDuration != null && previousDay?.exerciseDuration != null && (
                            <span className="field-change">{formatChange(progress.exerciseDuration, previousDay.exerciseDuration)}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* 목표 수정 모달 */}
      {showEditModal && (
        <div className="edit-targets-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-targets-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>목표 수정</h3>
            <div className="edit-targets-form">
              <div className="form-group">
                <label htmlFor="edit-targetWeight">목표 체중 (kg)</label>
                <input
                  type="number"
                  id="edit-targetWeight"
                  name="targetWeight"
                  value={editFormData.targetWeight}
                  onChange={handleEditFormChange}
                  step="0.1"
                  placeholder="예: 70"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-targetBodyFatPercentage">목표 체지방률 (%)</label>
                <input
                  type="number"
                  id="edit-targetBodyFatPercentage"
                  name="targetBodyFatPercentage"
                  value={editFormData.targetBodyFatPercentage}
                  onChange={handleEditFormChange}
                  step="0.1"
                  placeholder="예: 20"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-targetMuscleMass">목표 근육량 (kg)</label>
                <input
                  type="number"
                  id="edit-targetMuscleMass"
                  name="targetMuscleMass"
                  value={editFormData.targetMuscleMass}
                  onChange={handleEditFormChange}
                  step="0.1"
                  placeholder="예: 50"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-targetMusclePercentage">목표 근육률 (%)</label>
                <input
                  type="number"
                  id="edit-targetMusclePercentage"
                  name="targetMusclePercentage"
                  value={editFormData.targetMusclePercentage}
                  onChange={handleEditFormChange}
                  step="0.1"
                  placeholder="예: 30"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-targetExerciseDuration">목표 운동시간 (분)</label>
                <input
                  type="number"
                  id="edit-targetExerciseDuration"
                  name="targetExerciseDuration"
                  value={editFormData.targetExerciseDuration}
                  onChange={handleEditFormChange}
                  placeholder="예: 60"
                />
              </div>
            </div>
            <div className="edit-targets-actions">
              <button className="save-button" onClick={handleSaveEdit} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button className="cancel-button" onClick={handleCancelEdit} disabled={saving}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일별 진행상황 수정 모달 */}
      {editingProgress && (
        <div className="edit-progress-modal-overlay" onClick={handleCancelProgressEdit}>
          <div className="edit-progress-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>기록 수정 - {formatDate(editingProgress.date)}</h3>
            <div className="edit-progress-form">
              <div className="form-group">
                <label htmlFor="edit-weight">체중 (kg)</label>
                <input
                  type="number"
                  id="edit-weight"
                  name="weight"
                  value={editProgressFormData.weight}
                  onChange={handleEditProgressFormChange}
                  step="0.1"
                  placeholder="예: 70"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-bodyFatPercentage">체지방률 (%)</label>
                <input
                  type="number"
                  id="edit-bodyFatPercentage"
                  name="bodyFatPercentage"
                  value={editProgressFormData.bodyFatPercentage}
                  onChange={handleEditProgressFormChange}
                  step="0.1"
                  placeholder="예: 20"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-muscleMass">근육량 (kg)</label>
                <input
                  type="number"
                  id="edit-muscleMass"
                  name="muscleMass"
                  value={editProgressFormData.muscleMass}
                  onChange={handleEditProgressFormChange}
                  step="0.1"
                  placeholder="예: 50"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-musclePercentage">근육률 (%)</label>
                <input
                  type="number"
                  id="edit-musclePercentage"
                  name="musclePercentage"
                  value={editProgressFormData.musclePercentage}
                  onChange={handleEditProgressFormChange}
                  step="0.1"
                  placeholder="예: 30"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-exerciseType">운동종류</label>
                <input
                  type="text"
                  id="edit-exerciseType"
                  name="exerciseType"
                  value={editProgressFormData.exerciseType}
                  onChange={handleEditProgressFormChange}
                  placeholder="예: 러닝"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-exerciseDuration">운동시간 (분)</label>
                <input
                  type="number"
                  id="edit-exerciseDuration"
                  name="exerciseDuration"
                  value={editProgressFormData.exerciseDuration}
                  onChange={handleEditProgressFormChange}
                  placeholder="예: 60"
                />
              </div>
            </div>
            <div className="edit-progress-actions">
              <button className="save-button" onClick={handleSaveProgress} disabled={savingProgress}>
                {savingProgress ? '저장 중...' : '저장'}
              </button>
              <button className="cancel-button" onClick={handleCancelProgressEdit} disabled={savingProgress}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengeDetail;

