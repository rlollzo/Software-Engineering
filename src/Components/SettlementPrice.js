import React, { useState } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { selectData } from '../data/classItem.js';
import { Bar } from 'react-chartjs-2'; // Line 대신 Bar 컴포넌트 불러오기
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement, // BarElement 추가
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement,LineElement, Title, Tooltip, Legend);

const ChartContainer = styled.div`
  margin: 20px 0;
  overflow-x: auto; /* X축 스크롤 가능 */
  white-space: nowrap;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;
// ChartSection 크기 조정
const ChartSection = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  height: 300px; /* 고정된 높이 */
  display: flex;
  flex-direction: column; /* 제목과 그래프를 세로로 배치 */
`;
const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 10px; /* 그래프와 제목 간격 */
`;
const SearchSection = styled.div`
margin: 20px 0;
display: flex;
gap: 10px;
justify-content: center;     /* 가운데 정렬 */
`;

const SummarySection = styled.div`
margin: 20px 0;
padding: 20px;
background-color: #f9f9f9;
border-radius: 8px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
width: 100%;
border-collapse: collapse;
margin-top: 20px;
`;

const TableHeader = styled.th`
background-color: #007aff;
color: white;
padding: 10px;
text-align: left;
border: 1px solid #ddd;
`;

const TableCell = styled.td`
padding: 10px;
border: 1px solid #ddd;
text-align: left;
`;
// ============================ ADD ===========================
const SelectContainer = styled.select`
  width: 120px;
  height: 30px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 14px;
  padding: 0 10px 0 6px;
  color: #353535;
  margin: 5px 10px 0px 5px;
  justify-content: center;     /* 가운데 정렬 */
`; 
const Option = styled.option``;
 // 데이터 로드 함수 예시
const gradeColors = {
  특: '#FF5733', // 예: 특 등급에 빨간색
  상: '#FFC300', // 상 등급에 노란색
  보통: '#3357FF', // 보통 등급에 파란색
  하: '#33FF57', // 하 등급에 초록색
};
// CSS Grid 컨테이너 추가
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2개의 열 */
  grid-gap: 20px; /* 그래프 간의 간격 */
  margin: 40px 0;
`;
const PageDescription = styled.div`
  background-color: #ccffcc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
`;
// ===============================================================

