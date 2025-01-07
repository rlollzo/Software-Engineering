import React, { useState } from 'react';
import styled from 'styled-components';  

import { selectData as selectChoice } from '../data/classItemVar.js';
import { selectData as classItemData } from '../data/classItem.js';
import { selectData as classItemVarData } from '../data/classItemVar.js';
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
const unitCodeMapping = {
  '12': 'kg',
  '13': 'g',
  // 필요한 단위코드 추가
};

const packageStateMapping = {
  '104': '박스',
  '105': '포대',
  // 필요한 포장상태코드 추가
};
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

 
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
`; 
const Option = styled.option``;

// ============================ MAPPING ===========================
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

// ===============================================================
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
const Home = () => {
    // = API URL =
  const DB_PRE_SERVER_URL = 'http://localhost:4444/db/Previous'; 
  const DB_FRI_SERVER_URL = 'http://localhost:4444/db/Previous-thisFriday'; 
  const REAL_SERVER_URL = 'http://localhost:4444/apiReal';
  const [item, setitem] = useState([]); // 검색된 데이터 저장 
  const [itemReal, setitemReal] = useState([]); // 검색된 데이터 저장 
  const [chartData, setChartData] = useState(null); // 차트 데이터 저장
 
 
  // [Class & Item]
  const optionList = classItemVarData;
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedVar, setSelectedVar] = useState("");

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

 

  
  
  // ========================== MODIFY ===============================
  const handleSearch = async () => { 
    
    let data = '';
    let dataFri = '';
    // == 전년전월전일 =
    if (
      !selectedClass || selectedClass === "default"  
    ) {
      alert('Please select a valid date.');
      return;
    } 
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(today.getDate()).padStart(2, '0'); // 두 자리 숫자로 변환
    const formattedDate = `${year}${month}${day}`; 
    const params = new URLSearchParams({
      large: selectedClass,
      mid: selectedItem,
      small: selectedVar,
      today: formattedDate
    }); 
    
    try { 
      const response =await fetch(`${DB_PRE_SERVER_URL}?${params.toString()}`, {  
        method: 'GET',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })   
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      data = await response.json();  

      const paramsReal = new URLSearchParams({
        large: selectedClass,
        mid: selectedItem,
        small: selectedVar
    });
 
      const responseReal =await fetch(`${REAL_SERVER_URL}?${paramsReal.toString()}`, {  
        method: 'GET',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })    
      const dataReal = await responseReal.json();
      setitemReal(dataReal);

    
    if (!data || data.length === 0) {
        // 현재 날짜를 가져옵니다.
        const today = new Date();
        let saleDate;

        // 현재 날짜가 주말인지 확인합니다.
        const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

        // 금요일 날짜 계산
        let fridayDate = new Date(today);
        fridayDate.setDate(today.getDate() - (dayOfWeek + 2) % 7); // 이번 주 금요일 계산

        // 현재 날짜가 금요일보다 이전인지 확인
        if (today < fridayDate) {
            // 금요일보다 이전인 경우, 저번주 금요일로 설정
            fridayDate.setDate(fridayDate.getDate() - 7);
        }

        // saleDate를 YYYYMMDD 형식으로 설정합니다.
        const year = fridayDate.getFullYear();  
        const month = String(fridayDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(fridayDate.getDate()).padStart(2, '0');

        saleDate = `${year}${month}${day}`; // YYYYMMDD 형식으로 조합

        console.log('Sale Date:', saleDate); 
        // SALE_SERVER_URL에서 금요일 데이터를 가져옵니다.
        const params = new URLSearchParams({
            large: selectedClass,
            mid: selectedItem,
            small: selectedVar,
            saleDate: saleDate
        });

        const responseFri = await fetch(`${DB_FRI_SERVER_URL}?${params.toString()}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
        dataFri = await responseFri.json();   
    }
    if (data.length == 0) {  
      const formattedData = dataFri.map((item) => ({
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

  setitem(formattedData)
    }else { 
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
      
    setitem(formattedData)
    }
    
  } catch (error) {
    console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
  }
};

  return (
    <div> 
{/* 검색 및 차트 섹션 */}
<ChartSection>
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

    {/* ============================================= */}  
          <button onClick={handleSearch}>검색</button>
          
        </SearchSection>        {/* 요약 섹션 */}
        {itemReal.length > 0 && (
          <SummarySection>
            <h3>실시간 데이터 요약</h3>
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
                  <TableHeader>금액</TableHeader>
                </tr>
              </thead>
          <tbody>
                {itemReal.map((itemReal, index) => (
                  <tr key={index}>
                    <TableCell>{itemReal.sbidtime}</TableCell>
                    <TableCell>{itemReal.whsalName}</TableCell>
                    <TableCell>{itemReal.cmpName}</TableCell>
                    <TableCell>{itemReal.largeName}</TableCell>
                    <TableCell>{itemReal.midName}</TableCell>
                    <TableCell>{itemReal.smallName}</TableCell>
                    <TableCell>{itemReal.std}</TableCell>
                    <TableCell>{itemReal.qty}</TableCell>
                    <TableCell>{itemReal.cost} 원</TableCell>  
                  </tr>
                ))}
              </tbody>
            </Table>
          </SummarySection> 
)}
        {/* 요약 섹션 */}
        {item.length > 0 && (
          <SummarySection>
            <h3>전년전월전일 데이터 요약</h3>
            <Table>
              <thead>
                <tr>    
                  <TableHeader>경락일자</TableHeader>
                  <TableHeader>부류코드</TableHeader>
                  <TableHeader>품목코드</TableHeader>
                  <TableHeader>품종코드</TableHeader>
                  <TableHeader>거래단량</TableHeader>
                  <TableHeader>단위코드</TableHeader>
                  <TableHeader>포장상태코드</TableHeader>
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

export default Home;
