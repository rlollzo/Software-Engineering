import React, { useEffect, useState } from "react"; 
import axios from "axios";
import Slider from "react-slick";
import styled from "styled-components";
// slick-carousel 스타일 추가
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const PageDescription = styled.div`
  background-color: #ccffcc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
`;
function App() { 
  const DB_NEWS_SERVER_URL = 'http://localhost:4444/db/News-BOTH';
  const [Newspaper, setNewspaper] = useState([]);
  const [Alimi, setAlimi] = useState([]);

  useEffect(() => {
    axios
      .get(DB_NEWS_SERVER_URL)
      .then((response) => {
        console.log(response.data); // 받아온 데이터 콘솔에 출력
        setNewspaper(response.data.Newspaper); // 농민신문 뉴스
        setAlimi(response.data.Alimi); // 농어촌알리미 뉴스
      })
      .catch((error) => {
        console.error("데이터를 불러오는 중 오류가 발생했습니다.", error);
      });
  }, []);

  // 슬라이더 설정
  const sliderSettings = {
    infinite: true, // 무한 루프
    speed: 500, // 슬라이드 전환 속도 (500ms)
    slidesToShow: 1, // 한 번에 보여줄 슬라이드 수 (1개씩만 보이게 설정)
    slidesToScroll: 1, // 한 번에 스크롤할 슬라이드 수
    autoplay: true, // 자동 슬라이드
    autoplaySpeed: 3000, // 자동 슬라이드 속도 (3초마다)
    responsive: [
      {
        breakpoint: 768, // 화면이 768px 이하일 때
        settings: {
          slidesToShow: 1, // 화면이 좁을 때는 한 번에 1개씩만 보여줌
        },
      },
    ],
  };

  return (
    <div>
      <PageDescription>
        <h1>뉴스목록</h1>
        
      </PageDescription>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* 농민신문 영역 */}
        <div
          style={{
            flex: 1,
            padding: "10px",
            height: "600px", // 농민신문 높이 고정
            width: "400px",
            borderRight: "2px solid #ddd",
            overflowY: "auto", // 세로 스크롤 활성화
          }}
        >
          <h2>농민신문</h2>
          {/* 슬라이드로 하나씩 뉴스 보여주기 */}
          <Slider {...sliderSettings}>
            {Newspaper.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  padding: "20px",
                  borderBottom: "2px solid #ddd",
                }}
              >
                <div style={{ flex: 1 }}>
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div style={{ flex: 2, paddingLeft: "20px", textAlign: "left" }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <h3 style={{ marginTop: "10px", fontWeight: "bold" }}>
                      {item.title}
                    </h3>
                  </a>
                  <p style={{ fontSize: "14px", color: "gray" }}>
                    {item.sub_title}
                  </p>
                  <p
                    style={{
                      maxHeight: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.content.slice(0, 100)}...
                  </p>
                  <p style={{ fontSize: "12px", color: "gray" }}>
                    작성일자: {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* 농어촌알리미 영역 - 세로 스크롤 활성화 */}
        <div
          style={{
            flex: 1,
            padding: "10px",
            height: "600px", // 농어촌알리미 높이 고정 (농민신문과 동일)
            overflowY: "auto", // 수직 스크롤 활성화
          }}
        >
          <h2>농어촌알리미</h2>
          {Alimi.slice(0, 6).map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                textAlign: "left",
                marginBottom: "10px", // 각 항목 사이에 여백 추가
              }}
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <h3>{item.title}</h3>
              </a>
              <p>{item.sub_title}</p>
              <p>{item.content.slice(0, 100)}...</p>
              <p style={{ fontSize: "12px", color: "gray" }}>
                작성일자: {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
