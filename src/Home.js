import React from "react";
import styled from "styled-components";
import Real from "./Components/Real"; // /Real 컴포넌트 가져오기
import News from "./Components/News"; // /News 컴포넌트 가져오기
import PastTransactionTrend from "./Components/PastTransactionTrend";
import SettlementPrice from "./Components/SettlementPrice";
const PageContainer = styled.div`
  padding: 100px; /* 컨테이너 내부의 여백 */
  background-color: #fff;
  min-height: 100px; /* 화면 전체 높이 */
  display: flex; /* 가로 방향 정렬 */
  flex-direction: column; /* 섹션를 가로 방향으로 정렬 */
  overflow-y: auto;
  overflow-x: hidden;
`;
const PageDescription = styled.div`
  background-color: #e6ffe6;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
`;
const SectionTitle = styled.h2`
  font-size: 1.8rem; /* 제목 글자 크기 */
  margin-bottom: 20px; /* 제목과 다음 요소 사이의 간격 */
  color: #333; /* 제목 글자 색상 */
  font-weight: bold; /* 제목 글자 굵기 */
`;

const IndexSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  max-height: 300px;
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 40px; /* 뉴스 섹션 위쪽 여백 */

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px; /* 스크롤바 너비 */
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1; /* 트랙 배경색 */
  }
  ::-webkit-scrollbar-thumb {
    background: #888; /* 스크롤바 색상 */
    border-radius: 10px; /* 둥근 모서리 */
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555; /* 호버 시 색상 */
  }
`;

const IndexCard = styled.div`
  background-color: #fff; /* 카드 배경색: 흰색 */
  border-radius: 10px; /* 카드 모서리를 둥글게 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  padding: 20px; /* 카드 내부 여백 */
  text-align: center; /* 텍스트 가운데 정렬 */
  flex: 1; /* 카드가 동일한 크기로 분할 */
  margin: 0 10px; /* 카드 사이의 간격 */
  max-width: 500px; /* 카드의 최대 너비 */
  max-height: 300px; /* 카드의 최대 높이 */
`;

const NewsSection = styled.div`
  margin-top: 20px; /* 뉴스 섹션 위쪽 여백 */
`;

const NewsList = styled.div`
  display: flex; /* 가로 방향 정렬 */
  gap: 20px; /* 뉴스 카드 사이의 간격 */
  width: 90%;
  height: 100%;
`;

const NewsCard = styled.div`
  background-color: #fff; /* 뉴스 카드 배경색: 흰색 */
  border-radius: 10px; /* 뉴스 카드 모서리를 둥글게 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 뉴스 카드 그림자 효과 */
  overflow: hidden; /* 내용이 카드 경계 밖으로 나가지 않게 */
  width: 1000px; /* 뉴스 카드 너비 */
`;


const Home = () => {
  return (
    <div>
      <PageDescription>
        <h1>농산물 정보 전달 및 가격 예측 웹사이트</h1>
        <p>
        Agric-Info
        </p>
      </PageDescription>
    <PageContainer>
        
        <IndexCard>
          <Real />
        </IndexCard>

      {/* 주요 뉴스 섹션 */}
      <NewsSection>
            <News />
      </NewsSection>
      <IndexSection>
        {/* PastTransactionTrend 컴포넌트 렌더링 */}
        
        <PastTransactionTrend />
        
      </IndexSection>
      <IndexSection>
        {/* SettlementPrice 컴포넌트 렌더링 */}
        <SettlementPrice />
      </IndexSection>
    </PageContainer>
    </div>
  );
};

export default Home;
