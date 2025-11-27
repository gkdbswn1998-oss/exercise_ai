import React, { useState, useEffect } from 'react';
import './RoutineSetting.css';
import { getRoutineByType, saveRoutine } from './routineApi';

const AVAILABLE_ITEMS = ['체중제기', '눈바디기록', '물마시기', '운동하기'];

function RoutineSetting({ onNavigateToCheck }) {
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [eveningRoutine, setEveningRoutine] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const morning = await getRoutineByType('MORNING');
      const evening = await getRoutineByType('EVENING');
      
      setMorningRoutine(morning?.routineItems || []);
      setEveningRoutine(evening?.routineItems || []);
    } catch (error) {
      console.error('루틴 조회 오류:', error);
      setMessage('루틴을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (routineType, item) => {
    if (routineType === 'MORNING') {
      setMorningRoutine(prev => {
        if (prev.includes(item)) {
          return prev.filter(i => i !== item);
        } else {
          return [...prev, item];
        }
      });
    } else {
      setEveningRoutine(prev => {
        if (prev.includes(item)) {
          return prev.filter(i => i !== item);
        } else {
          return [...prev, item];
        }
      });
    }
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await saveRoutine({
        routineType: 'MORNING',
        routineItems: morningRoutine
      });

      await saveRoutine({
        routineType: 'EVENING',
        routineItems: eveningRoutine
      });

      setMessage('루틴이 저장되었습니다!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('루틴 저장 오류:', error);
      setMessage('루틴 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const renderRoutineSection = (title, routineType, items) => {
    return (
      <div className="routine-section">
        <h3>{title}</h3>
        <div className="routine-items">
          {AVAILABLE_ITEMS.map(item => (
            <label key={item} className="routine-item-checkbox">
              <input
                type="checkbox"
                checked={items.includes(item)}
                onChange={() => handleItemToggle(routineType, item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">루틴을 불러오는 중...</div>;
  }

  return (
    <div className="routine-setting-container">
      <div className="routine-setting-header">
        <h2>루틴 설정</h2>
        {onNavigateToCheck && (
          <button className="check-button" onClick={onNavigateToCheck}>
            루틴 체크
          </button>
        )}
      </div>
      
      {renderRoutineSection('아침 루틴', 'MORNING', morningRoutine)}
      {renderRoutineSection('운동 루틴', 'EVENING', eveningRoutine)}

      {message && (
        <div className={`message ${message.includes('저장') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button 
        className="save-button" 
        onClick={handleSave} 
        disabled={saving}
      >
        {saving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}

export default RoutineSetting;