const Home = () => {
  const API_SERVER_URL = 'http://localhost:4444/apiSale'; // API URL

  const [item, setitem] = useState([]); // 검색된 데이터 저장 
  const [chartData, setChartData] = useState(null); // 차트 데이터 저장
  const [chartDatastd, setChartDatastd] = useState(null); // 차트 데이터 저장
  const [chartDatalv, setChartDatalv] = useState(null); // 차트 데이터 저장
  const [ChartDatasan, setChartDatasan] = useState(null); // 차트 데이터 저장
  const [chartDatadatelv, setChartDatadatelv] = useState(null); // 차트 데이터 저장
  const [noDataMessage, setNoDataMessage] = useState(''); // 데이터 없음 메시지 상태

  // ==========================Add ===============================
  // [Date]
  const [selectedYear, setSelectedYear] = useState("default");
  const [selectedMonth, setSelectedMonth] = useState("default");
  const [selectedDay, setSelectedDay] = useState("default"); 
  // [Class & Item]
  const optionList = selectData 
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const selectedClassData = optionList.find(option => option.class_code === selectedClass); 
  
 //[Date]
  const selectList_Year = Array.from({ length: 2024 - 2018 + 1 }, (_, i) => ({
    value: (2018 + i).toString(),
    name: (2018 + i).toString(),
  })); 
  // MONTH
  const selectList_Month = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),  
    name: (i + 1).toString().padStart(2, "0"),
  }));
  // DAY
  const selectList_Day = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"), 
    name: (i + 1).toString().padStart(2, "0"),
  }));

  // [Class & Item] 
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setSelectedItem(""); 
  }; 
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(false); // 에러 상태
// ===============================================================

  
  
  // ========================== MODIFY ===============================
  const handleSearch = async () => {
    setLoading(true);
    setError(false);
    setNoDataMessage(''); // 기존 메시지 초기화
    if (
      !selectedYear || selectedYear === "default" || 
      !selectedMonth || selectedMonth === "default" || 
      !selectedDay || selectedDay === "default"
    ) {
      alert('Please select a valid date.');
      return;
    }

    const currentResult = `${selectedYear}${String(selectedMonth).padStart(2, '0')}${String(selectedDay).padStart(2, '0')}`;
    const params = new URLSearchParams({
      saleDate: currentResult,
      large: selectedClass,
      mid: selectedItem,
    });
   
    try {
      //const response = await fetch(API_SERVER_URL);
      const response =await fetch(`${API_SERVER_URL}?${params.toString()}`, {  
        method: 'GET',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })   
      const data = await response.json(); 
      if (data.length === 0) {
        // 서버의 로그 메시지를 클라이언트로 표시
        const message = `데이터가 없습니다 다른날을 선택하세요.`;
        setNoDataMessage(message);
        setError(true);
      }
      setitem(data);
      //규격별 그래프
      const stdGroupedData = data.reduce((acc, item) => {
        const key = item.std; // 규격별로 그룹화
        if (!acc[key]) {
          acc[key] = { totQty: 0, avgAmt: 0, count: 0 };
        }
        acc[key].totQty += item.totQty;
        acc[key].avgAmt += item.avgAmt;
        acc[key].count += 1;
        return acc;
      }, {});
      
      const stdData = Object.keys(stdGroupedData).map((key) => ({
        std: key,
        totQty: stdGroupedData[key].totQty,
        avgAmt: stdGroupedData[key].avgAmt / stdGroupedData[key].count,
      }));
      
      setChartDatastd({
        labels: stdData.map((item) => item.std),
        datasets: [
          {
            label: '총 수량 (totQty)',
            data: stdData.map((item) => item.totQty),
            backgroundColor: '#007bff',
          },
          {
            label: '평균 금액 (avgAmt)',
            data: stdData.map((item) => item.avgAmt),
            backgroundColor: '#28a745',
          },
        ],
      });
      //등급 및 날짜별 가격
      const lvGroupedData = data.reduce((acc, item) => {
        const key = `${item.saleDate}_${item.lvName}`; // 날짜와 등급 조합
        if (!acc[key]) {
          acc[key] = { avgAmt: 0, count: 0 };
        }
        acc[key].avgAmt += item.avgAmt;
        acc[key].count += 1;
        return acc;
      }, {});
      
      const lvData = Object.entries(lvGroupedData).map(([key, value]) => {
        const [saleDate, lvName] = key.split('_');
        return { saleDate, lvName, avgAmt: value.avgAmt / value.count };
      });
      
      setChartDatalv({
        labels: Array.from(new Set(lvData.map((item) => item.saleDate))), // 날짜별로 X축 생성
        datasets: Array.from(new Set(lvData.map((item) => item.lvName))).map((lvName) => ({
          label: lvName,
          data: lvData
            .filter((item) => item.lvName === lvName)
            .map((item) => item.avgAmt),
          backgroundColor: gradeColors[lvName] || '#999999', // 등급별 지정된 색상
          borderColor: gradeColors[lvName] || '#999999', // 테두리 색상도 동일 적용
          borderWidth: 1,
          barThickness: 20,
        })),
      });
      //출하지역별 평균 가격
      const sanGroupedData = data.reduce((acc, item) => {
        const key = item.sanName; // 출하지역 기준
        if (!acc[key]) {
          acc[key] = { avgAmt: 0, count: 0 };
        }
        acc[key].avgAmt += item.avgAmt;
        acc[key].count += 1;
        return acc;
      }, {});
      
      const sanData = Object.keys(sanGroupedData).map((key) => ({
        sanName: key,
        avgAmt: sanGroupedData[key].avgAmt / sanGroupedData[key].count,
      }));
      
      setChartDatasan({
        labels: sanData.map((item) => item.sanName),
        datasets: [
          {
            label: '평균 금액 (avgAmt)',
            data: sanData.map((item) => item.avgAmt),
            backgroundColor: '#ffc107',
          },
        ],
      });
      const dateLvGroupedData = data.reduce((acc, item) => {
        const key = `${item.saleDate}_${item.lvName}`;
        if (!acc[key]) {
          acc[key] = { totQty: 0 };
        }
        acc[key].totQty += item.totQty;
        return acc;
      }, {});
      //날짜별 등급 및 총 수량 변화
      const dateLvData = Object.entries(dateLvGroupedData).map(([key, value]) => {
        const [saleDate, lvName] = key.split('_');
        return { saleDate, lvName, totQty: value.totQty };
      });
      
      setChartDatadatelv({
        labels: Array.from(new Set(dateLvData.map((item) => item.saleDate))),
        datasets: Array.from(new Set(dateLvData.map((item) => item.lvName))).map((lvName) => ({
          label: lvName,
          data: dateLvData
            .filter((item) => item.lvName === lvName)
            .map((item) => item.totQty),
          backgroundColor: gradeColors[lvName] || '#999999', // 등급별 지정된 색상
          borderColor: gradeColors[lvName] || '#999999', // 테두리 색상도 동일 적용
          borderWidth: 1,
          barThickness: 20,
        })),
      });
      
      // 업체명을 기준으로 그룹화
      const groupedData = data.reduce((acc, item) => {
        const key = item.cmpName; 
        if (!acc[key]) {
          acc[key] = {
            cmpName: key,
            totQty: 0,
            avgAmt: 0,
            minAmt: Infinity,
            maxAmt: -Infinity,
            count: 0,
          }; // 새로운 그룹 생성
        }   
        acc[key].totQty += item.totQty; // 총 수량 합산
        acc[key].avgAmt += item.avgAmt; // 평균 금액 합산
        acc[key].minAmt = Math.min(acc[key].minAmt, item.minAmt); // 최소 금액 갱신
        acc[key].maxAmt = Math.max(acc[key].maxAmt, item.maxAmt); // 최대 금액 갱신
        acc[key].count += 1; // 그룹의 개수 카운트
        return acc;
      }, {});
    
      // 그룹화된 데이터를 배열로 변환하고 평균 금액 계산
      const groupedArray = Object.values(groupedData).map(item => ({
        cmpName: item.cmpName,
        totQty: item.totQty,
        avgAmt: item.avgAmt / item.count, // 평균 금액 계산
        minAmt: item.minAmt,
        maxAmt: item.maxAmt,
      }));
    
    // ===============================================================

      // 차트 데이터 생성
      setChartData({
        labels: groupedArray.map((item) => item.cmpName), // X축: 업체명
        datasets: [
          {
            label: '총 수량 (totQty)',
            data: groupedArray.map((item) => item.totQty),
            backgroundColor: '#007bff',
            borderColor: '#0056b3',
            borderWidth: 1,
            barThickness: 20, // 막대 너비 설정
          },
          {
            label: '평균 금액 (avgAmt)',
            data: groupedArray.map((item) => item.avgAmt),
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            borderWidth: 1,
            barThickness: 20,
          },
          {
            label: '최소 금액 (minAmt)',
            data: groupedArray.map((item) => item.minAmt),
            backgroundColor: '#ffc107',
            borderColor: '#e0a800',
            borderWidth: 1,
            barThickness: 20,
          },
          {
            label: '최대 금액 (maxAmt)',
            data: groupedArray.map((item) => item.maxAmt),
            backgroundColor: '#dc3545',
            borderColor: '#c82333',
            borderWidth: 1,
            barThickness: 20,
          },
        ],
      });
      
      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top', // 범례 위치 설정
            labels: {
              font: {
                size: 14, // 폰트 크기
              },
              color: '#333', // 범례 글자 색상
            },
          },
          title: {
            display: true,
            text: '농산물 판매 데이터 히스토그램', // 그래프 제목
            font: {
              size: 18,
            },
          },
          tooltip: {
            enabled: true, // 툴팁 활성화
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw.toLocaleString()} 원`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false, // X축 그리드 숨기기
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#333',
            },
          },
          y: {
            grid: {
              color: '#e0e0e0', // Y축 그리드 색상
              lineWidth: 1,
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#333',
              callback: function (value) {
                return value.toLocaleString(); // Y축 값에 천 단위 구분자 추가
              },
            },
          },
        },
      };
  } catch (error) {
    setError(true);
    console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
  } finally {
    setLoading(false);
  }
};

return (
  <div>
    <ChartContainer>
    {/* 검색 섹션 */}
    <PageDescription>
        <h3>농산물 판매 데이터 검색</h3>
        <p>
        부류, 품목, 품종과 년/월/일을 선택하여 해당 날짜의 판매 데이터를 확인할 수 있습니다. 데이터가 많을 경우 로딩 시간이 길어질 수 있습니다.
        </p>
      </PageDescription>
    <SearchSection>
      
      <div className="Select Box">
        <SelectContainer onChange={handleClassChange} value={selectedClass}>
          <Option value="">부류명</Option>
          {optionList.map(({ class_code, class_name }) => (
            <Option key={class_code} value={class_code}>
              {class_name}
            </Option>
          ))}
        </SelectContainer>

        <SelectContainer
          onChange={(e) => setSelectedItem(e.target.value)}
          value={selectedItem}
          disabled={!selectedClass}
        >
          <Option value="">품목명</Option>
          {selectedClassData &&
            selectedClassData.item.map(({ item_code, item_name }) => (
              <Option key={item_code} value={item_code}>
                {item_name}
              </Option>
            ))}
        </SelectContainer>
      </div>
      <SelectContainer
        onChange={(e) => setSelectedYear(e.target.value)}
        value={selectedYear}
        disabled={!selectedClass}
      >
        <Option value="">YEAR</Option>
        {selectList_Year.map((year) => (
          <Option key={year.value} value={year.value}>
            {year.name}
          </Option>
        ))}
      </SelectContainer>

      <SelectContainer
        onChange={(e) => setSelectedMonth(e.target.value)}
        value={selectedMonth}
        disabled={!selectedYear}
      >
        <Option value="">MONTH</Option>
        {selectList_Month.map((month) => (
          <Option key={month.value} value={month.value}>
            {month.name}
          </Option>
        ))}
      </SelectContainer>

      <SelectContainer
        onChange={(e) => setSelectedDay(e.target.value)}
        value={selectedDay}
        disabled={!selectedMonth}
      >
        <Option value="">DAY</Option>
        {selectList_Day.map((day) => (
          <Option key={day.value} value={day.value}>
            {day.name}
          </Option>
        ))}
      </SelectContainer>

      <button onClick={handleSearch}>검색</button>
    </SearchSection>
    {/* 로딩 상태 */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <CircularProgress />
          <p>로딩 중입니다. 잠시만 기다려 주세요...</p>
        </div>
      )}
      {/* 데이터 없음 메시지 */}
      {!loading && error && (
        <div style={{ textAlign: 'center', margin: '20px 0', color: '#ff0000' }}>
          <p>검색 결과가 없습니다. 다른 조건으로 다시 시도해 주세요.</p>
          {noDataMessage && <p>{noDataMessage}</p>}
        </div>
        
      )}
      

    {/* 차트들을 Grid 컨테이너로 감쌈 */}
    <ChartsGrid>
      {/* 차트 1 */}
      {chartDatastd && (
        <ChartSection>
          <ChartTitle>규격별 판매 데이터</ChartTitle>
          <Bar data={chartDatastd} />
        </ChartSection>
      )}

      {/* 차트 2 */}
      {chartDatalv && (
        <ChartSection>
          <ChartTitle>등급 및 날짜별</ChartTitle> {/* 제목 추가 */}
          <Bar data={chartDatalv} />
        </ChartSection>
      )}

      {/* 차트 3 */}
      {ChartDatasan && (
        <ChartSection>
          <ChartTitle>출하지역</ChartTitle> {/* 제목 추가 */}
          <Bar data={ChartDatasan} />
        </ChartSection>
      )}

      {/* 차트 4 */}
      {chartDatadatelv && (
        <ChartSection>
          <ChartTitle>날짜별 등급별 총 수량</ChartTitle> {/* 제목 추가 */}
          <Bar data={chartDatadatelv} />
        </ChartSection>
      )}
      {/* 차트 5 */}
      {chartData && (
        <ChartSection>
          <ChartTitle>회사별 통계</ChartTitle>
          <Bar data={chartData} />
        </ChartSection>
      )}
    </ChartsGrid>
    
    {/* 요약 섹션 */}
    {item.length > 0 && (
      <SummarySection>
        <h3>검색된 데이터 요약</h3>
        <Table>
          <thead>
            <tr>
              <TableHeader>판매일</TableHeader>
              <TableHeader>도매시장</TableHeader>
              <TableHeader>업체명</TableHeader>
              <TableHeader>대분류</TableHeader>
              <TableHeader>중분류</TableHeader>
              <TableHeader>소분류</TableHeader>
              <TableHeader>규격</TableHeader>
              <TableHeader>수량</TableHeader>
              <TableHeader>총 금액</TableHeader>
              <TableHeader>평균 금액</TableHeader>
            </tr>
          </thead>
          <tbody>
            {item.map((item, index) => (
              <tr key={index}>
                <TableCell>{item.saleDate}</TableCell>
                <TableCell>{item.whsalName}</TableCell>
                <TableCell>{item.cmpName}</TableCell>
                <TableCell>{item.largeName}</TableCell>
                <TableCell>{item.midName}</TableCell>
                <TableCell>{item.smallName}</TableCell>
                <TableCell>{item.std}</TableCell>
                <TableCell>{item.totQty}</TableCell>
                <TableCell>{item.totAmt.toLocaleString()} 원</TableCell>
                <TableCell>{item.avgAmt.toLocaleString()} 원</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </SummarySection>
    )}
    </ChartContainer>
  </div>
);
};

export default Home;
