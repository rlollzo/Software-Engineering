import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { selectData } from '../data/classItem.js';
import { selectData as selectData2 } from '../data/classItemVar';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { CircularProgress } from '@mui/material';

// Styled Components
const StockCardContainer = styled.div`
  .slick-dots {
    bottom: -20px; /* 네비게이션 점 위치 조정 */
  }
  .slick-prev, .slick-next {
    z-index: 1;
  }
`;

const StockCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const TrendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const TrendCard = styled.div`
  background-color: ${(props) => (props.isPositive ? '#ffe6e6' : '#e6f7ff')};
  color: ${(props) => (props.isPositive ? 'red' : 'blue')};
  border-radius: 8px;
  padding: 10px 15px;
  text-align: center;
  min-width: 80px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RateBadge = styled.div`
  background-color: ${(props) => (props.isPositive ? '#ff6666' : '#66b3ff')};
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  margin-top: 5px;
`;
//평균가 계산 함수
const calculateAverageCost = (data) => {
  return data.map((item) => {
    const totalCost = item.cost * item.qty; // 총 금액 = 가격 * 거래량
    const averageCost = item.qty > 0 ? totalCost / item.qty : 0; // 거래량이 0보다 클 경우 평균가 계산
    return {
      ...item, // 기존 데이터 복사
      averageCost, // 평균가 추가
    };
  });
};
// Helper Components
const TrendComparison = ({ label, value, rate }) => {
  const isPositive = rate > 0;

  return (
    <TrendCard isPositive={isPositive}>
      <div>{label}</div>
      <div>{value?.toLocaleString() || '없음'} 원</div>
      <RateBadge isPositive={isPositive}>
        {isPositive ? '▲' : '▼'}
        {Math.abs(rate).toFixed(2)}%
      </RateBadge>
    </TrendCard>
  );
};

// Helper Functions
const normalizeCode = (code) => code.toString().padStart(2, '0');

const calculateRate = (current, previous) => {
  if (!previous || previous === 0) return null;
  const rate = ((current - previous) / previous) * 100;
  return rate.toFixed(2);
};

const mapNameToClassCode = (className) => {
  const classData = selectData.find((data) => data.class_name === className);
  return classData ? classData.class_code : '알 수 없음';
};

const mapNameToItemCode = (className, itemName) => {
  const classData = selectData.find((data) => data.class_name === className);
  if (!classData) return '알 수 없음';

  const itemData = classData.item.find((item) => item.item_name === itemName);
  return itemData ? itemData.item_code : '알 수 없음';
};

const mapNameToVarietyCode = (className, itemName, varietyName) => {
  const classData = selectData2.find((data) => data.class_name === className);
  if (!classData) return '알 수 없음';

  const itemData = classData.item.find((item) => item.item_name === itemName);
  if (!itemData) return '알 수 없음';

  const varietyData = itemData.variety.find((variety) => variety.variety_item === varietyName);
  return varietyData ? varietyData.variety_code : '알 수 없음';
};

const Real = () => {
  const settings = {
    dots: true, // 하단에 페이지 점 표시
    infinite: true, // 무한 스크롤
    speed: 500, // 슬라이더 전환 속도
    slidesToShow: 1, // 한 번에 보여줄 카드 수
    slidesToScroll: 1, // 한 번에 스크롤할 카드 수
    arrows: true, // 좌우 화살표 표시 여부
    autoplay: true,
    autoplaySpeed: 3000, // 자동 전환 속도 (밀리초)
  };
  const REAL_SERVER_URL = 'http://localhost:4444/apiReal';
  const PREVIOUS_SERVER_URL = 'http://localhost:4444/db/Real';

  const [content, setContent] = useState([]);
  const [priceTrends, setPriceTrends] = useState({});
  const [topQtyItems, setTopQtyItems] = useState([]); // State to store the top 5 items by qty
  const [noDataMessage, setNoDataMessage] = useState(''); // 데이터 없음 메시지 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(false); // 에러 상태
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    setNoDataMessage(''); // 기존 메시지 초기화
    try {
      const response = await fetch(REAL_SERVER_URL);
      const data = await response.json();
      if (data.length === 0) {
        // 서버의 로그 메시지를 클라이언트로 표시
        const message = `데이터가 없습니다.`;
        setNoDataMessage(message);
        setError(true);
      }
      // 평균가를 계산하여 데이터를 업데이트
      const processedData = calculateAverageCost(data);
      console.log(data);
      setContent(processedData);

      if (data.length > 0) {
        // 상위 5개의 `qty` 기준 항목을 가져옴
        const filteredTopQtyItems = data
      .filter(item => item.qty) // 유효한 `qty`만 필터링
      .sort((a, b) => b.qty - a.qty) // `qty`를 기준으로 내림차순 정렬
      .slice(0, 5); // 상위 5개의 항목 선택

      
      setTopQtyItems(filteredTopQtyItems); // 상태에 저장

    // 필요에 따라 각 항목에 대해 과거 데이터 가져오기
    filteredTopQtyItems.forEach((item, index) => {
      fetchPreviousData(item, `topQty${index + 1}`);
    });
  }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  };

  const fetchPreviousData = async (item, type) => {
    if (!item) return;

    const params = new URLSearchParams({
      large: normalizeCode(mapNameToClassCode(item.largeName)),
      mid: normalizeCode(mapNameToItemCode(item.largeName, item.midName)),
      small: normalizeCode(mapNameToVarietyCode(item.largeName, item.midName, item.smallName)),
      today: item.sbidtime.split(' ')[0],
    });

    try {
      const response = await fetch(`${PREVIOUS_SERVER_URL}?${params.toString()}`);
      const data = await response.json();

      const trends = {
        yesterdayPrice: null,
        lastMonthPrice: null,
        lastYearPrice: null,
      };

      data.forEach((record) => {
        if (record.날짜범주 === '전일') {
          trends.yesterdayPrice = record.평균가;
        } else if (record.날짜범주 === '전월') {
          trends.lastMonthPrice = record.평균가;
        } else if (record.날짜범주 === '전년') {
          trends.lastYearPrice = record.평균가;
        }
      });

      setPriceTrends((prevTrends) => ({
        ...prevTrends,
        [type]: trends,
      }));
    } catch (error) {
      setError(true);
    
      console.error('과거 데이터를 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    
    <StockCardContainer>
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
      <Slider {...settings}>
        {topQtyItems.map((item, index) => (
          <StockCard key={index}>
            <h3>가장 인기있는 제품 TOP {index + 1}</h3>
            <h4>{item?.midName || "없음"}</h4>
            <p style={{ color: "red" }}>
              {item?.cost ? `${item.cost.toLocaleString()} : 원` : "없음"}
            </p>
            {priceTrends[`topQty${index + 1}`] && (
              <TrendContainer>
                <TrendCard
                  isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.yesterdayPrice) > 0}
                >
                  전일대비: {priceTrends[`topQty${index + 1}`]?.yesterdayPrice}
                  <RateBadge
                    isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.yesterdayPrice) > 0}
                  >
                    {calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.yesterdayPrice)}%
                  </RateBadge>
                </TrendCard>
                <TrendCard
                  isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastMonthPrice) > 0}
                >
                  전월대비: 
                  {priceTrends[`topQty${index + 1}`]?.lastMonthPrice ? `${parseFloat(priceTrends[`topQty${index + 1}`]?.lastMonthPrice).toFixed(2)} 원` : '없음'}
                  <RateBadge
                    isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastMonthPrice) > 0}
                  >
                    {calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastMonthPrice)}%
                  </RateBadge>
                </TrendCard>
                <TrendCard
                  isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastYearPrice) > 0}
                >
                  전년대비: 
                  {priceTrends[`topQty${index + 1}`]?.lastYearPrice ? `${parseFloat(priceTrends[`topQty${index + 1}`]?.lastYearPrice).toFixed(2)} 원` : '없음'}
                  <RateBadge
                    isPositive={calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastYearPrice) > 0}
                  >
                    {calculateRate(item?.cost, priceTrends[`topQty${index + 1}`]?.lastYearPrice)}%
                  </RateBadge>
                </TrendCard>
              </TrendContainer>
            )}
          </StockCard>
        ))}
      </Slider>
    </StockCardContainer>
  );
};

export default Real;
