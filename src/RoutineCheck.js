import React, { useState, useEffect } from 'react';
import './RoutineCheck.css';
import { getRoutineByType, getRoutineChecksByDate, saveRoutineCheck } from './routineApi';

function RoutineCheck({ onNavigateToSetting }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [eveningRoutine, setEveningRoutine] = useState([]);
  const [morningChecked, setMorningChecked] = useState([]);
  const [eveningChecked, setEveningChecked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRoutines();
    loadChecks();
  }, [selectedDate]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadRoutines = async () => {
    try {
      const morning = await getRoutineByType('MORNING');
      const evening = await getRoutineByType('EVENING');
      
      setMorningRoutine(morning?.routineItems || []);
      setEveningRoutine(evening?.routineItems || []);
    } catch (error) {
      console.error('루틴 조회 오류:', error);
    }
  };

  const loadChecks = async () => {
    setLoading(true);
    try {
      const dateStr = formatDate(selectedDate);
      const checks = await getRoutineChecksByDate(dateStr);
      
      const morningCheck = checks.find(c => c.routineType === 'MORNING');
      const eveningCheck = checks.find(c => c.routineType === 'EVENING');
      
      setMorningChecked(morningCheck?.checkedItems || []);
      setEveningChecked(eveningCheck?.checkedItems || []);
    } catch (error) {
      console.error('루틴 체크 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (routineType, item) => {
    const currentChecked = routineType === 'MORNING' ? morningChecked : eveningChecked;
    const newChecked = currentChecked.includes(item)
      ? currentChecked.filter(i => i !== item)
      : [...currentChecked, item];

    if (routineType === 'MORNING') {
      setMorningChecked(newChecked);
    } else {
      setEveningChecked(newChecked);
    }

    setSaving(true);
    setMessage('');

    try {
      const dateStr = formatDate(selectedDate);
      await saveRoutineCheck({
        checkDate: dateStr,
        routineType: routineType,
        checkedItems: newChecked
      });

      setMessage('체크가 저장되었습니다!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('루틴 체크 저장 오류:', error);
      setMessage('체크 저장 중 오류가 발생했습니다.');
      // 원래 상태로 복구
      if (routineType === 'MORNING') {
        setMorningChecked(currentChecked);
      } else {
        setEveningChecked(currentChecked);
      }
    } finally {
      setSaving(false);
    }
  };

  const renderRoutineCheck = (title, routineType, routineItems, checkedItems) => {
    if (routineItems.length === 0) {
      return (
        <div className="routine-check-section">
          <h3>{title}</h3>
          <div className="no-routine-message">
            루틴 설정에서 {title}을 먼저 설정해주세요.
          </div>
        </div>
      );
    }

    return (
      <div className="routine-check-section">
        <h3>{title}</h3>
        <div className="routine-check-items">
          {routineItems.map(item => (
            <label key={item} className="routine-check-item">
              <input
                type="checkbox"
                checked={checkedItems.includes(item)}
                onChange={() => handleItemToggle(routineType, item)}
                disabled={saving}
              />
              <span className={checkedItems.includes(item) ? 'checked' : ''}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="routine-check-container">
      <div className="routine-check-header">
        <h2>루틴 체크</h2>
        <div className="header-actions">
          <div className="date-selector">
            <input
              type="date"
              value={formatDate(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              max={formatDate(new Date())}
            />
            {isToday(selectedDate) && <span className="today-badge">오늘</span>}
          </div>
          {onNavigateToSetting && (
            <button className="setting-button" onClick={onNavigateToSetting}>
              루틴 설정
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('저장') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">루틴 체크를 불러오는 중...</div>
      ) : (
        <>
          {renderRoutineCheck('아침 루틴', 'MORNING', morningRoutine, morningChecked)}
          {renderRoutineCheck('운동 루틴', 'EVENING', eveningRoutine, eveningChecked)}
        </>
      )}
    </div>
  );
}

export default RoutineCheck;

