import React, { useState, useEffect } from 'react';
import './ExerciseRecord.css';
import { getCurrentUser } from './auth';
import { getExerciseRecord, saveExerciseRecord } from './exerciseApi';

function ExerciseRecord() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    musclePercentage: '',
    exerciseType: '',
    exerciseDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 날짜 포맷팅
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜가 오늘인지 확인
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 선택된 날짜의 기록 불러오기
  useEffect(() => {
    loadRecord();
  }, [selectedDate]);

  const loadRecord = async () => {
    setLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      const record = await getExerciseRecord(dateStr);
      
      if (record) {
        setFormData({
          weight: record.weight || '',
          bodyFatPercentage: record.bodyFatPercentage || '',
          muscleMass: record.muscleMass || '',
          musclePercentage: record.musclePercentage || '',
          exerciseType: record.exerciseType || '',
          exerciseDuration: record.exerciseDuration || ''
        });
      } else {
        // 기록이 없으면 폼 초기화 (정상적인 상황)
        setFormData({
          weight: '',
          bodyFatPercentage: '',
          muscleMass: '',
          musclePercentage: '',
          exerciseType: '',
          exerciseDuration: ''
        });
      }
    } catch (error) {
      console.error('기록 불러오기 오류:', error);
      // 네트워크 오류 등 실제 오류인 경우에만 메시지 표시
      if (error.message && error.message.includes('fetch')) {
        setMessage('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setMessage('기록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const dateStr = formatDate(selectedDate);
      const result = await saveExerciseRecord({
        recordDate: dateStr,
        ...formData
      });

      if (result) {
        setMessage('기록이 저장되었습니다!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('기록 저장 오류:', error);
      setMessage('기록 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 달력 생성
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // 다음 달의 첫 날들
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const calendarDays = getCalendarDays();
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="exercise-record-container">

      <div className="calendar-section">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="month-nav-button">‹</button>
          <h2>{selectedDate.getFullYear()}년 {monthNames[selectedDate.getMonth()]}</h2>
          <button onClick={handleNextMonth} className="month-nav-button">›</button>
        </div>
        <button onClick={handleToday} className="today-button">오늘</button>
        
        <div className="calendar">
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((dayInfo, index) => {
              const isSelected = dayInfo.date.toDateString() === selectedDate.toDateString();
              const isTodayDate = isToday(dayInfo.date);
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => handleDateClick(dayInfo.date)}
                >
                  {dayInfo.date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="record-form-section">
        <h2>{formatDate(selectedDate)} {isToday(selectedDate) ? '(오늘)' : ''}</h2>
        
        {loading ? (
          <div className="loading">기록을 불러오는 중...</div>
        ) : (
          <form onSubmit={handleSubmit} className="record-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">체중 (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="예: 70.5"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bodyFatPercentage">체지방률 (%)</label>
                <input
                  type="number"
                  id="bodyFatPercentage"
                  name="bodyFatPercentage"
                  value={formData.bodyFatPercentage}
                  onChange={handleChange}
                  placeholder="예: 15.5"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="muscleMass">근육량 (kg)</label>
                <input
                  type="number"
                  id="muscleMass"
                  name="muscleMass"
                  value={formData.muscleMass}
                  onChange={handleChange}
                  placeholder="예: 55.0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="musclePercentage">근육률 (%)</label>
                <input
                  type="number"
                  id="musclePercentage"
                  name="musclePercentage"
                  value={formData.musclePercentage}
                  onChange={handleChange}
                  placeholder="예: 45.0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exerciseType">운동종류</label>
                <input
                  type="text"
                  id="exerciseType"
                  name="exerciseType"
                  value={formData.exerciseType}
                  onChange={handleChange}
                  placeholder="예: 러닝, 헬스, 테니스"
                />
              </div>

              <div className="form-group">
                <label htmlFor="exerciseDuration">운동시간 (분)</label>
                <input
                  type="number"
                  id="exerciseDuration"
                  name="exerciseDuration"
                  value={formData.exerciseDuration}
                  onChange={handleChange}
                  placeholder="예: 60"
                  min="0"
                />
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('저장') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" className="save-button" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ExerciseRecord;

