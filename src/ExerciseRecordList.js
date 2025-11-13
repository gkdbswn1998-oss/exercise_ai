import React, { useState, useEffect } from 'react';
import './ExerciseRecordList.css';
import { getExerciseRecordsByDateRange } from './exerciseApi';

function ExerciseRecordList() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');

  const recordsPerPage = 10;

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    setStartDate(formatDate(oneMonthAgo));
    setEndDate(formatDate(today));
  }, []);

  // 날짜가 설정되면 자동으로 조회
  useEffect(() => {
    if (startDate && endDate) {
      handleSearch();
    }
  }, [startDate, endDate]);

  const formatDate = (date) => {
    if (typeof date === 'string') return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}-${month}-${day} (${weekday})`;
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setMessage('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }

    setLoading(true);
    setMessage('');
    setCurrentPage(1);

    try {
      const allRecords = await getExerciseRecordsByDateRange(startDate, endDate);
      
      // 날짜순으로 정렬 (최신순)
      allRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      
      setRecords(allRecords);
      setTotalPages(Math.ceil(allRecords.length / recordsPerPage));
    } catch (error) {
      console.error('기록 조회 오류:', error);
      setMessage('기록을 불러오는 중 오류가 발생했습니다.');
      setRecords([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 현재 페이지의 기록들
  const getCurrentPageRecords = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return records.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentRecords = getCurrentPageRecords();

  return (
    <div className="exercise-record-list-container">
      <div className="date-filter-section">
        <h2>기간별 운동 기록 조회</h2>
        <div className="date-inputs">
          <div className="date-input-group">
            <label htmlFor="startDate">시작일</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="date-separator">~</span>
          <div className="date-input-group">
            <label htmlFor="endDate">종료일</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button onClick={handleSearch} className="search-button" disabled={loading}>
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
        {message && (
          <div className={`message ${message.includes('오류') ? 'error' : 'info'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="records-section">
        {loading ? (
          <div className="loading">기록을 불러오는 중...</div>
        ) : records.length === 0 ? (
          <div className="no-records">조회된 기록이 없습니다.</div>
        ) : (
          <>
            <div className="records-header">
              <h3>총 {records.length}건의 기록</h3>
            </div>
            
            <div className="records-list">
              {currentRecords.map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-date">
                    {formatDisplayDate(record.recordDate)}
                  </div>
                  <div className="record-content">
                    <div className="record-row">
                      <div className="record-field">
                        <span className="field-label">체중:</span>
                        <span className="field-value">{record.weight ? `${record.weight} kg` : '-'}</span>
                      </div>
                      <div className="record-field">
                        <span className="field-label">체지방률:</span>
                        <span className="field-value">{record.bodyFatPercentage ? `${record.bodyFatPercentage}%` : '-'}</span>
                      </div>
                    </div>
                    <div className="record-row">
                      <div className="record-field">
                        <span className="field-label">근육량:</span>
                        <span className="field-value">{record.muscleMass ? `${record.muscleMass} kg` : '-'}</span>
                      </div>
                      <div className="record-field">
                        <span className="field-label">근육률:</span>
                        <span className="field-value">{record.musclePercentage ? `${record.musclePercentage}%` : '-'}</span>
                      </div>
                    </div>
                    <div className="record-row">
                      <div className="record-field">
                        <span className="field-label">운동종류:</span>
                        <span className="field-value">{record.exerciseType || '-'}</span>
                      </div>
                      <div className="record-field">
                        <span className="field-label">운동시간:</span>
                        <span className="field-value">{record.exerciseDuration ? `${record.exerciseDuration}분` : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="page-button"
                >
                  이전
                </button>
                <span className="page-info">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="page-button"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExerciseRecordList;



