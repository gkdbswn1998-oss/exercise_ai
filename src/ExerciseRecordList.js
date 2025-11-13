import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ExerciseRecordList.css';
import { getExerciseRecordsByDateRange, saveExerciseRecord } from './exerciseApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function ExerciseRecordList() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    musclePercentage: '',
    exerciseType: '',
    exerciseDuration: ''
  });
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState('항목별 조회');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const recordsPerPage = 10;
  
  const tabOptions = ['항목별 조회', '체중', '체지방률', '근육량', '근육률', '운동종류', '운동시간'];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // 탭 변경 시 페이지 수 재계산
  useEffect(() => {
    if (records.length > 0) {
      const filteredCount = selectedTab === '항목별 조회' ? records.length : 
        records.filter(record => {
          switch (selectedTab) {
            case '체중': return record.weight && record.weight !== '';
            case '체지방률': return record.bodyFatPercentage && record.bodyFatPercentage !== '';
            case '근육량': return record.muscleMass && record.muscleMass !== '';
            case '근육률': return record.musclePercentage && record.musclePercentage !== '';
            case '운동종류': return record.exerciseType && record.exerciseType !== '';
            case '운동시간': return record.exerciseDuration && record.exerciseDuration !== '';
            default: return true;
          }
        }).length;
      setTotalPages(Math.ceil(filteredCount / recordsPerPage));
      setCurrentPage(1);
    }
  }, [selectedTab, records]);

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
    } catch (error) {
      console.error('기록 조회 오류:', error);
      setMessage('기록을 불러오는 중 오류가 발생했습니다.');
      setRecords([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 탭별 필터링된 기록들
  const getFilteredRecords = () => {
    if (selectedTab === '항목별 조회') {
      return records;
    }
    
    return records.filter(record => {
      switch (selectedTab) {
        case '체중':
          return record.weight && record.weight !== '';
        case '체지방률':
          return record.bodyFatPercentage && record.bodyFatPercentage !== '';
        case '근육량':
          return record.muscleMass && record.muscleMass !== '';
        case '근육률':
          return record.musclePercentage && record.musclePercentage !== '';
        case '운동종류':
          return record.exerciseType && record.exerciseType !== '';
        case '운동시간':
          return record.exerciseDuration && record.exerciseDuration !== '';
        default:
          return true;
      }
    });
  };

  // 현재 페이지의 기록들
  const getCurrentPageRecords = () => {
    const filteredRecords = getFilteredRecords();
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  };

  // 필터링된 기록의 총 개수
  const filteredRecordsCount = getFilteredRecords().length;

  // 그래프 데이터 준비
  const chartData = useMemo(() => {
    if (selectedTab === '항목별 조회' || selectedTab === '운동종류') {
      return [];
    }

    // 필터링된 기록 가져오기
    let filteredRecords = [];
    if (selectedTab === '항목별 조회') {
      filteredRecords = records;
    } else {
      filteredRecords = records.filter(record => {
        switch (selectedTab) {
          case '체중':
            return record.weight && record.weight !== '';
          case '체지방률':
            return record.bodyFatPercentage && record.bodyFatPercentage !== '';
          case '근육량':
            return record.muscleMass && record.muscleMass !== '';
          case '근육률':
            return record.musclePercentage && record.musclePercentage !== '';
          case '운동시간':
            return record.exerciseDuration && record.exerciseDuration !== '';
          default:
            return true;
        }
      });
    }

    if (filteredRecords.length === 0) {
      return [];
    }

    // 날짜순으로 정렬 (오름차순)
    const sortedRecords = [...filteredRecords].sort((a, b) => 
      new Date(a.recordDate) - new Date(b.recordDate)
    );

    return sortedRecords.map(record => {
      let value = null;
      let label = '';

      switch (selectedTab) {
        case '체중':
          value = record.weight ? parseFloat(record.weight) : null;
          label = '체중 (kg)';
          break;
        case '체지방률':
          value = record.bodyFatPercentage ? parseFloat(record.bodyFatPercentage) : null;
          label = '체지방률 (%)';
          break;
        case '근육량':
          value = record.muscleMass ? parseFloat(record.muscleMass) : null;
          label = '근육량 (kg)';
          break;
        case '근육률':
          value = record.musclePercentage ? parseFloat(record.musclePercentage) : null;
          label = '근육률 (%)';
          break;
        case '운동시간':
          value = record.exerciseDuration ? parseInt(record.exerciseDuration) : null;
          label = '운동시간 (분)';
          break;
        default:
          return null;
      }

      if (value === null) return null;

      const date = new Date(record.recordDate);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return {
        date: `${month}/${day}`,
        fullDate: record.recordDate,
        value: value,
        label: label
      };
    }).filter(item => item !== null);
  }, [selectedTab, records]);

  // 그래프 Y축 레이블
  const getYAxisLabel = () => {
    switch (selectedTab) {
      case '체중':
        return '체중 (kg)';
      case '체지방률':
        return '체지방률 (%)';
      case '근육량':
        return '근육량 (kg)';
      case '근육률':
        return '근육률 (%)';
      case '운동시간':
        return '운동시간 (분)';
      default:
        return '';
    }
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

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.tab-section')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setEditFormData({
      weight: record.weight || '',
      bodyFatPercentage: record.bodyFatPercentage || '',
      muscleMass: record.muscleMass || '',
      musclePercentage: record.musclePercentage || '',
      exerciseType: record.exerciseType || '',
      exerciseDuration: record.exerciseDuration || ''
    });
    
  };

  const handleCloseEditModal = () => {
    setEditingRecord(null);
    setEditFormData({
      weight: '',
      bodyFatPercentage: '',
      muscleMass: '',
      musclePercentage: '',
      exerciseType: '',
      exerciseDuration: ''
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    setSaving(true);
    setMessage('');

    try {
      const result = await saveExerciseRecord({
        recordDate: editingRecord.recordDate,
        ...editFormData
      });

      if (result) {
        setMessage('기록이 수정되었습니다!');
        setTimeout(() => setMessage(''), 3000);
        handleCloseEditModal();
        // 목록 새로고침
        handleSearch();
      }
    } catch (error) {
      console.error('기록 수정 오류:', error);
      setMessage('기록 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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

      {/* 탭 섹션 */}
      <div className="tab-section">
        <div className="tab-section-content">
          <div className="tab-dropdown-container">
            <button
              className={`tab-dropdown-button ${isDropdownOpen ? 'open' : ''}`}
              onClick={handleDropdownToggle}
            >
              <span>{selectedTab}</span>
              <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isDropdownOpen && (
              <div className="tab-dropdown-menu">
                {tabOptions.map((option) => (
                  <button
                    key={option}
                    className={`tab-dropdown-item ${selectedTab === option ? 'active' : ''}`}
                    onClick={() => handleTabChange(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 그래프 섹션 */}
          {selectedTab !== '항목별 조회' && selectedTab !== '운동종류' && chartData.length > 0 && (
            <div className="chart-section-inline">
              <div className="chart-container-inline">
                <h4 className="chart-title-inline">{selectedTab} 추이</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                      label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => {
                        const unit = selectedTab === '체중' || selectedTab === '근육량' ? 'kg' : 
                                     selectedTab === '체지방률' || selectedTab === '근육률' ? '%' : '분';
                        return [`${value}${unit}`, selectedTab];
                      }}
                      labelFormatter={(label) => `날짜: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#000" 
                      strokeWidth={2}
                      dot={{ fill: '#000', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="records-section">
        {loading ? (
          <div className="loading">기록을 불러오는 중...</div>
        ) : records.length === 0 ? (
          <div className="no-records">조회된 기록이 없습니다.</div>
        ) : filteredRecordsCount === 0 ? (
          <div className="no-records">{selectedTab} 기록이 없습니다.</div>
        ) : (
          <>
            <div className="records-header">
              <h3>기록 {records.length}건</h3>
            </div>
            
            <div className="records-list">
              {currentRecords.map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-date-header">
                    <div className="record-date">
                      {formatDisplayDate(record.recordDate)}
                    </div>
                    <button
                      className="edit-record-button"
                      onClick={() => handleEditRecord(record)}
                    >
                      수정하기
                    </button>
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

      {/* 수정 모달 */}
      {editingRecord && (
        <div className="edit-modal-overlay" onClick={handleCloseEditModal}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>운동 기록 수정</h2>
              <button className="edit-modal-close" onClick={handleCloseEditModal}>×</button>
            </div>
            
            <div className="edit-modal-body">
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label>체중 (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={editFormData.weight}
                    onChange={handleEditFormChange}
                    placeholder="예: 70.5"
                    step="0.1"
                  />
                </div>
                <div className="edit-form-group">
                  <label>체지방률 (%)</label>
                  <input
                    type="number"
                    name="bodyFatPercentage"
                    value={editFormData.bodyFatPercentage}
                    onChange={handleEditFormChange}
                    placeholder="예: 15.5"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label>근육량 (kg)</label>
                  <input
                    type="number"
                    name="muscleMass"
                    value={editFormData.muscleMass}
                    onChange={handleEditFormChange}
                    placeholder="예: 55.0"
                    step="0.1"
                  />
                </div>
                <div className="edit-form-group">
                  <label>근육률 (%)</label>
                  <input
                    type="number"
                    name="musclePercentage"
                    value={editFormData.musclePercentage}
                    onChange={handleEditFormChange}
                    placeholder="예: 45.0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label>운동종류</label>
                  <input
                    type="text"
                    name="exerciseType"
                    value={editFormData.exerciseType}
                    onChange={handleEditFormChange}
                    placeholder="예: 러닝, 헬스, 테니스"
                  />
                </div>
                <div className="edit-form-group">
                  <label>운동시간 (분)</label>
                  <input
                    type="number"
                    name="exerciseDuration"
                    value={editFormData.exerciseDuration}
                    onChange={handleEditFormChange}
                    placeholder="예: 60"
                    min="0"
                  />
                </div>
              </div>

              {message && (
                <div className={`message ${message.includes('수정') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>

            <div className="edit-modal-footer">
              <button className="edit-cancel-button" onClick={handleCloseEditModal}>
                취소
              </button>
              <button className="edit-save-button" onClick={handleSaveEdit} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ExerciseRecordList;



