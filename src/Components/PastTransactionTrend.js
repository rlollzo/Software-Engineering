import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { selectData as classItemData } from '../data/classItem.js';
import { selectData as classItemVarData } from '../data/classItemVar.js';
import { CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import ReactECharts from 'echarts-for-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// 매핑 테이블 추가
// 단위코드 매핑 테이블
const unitCodeMapping = {
  '10': '.',
  '11': 'g',
  '12': 'kg',
  '13': 'ton(M/T)',
  '14': 'ml',
  '15': 'L',
  '70': '.',
  '71': 'g',
  '72': 'kg',
  '73': 'ton(M/T)',
};

const packageStateMapping = {
  '100': '.',
  '101': '상자',
  '102': 'P-BOX',
  '103': 'PE대',
  '104': 'PP대',
  '105': '그룹망',
  '106': '트럭',
  '107': '파렛트',
  '108': '비닐봉지',
  '109': '봉지',
  '110': '접시용기 트레이',
  '111': '단',
  '112': '개',
  '113': '점',
  '114': '책',
  '115': '속',
  '116': '분',
  // 필요한 포장상태코드 추가
};
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const ChartContainer = styled.div`
  margin: 20px 0;
  overflow-x: auto; /* X축 스크롤 가능 */
  white-space: nowrap;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;
const ChartSection = styled.div`
  margin: 40px 0;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  background-color: #f9f9f9;
`;

const TableHeader = styled.th`
  background-color: #007aff;
  color: white;
  padding: 12px;
  text-align: center;
  border: 1px solid #ddd;
  font-weight: bold;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
  background-color: ${(props) => (props.index % 2 === 0 ? '#ffffff' : '#f2f2f2')};
`;
const TableRow = styled.tr`
  &:hover {
    background-color: #e6f7ff;
  }
`;
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
const PageDescription = styled.div`
  background-color: #ccffcc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
`;
const Option = styled.option``;

// 매핑 함수
const mapClassToName = (classCode) => {
  const classData = classItemData.find((data) => data.class_code === classCode);
  return classData ? classData.class_name : '알 수 없음';
};

const mapItemToName = (classCode, itemCode) => {
  const classData = classItemData.find((data) => data.class_code === classCode);
  const itemData = classData?.item.find((item) => item.item_code === itemCode);
  return itemData ? itemData.item_name : '알 수 없음';
};
// 코드 정규화 함수
const normalizeCode = (code) => {
  return code.toString().replace(/^0+/, ''); // 앞의 0 제거
};
// 품종 매핑 함수 수정
const mapVarietyToName = (classCode, itemCode, varietyCode) => {
  const normalizedClassCode = normalizeCode(classCode);
  const normalizedItemCode = normalizeCode(itemCode);
  const normalizedVarietyCode = normalizeCode(varietyCode);

  const classData = classItemVarData.find((data) => normalizeCode(data.class_code) === normalizedClassCode);
  if (!classData) return '알 수 없음';

  const itemData = classData.item.find((item) => normalizeCode(item.item_code) === normalizedItemCode);
  if (!itemData) return '알 수 없음';

  const varietyData = itemData.variety.find((variety) => normalizeCode(variety.variety_code) === normalizedVarietyCode);
  return varietyData ? varietyData.variety_item : '알 수 없음';
};
// 데이터 그룹화 함수
const groupDataByMonth = (data = []) => {
  const grouped = data.reduce((acc, row) => {
    const date = new Date(row.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[month]) {
      acc[month] = { avgPrice: 0, highestPrice: 0, lowestPrice: 0, count: 0 };
    }

    acc[month].avgPrice += row.avgPrice || 0;
    acc[month].highestPrice += row.highestPrice || 0;
    acc[month].lowestPrice += row.lowestPrice || 0;
    acc[month].count += 1;

    return acc;
  }, {});

  return Object.keys(grouped).map((month) => ({
    month,
    avgPrice: grouped[month].avgPrice / grouped[month].count,
    highestPrice: grouped[month].highestPrice / grouped[month].count,
    lowestPrice: grouped[month].lowestPrice / grouped[month].count,
  })).slice(-24);
};

// 연도별 데이터 그룹화
const groupDataByYear = (data = []) => {
  const grouped = data.reduce((acc, row) => {
    const year = `${new Date(row.date).getFullYear()}`;

    if (!acc[year]) {
      acc[year] = { avgPrice: 0, highestPrice: 0, lowestPrice: 0, count: 0 };
    }

    acc[year].avgPrice += row.avgPrice || 0;
    acc[year].highestPrice += row.highestPrice || 0;
    acc[year].lowestPrice += row.lowestPrice || 0;
    acc[year].count += 1;

    return acc;
  }, {});

  return Object.keys(grouped).map((year) => ({
    period: year,
    avgPrice: grouped[year].avgPrice / grouped[year].count,
    highestPrice: grouped[year].highestPrice / grouped[year].count,
    lowestPrice: grouped[year].lowestPrice / grouped[year].count,
  }));
};
const PastTransactionTrend = () => {
  const DB_PAST_SERVER_URL = 'http://localhost:4444/db/PastTransactionTrend';

  const [item, setItem] = useState([]);

  // [Class & Item]
  const optionList = classItemVarData;
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedVar, setSelectedVar] = useState("");
  const [viewType, setViewType] = useState("월별"); // 기본값: 월별
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(false); // 에러 상태
  const [noDataMessage, setNoDataMessage] = useState(''); // 데이터 없음 메시지 상태
  const selectedClassData = optionList.find(option => option.class_code === selectedClass);
  const selectedItemData = selectedClassData?.item.find(item => item.item_code === selectedItem);

  const selectedVarietyData = classItemVarData
    .find(option => option.class_code === selectedClass)
    ?.item.find(item => item.item_code === selectedItem)
    ?.variety || [];

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
    setSelectedItem("");
    setSelectedVar("");
  };

  const handleItemChange = (event) => {
    setSelectedItem(event.target.value);
    setSelectedVar("");
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(false);
    setNoDataMessage(''); // 기존 메시지 초기화
    const params = new URLSearchParams({
      large: selectedClass,
      mid: selectedItem,
      small: selectedVar,
    });

    try {
      const response = await fetch(`${DB_PAST_SERVER_URL}?${params.toString()}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
      const data = await response.json();
      if (data.length === 0) {
        // 서버의 로그 메시지를 클라이언트로 표시
        const message = `데이터가 없습니다.`;
        setNoDataMessage(message);
        setError(true);
      }

      const formattedData = data.map((item) => ({
        date: item.경락일자,
        className: mapClassToName(item.부류코드),
        itemName: mapItemToName(item.부류코드, item.품목코드),
        varietyName: mapVarietyToName(item.부류코드, item.품목코드, item.품종코드),
        transactionUnit: item.거래단량,
        unit: unitCodeMapping[item.단위코드] || item.단위코드, // 단위코드 매핑
        packageState: packageStateMapping[item.포장상태코드] || item.포장상태코드, // 포장상태코드 매핑
        totalAmount: item.총금액,
        highestPrice: item.최고가,
        lowestPrice: item.최저가,
        avgPrice: item.평균가,
        totalQuantity: item.총거래량,
        totalWeight: item.총물량,
      }));

      setItem(formattedData);
    } catch (error) {
      setError(true);
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false);
    }
  };
  // 차트 데이터 구성
  const groupedData = useMemo(() => {
    return viewType === "월별" ? groupDataByMonth(item) : groupDataByYear(item);
  }, [item, viewType]);

  // 차트 데이터 구성
  const echartOptions = {
    title: { text: `${viewType} 가격 추이`, left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return params
          .map(
            (item) =>
              `${item.marker} ${item.seriesName}: ${item.data.toLocaleString('ko-KR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} 원`
          )
          .join('<br/>');
      },
    },
    legend: { top: 'bottom' },
    xAxis: { type: 'category', data: groupedData.map((d) => viewType === "월별" ? d.month : d.period) },
    yAxis: { type: 'value', name: '가격 (원)' },
    series: [
      {
        name: '평균가',
        type: 'line',
        data: groupedData.map((d) => d.avgPrice),
        smooth: false,
        lineStyle: { color: 'blue' },
      },
      {
        name: '최고가',
        type: 'line',
        data: groupedData.map((d) => d.highestPrice),
        smooth: false,
        lineStyle: { color: 'green' },
      },
      {
        name: '최저가',
        type: 'line',
        data: groupedData.map((d) => d.lowestPrice),
        smooth: false,
        lineStyle: { color: 'red' },
      },
    ],
  };
  return (
    <div>
      <ChartSection>
        {/* 검색 섹션 */}
        <PageDescription>
            <h3>과거 경락 데이터</h3>
            <p>
            부류, 품목, 품종과 선택하여 월별/ 연도별로 과거 판매 데이터를 확인할 수 있습니다. 데이터가 많을 경우 로딩 시간이 길어질 수 있습니다.
            </p>
          </PageDescription>
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
        <SearchSection>
          
          <SelectContainer onChange={handleClassChange} value={selectedClass}>
            <Option value="">부류명</Option>
            {optionList.map(({ class_code, class_name }) => (
              <Option key={class_code} value={class_code}>
                {class_name}
              </Option>
            ))}
          </SelectContainer>

          <SelectContainer onChange={handleItemChange} value={selectedItem} disabled={!selectedClass}>
            <Option value="">품목명</Option>
            {selectedClassData?.item.map(({ item_code, item_name }) => (
              <Option key={item_code} value={item_code}>
                {item_name}
              </Option>
            ))}
          </SelectContainer>

          <SelectContainer onChange={(e) => setSelectedVar(e.target.value)} value={selectedVar} disabled={!selectedItem}>
            <Option value="">품종명</Option>
            {selectedVarietyData.map(({ variety_code, variety_item }) => (
              <Option key={variety_code} value={variety_code}>
                {variety_item}
              </Option>
            ))}
          </SelectContainer>

          <button onClick={handleSearch}>검색</button>
        </SearchSection>
         <SelectContainer onChange={(e) => setViewType(e.target.value)} value={viewType}>
            <Option value="월별">월별(2년치)</Option>
            <Option value="연도별">연도별</Option>
          </SelectContainer>
              
        {groupedData.length > 0 && (
          <ChartContainer>
            <h3>{viewType} {selectedItemData?.item_name} 거래 추이 차트</h3>
            <ReactECharts option={echartOptions} style={{ height: 400, width: '100%' }} />
          </ChartContainer>
        )}
        {item.length > 0 && (
          <SummarySection>
            <h3>{selectedItemData?.item_name} 과거 거래추이 데이터 요약</h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>경락일자</TableHeader>
                  <TableHeader>부류명</TableHeader>
                  <TableHeader>품목명</TableHeader>
                  <TableHeader>품종명</TableHeader>
                  <TableHeader>거래단량</TableHeader>
                  <TableHeader>단위</TableHeader>
                  <TableHeader>포장상태</TableHeader>
                  <TableHeader>총금액</TableHeader>
                  <TableHeader>최고가</TableHeader>
                  <TableHeader>최저가</TableHeader>
                  <TableHeader>평균가</TableHeader>
                  <TableHeader>총거래량</TableHeader>
                  <TableHeader>총물량</TableHeader>
                </tr>
              </thead>
              <tbody>
              {item.map((row, index) => (
                <TableRow key={index}>
                <TableCell index={index}>{row.date || '-'}</TableCell>
                <TableCell index={index}>{row.className || '-'}</TableCell>
                <TableCell index={index}>{row.itemName || '-'}</TableCell>
                <TableCell index={index}>{row.varietyName || '-'}</TableCell>
                <TableCell index={index}>{row.transactionUnit || '-'}</TableCell>
                <TableCell index={index}>{row.unit || '-'}</TableCell>
                <TableCell index={index}>{row.packageState || '-'}</TableCell>
                <TableCell index={index}>
                  {row.totalAmount != null ? row.totalAmount.toLocaleString() + ' 원' : '-'}
                </TableCell>
                <TableCell index={index}>
                  {row.highestPrice != null ? row.highestPrice.toLocaleString() + ' 원' : '-'}
                </TableCell>
                <TableCell index={index}>
                  {row.lowestPrice != null ? row.lowestPrice.toLocaleString() + ' 원' : '-'}
                </TableCell>
                <TableCell index={index}>
                  {row.avgPrice != null ? row.avgPrice.toLocaleString() + ' 원' : '-'}
                </TableCell>
                <TableCell index={index}>{row.totalQuantity || '-'}</TableCell>
                <TableCell index={index}>{row.totalWeight || '-'}</TableCell>
              </TableRow>
            ))}
              </tbody>
            </Table>
          </SummarySection>
        )}
      </ChartSection>
    </div>
  );
};

export default PastTransactionTrend;
