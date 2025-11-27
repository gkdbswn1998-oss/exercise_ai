import React, { useState, useEffect } from 'react';
import './ExerciseRecord.css';
import { getCurrentUser } from './auth';
import { getExerciseRecord, saveExerciseRecord, getExerciseRecordsByDateRange } from './exerciseApi';
import { getRoutineByType, getRoutineChecksByDate, saveRoutineCheck } from './routineApi';

function ExerciseRecord() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    exerciseDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [recordedDates, setRecordedDates] = useState(new Set()); // 기록이 있는 날짜들
  const [incompleteRecordDates, setIncompleteRecordDates] = useState(new Set()); // 불완전한 기록이 있는 날짜들
  const [morningRoutine, setMorningRoutine] = useState([]); // 아침 루틴 항목들
  const [eveningRoutine, setEveningRoutine] = useState([]); // 저녁 루틴 항목들
  const [morningChecked, setMorningChecked] = useState([]); // 아침 루틴 체크된 항목들
  const [eveningChecked, setEveningChecked] = useState([]); // 저녁 루틴 체크된 항목들
  const [routineSaving, setRoutineSaving] = useState(false);

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
    loadRoutines();
    loadRoutineChecks();
  }, [selectedDate]);

  // 현재 월의 모든 기록 불러오기 (캘린더 표시용)
  useEffect(() => {
    loadMonthRecords();
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
          exerciseDuration: record.exerciseDuration || ''
        });
        
      } else {
        // 기록이 없으면 폼 초기화 (정상적인 상황)
        setFormData({
          weight: '',
          bodyFatPercentage: '',
          muscleMass: '',
          exerciseDuration: ''
        });
        // 기록이 없으면 불완전한 기록 목록에서도 제거
        const dateStr = formatDate(selectedDate);
        setIncompleteRecordDates(prev => {
          const newSet = new Set(prev);
          newSet.delete(dateStr);
          return newSet;
        });
        setRecordedDates(prev => {
          const newSet = new Set(prev);
          newSet.delete(dateStr);
          return newSet;
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


  // 날짜 문자열 정규화 함수
  const normalizeDateString = (dateValue) => {
    if (!dateValue) return null;
    
    // 이미 YYYY-MM-DD 형식의 문자열인 경우
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // Date 객체인 경우
    if (dateValue instanceof Date) {
      return formatDate(dateValue);
    }
    
    // 객체인 경우 (LocalDate 직렬화 결과)
    if (typeof dateValue === 'object') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
      // {year, month, day} 형식인 경우
      if (dateValue.year && dateValue.month && dateValue.day) {
        const year = dateValue.year;
        const month = String(dateValue.month).padStart(2, '0');
        const day = String(dateValue.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  };

  // 현재 월의 모든 기록 불러오기
  const loadMonthRecords = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      // 월의 첫날과 마지막날 계산
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = formatDate(firstDay);
      const endDate = formatDate(lastDay);
      
      const records = await getExerciseRecordsByDateRange(startDate, endDate);
      
      // 기록이 있는 날짜들을 Set에 저장 (날짜 형식 정규화)
      const dates = new Set();
      const incompleteDates = new Set();
      
      records.forEach(record => {
        if (record.recordDate) {
          const normalizedDate = normalizeDateString(record.recordDate);
          if (normalizedDate) {
            // 모든 필드가 채워져 있는지 확인
            const hasAllFields = record.weight && 
                                record.bodyFatPercentage && 
                                record.muscleMass && 
                                record.exerciseDuration;
            
            if (hasAllFields) {
              dates.add(normalizedDate);
            } else {
              // 하나라도 입력되어 있으면 불완전한 기록으로 표시
              const hasAnyField = record.weight || 
                                 record.bodyFatPercentage || 
                                 record.muscleMass || 
                                 record.exerciseDuration ||
                                 record.imageUrl;
              if (hasAnyField) {
                incompleteDates.add(normalizedDate);
              }
            }
          }
        }
      });
      
      setRecordedDates(dates);
      setIncompleteRecordDates(incompleteDates);
    } catch (error) {
      console.error('월별 기록 조회 오류:', error);
    }
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
        // 기록이 있는 날짜에 즉시 추가 (모든 필드가 채워져 있는지 확인)
        const hasAllFields = formData.weight && 
                            formData.bodyFatPercentage && 
                            formData.muscleMass && 
                            formData.exerciseDuration;
        
        const hasAnyField = formData.weight || 
                           formData.bodyFatPercentage || 
                           formData.muscleMass || 
                           formData.exerciseDuration;
        
        if (hasAllFields) {
          // 모든 필드가 채워져 있으면 초록원
          setRecordedDates(prev => new Set([...prev, dateStr]));
          setIncompleteRecordDates(prev => {
            const newSet = new Set(prev);
            newSet.delete(dateStr);
            return newSet;
          });
        } else if (hasAnyField) {
          // 하나라도 입력되어 있지만 모든 필드가 채워지지 않았으면 주황원
          setIncompleteRecordDates(prev => new Set([...prev, dateStr]));
          setRecordedDates(prev => {
            const newSet = new Set(prev);
            newSet.delete(dateStr);
            return newSet;
          });
        }
        // 월별 기록 다시 불러오기 (서버에서 최신 데이터 확인)
        await loadMonthRecords();
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

  // 루틴 설정 불러오기
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

  // 루틴 체크 불러오기
  const loadRoutineChecks = async () => {
    try {
      const dateStr = formatDate(selectedDate);
      const checks = await getRoutineChecksByDate(dateStr);
      
      const morningCheck = checks.find(c => c.routineType === 'MORNING');
      const eveningCheck = checks.find(c => c.routineType === 'EVENING');
      
      setMorningChecked(morningCheck?.checkedItems || []);
      setEveningChecked(eveningCheck?.checkedItems || []);
    } catch (error) {
      console.error('루틴 체크 조회 오류:', error);
    }
  };

  // 루틴 체크 토글
  const handleRoutineItemToggle = async (routineType, item) => {
    const currentChecked = routineType === 'MORNING' ? morningChecked : eveningChecked;
    const newChecked = currentChecked.includes(item)
      ? currentChecked.filter(i => i !== item)
      : [...currentChecked, item];

    if (routineType === 'MORNING') {
      setMorningChecked(newChecked);
    } else {
      setEveningChecked(newChecked);
    }

    setRoutineSaving(true);

    try {
      const dateStr = formatDate(selectedDate);
      await saveRoutineCheck({
        checkDate: dateStr,
        routineType: routineType,
        checkedItems: newChecked
      });
    } catch (error) {
      console.error('루틴 체크 저장 오류:', error);
      // 원래 상태로 복구
      if (routineType === 'MORNING') {
        setMorningChecked(currentChecked);
      } else {
        setEveningChecked(currentChecked);
      }
    } finally {
      setRoutineSaving(false);
    }
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
              const dateStr = formatDate(dayInfo.date);
              const hasRecord = recordedDates.has(dateStr);
              const hasIncompleteRecord = incompleteRecordDates.has(dateStr);
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${hasRecord ? 'has-record' : ''} ${hasIncompleteRecord ? 'has-incomplete-record' : ''}`}
                  onClick={() => handleDateClick(dayInfo.date)}
                >
                  {dayInfo.date.getDate()}
                  {hasRecord && <span className="record-indicator record-indicator-complete"></span>}
                  {hasIncompleteRecord && <span className="record-indicator record-indicator-incomplete"></span>}
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

            {/* 루틴 체크 섹션 */}
            {(morningRoutine.length > 0 || eveningRoutine.length > 0) && (
              <div className="routine-check-section">
                <div className="routine-check-row">
                  {morningRoutine.length > 0 && (
                    <div className="routine-check-group">
                      <h4>아침 루틴</h4>
                      <div className="routine-check-items">
                        {morningRoutine.map(item => (
                          <label key={item} className="routine-check-item">
                            <input
                              type="checkbox"
                              checked={morningChecked.includes(item)}
                              onChange={() => handleRoutineItemToggle('MORNING', item)}
                              disabled={routineSaving}
                            />
                            <span className={morningChecked.includes(item) ? 'checked' : ''}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {eveningRoutine.length > 0 && (
                    <div className="routine-check-group">
                      <h4>운동 루틴</h4>
                      <div className="routine-check-items">
                        {eveningRoutine.map(item => (
                          <label key={item} className="routine-check-item">
                            <input
                              type="checkbox"
                              checked={eveningChecked.includes(item)}
                              onChange={() => handleRoutineItemToggle('EVENING', item)}
                              disabled={routineSaving}
                            />
                            <span className={eveningChecked.includes(item) ? 'checked' : ''}>
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

