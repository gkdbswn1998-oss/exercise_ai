import React, { useState, useEffect } from 'react';
import './ExerciseRecord.css';
import { getCurrentUser } from './auth';
import { getExerciseRecord, saveExerciseRecord, uploadExerciseImages, getExerciseRecordsByDateRange } from './exerciseApi';

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
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [recordedDates, setRecordedDates] = useState(new Set()); // 기록이 있는 날짜들
  const [incompleteRecordDates, setIncompleteRecordDates] = useState(new Set()); // 불완전한 기록이 있는 날짜들

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
          musclePercentage: record.musclePercentage || '',
          exerciseType: record.exerciseType || '',
          exerciseDuration: record.exerciseDuration || ''
        });
        
        // imageUrl을 파싱 (JSON 배열 또는 단일 문자열)
        let urls = [];
        if (record.imageUrl) {
          try {
            urls = JSON.parse(record.imageUrl);
            if (!Array.isArray(urls)) {
              urls = [record.imageUrl]; // 단일 URL인 경우 배열로 변환
            }
          } catch (e) {
            urls = [record.imageUrl]; // JSON이 아닌 경우 단일 URL로 처리
          }
        }
        setImageUrls(urls);
        const previews = urls.map(url => 
          url.startsWith('http') ? url : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`
        );
        setImagePreviews(previews);
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
        setImageUrls([]);
        setImagePreviews([]);
        setSelectedImages([]);
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 이미지 파일인지 확인
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setMessage('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 확인 (10MB 제한)
    const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (largeFiles.length > 0) {
      setMessage('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);
    setMessage('');

    // 미리보기 생성 (Promise로 처리)
    const previewPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    try {
      // 모든 미리보기 생성 대기
      const newPreviews = await Promise.all(previewPromises);
      setImagePreviews(prev => [...prev, ...newPreviews]);

      // 여러 파일 업로드
      const uploadedUrls = await uploadExerciseImages(files);
      setImageUrls(prev => [...prev, ...uploadedUrls]);
      setSelectedImages(prev => [...prev, ...files]);
      setMessage(`${files.length}개의 사진이 업로드되었습니다.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      setMessage('사진 업로드에 실패했습니다.');
      // 실패한 파일의 미리보기 제거
      setImagePreviews(prev => prev.slice(0, prev.length - files.length));
    } finally {
      setUploadingImage(false);
      // input 초기화
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
                                record.musclePercentage && 
                                record.exerciseType && 
                                record.exerciseDuration;
            
            if (hasAllFields) {
              dates.add(normalizedDate);
            } else {
              // 하나라도 입력되어 있으면 불완전한 기록으로 표시
              const hasAnyField = record.weight || 
                                 record.bodyFatPercentage || 
                                 record.muscleMass || 
                                 record.musclePercentage || 
                                 record.exerciseType || 
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
      // imageUrls를 JSON 문자열로 변환
      const imageUrlJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
      
      const result = await saveExerciseRecord({
        recordDate: dateStr,
        ...formData,
        imageUrl: imageUrlJson
      });

      if (result) {
        setMessage('기록이 저장되었습니다!');
        setTimeout(() => setMessage(''), 3000);
        // 저장 후 선택된 이미지 초기화 (이미 URL로 저장되었으므로)
        setSelectedImages([]);
        // 기록이 있는 날짜에 즉시 추가 (모든 필드가 채워져 있는지 확인)
        const hasAllFields = formData.weight && 
                            formData.bodyFatPercentage && 
                            formData.muscleMass && 
                            formData.musclePercentage && 
                            formData.exerciseType && 
                            formData.exerciseDuration;
        
        const hasAnyField = formData.weight || 
                           formData.bodyFatPercentage || 
                           formData.muscleMass || 
                           formData.musclePercentage || 
                           formData.exerciseType || 
                           formData.exerciseDuration || 
                           imageUrls.length > 0;
        
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

            <div className="form-group image-upload-group">
              <label htmlFor="image">사진 첨부 (여러 장 선택 가능)</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image" className="image-upload-button">
                  {uploadingImage ? '업로드 중...' : '사진 선택'}
                </label>
                {imagePreviews.length > 0 && (
                  <div className="image-previews-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-container">
                        <img src={preview} alt={`미리보기 ${index + 1}`} className="image-preview" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="remove-image-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('저장') || message.includes('업로드') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button type="submit" className="save-button" disabled={saving || uploadingImage}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ExerciseRecord;

