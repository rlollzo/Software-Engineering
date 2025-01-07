import React,{ useState } from 'react';
import styled from 'styled-components';

// 전체 레이아웃 스타일 정의
const Container = styled.div`
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

// 왼쪽 사이드바 스타일 정의
const Sidebar = styled.div`
  width: 20%;
  padding: 10px;
  border-right: 1px solid #ddd;
`;

const SidebarUserInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const SidebarButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
`;

// 게시판 목록 스타일 정의
const BoardContainer = styled.div`
  width: 55%;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const BoardSection = styled.div`
  flex: 1 1 calc(50% - 20px);
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const BoardCategoryTitle = styled.h3`
  color: red;
  margin-bottom: 10px;
`;

const BoardItem = styled.div`
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    color: #007aff;
  }
`;

// 오른쪽 인기 게시글 영역 스타일 정의
const PopularPosts = styled.div`
  width: 25%;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const PopularSection = styled.div`
  margin-bottom: 20px;
`;

const PopularPostItem = styled.div`
  margin-bottom: 12px;

  & > span {
    color: #777;
    font-size: 0.9em;
  }
`;

const CommunityMain = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (newPost.trim()) {
          setPosts([...posts, newPost]);
          setNewPost('');
        }
      };
  return (
    <Container>
      {/* 왼쪽 사이드바 */}
      <Sidebar>
        <SidebarUserInfo>
          <img
            src="https://via.placeholder.com/80"
            alt="User"
            style={{ borderRadius: '50%', marginBottom: '10px' }}
          />
          <p>서준일</p>
          <p>junil3004</p>
        </SidebarUserInfo>
        <SidebarButton>내가 쓴 글</SidebarButton>
        <SidebarButton>댓글 단 글</SidebarButton>
        <SidebarButton>내 스크랩</SidebarButton>
        <SidebarButton>로그아웃</SidebarButton>
      </Sidebar>

      {/* 게시판 목록 */}
      <BoardContainer>
        <BoardSection>
          <BoardCategoryTitle>자유게시판</BoardCategoryTitle>
          <BoardItem>고구마 개맛있노</BoardItem>
          <BoardItem>요새 회 왤캐비쌈?</BoardItem>
        </BoardSection>
        <BoardSection>
          <BoardCategoryTitle>장터게시판</BoardCategoryTitle>
          <BoardItem>SNT다이나믹스 현직자</BoardItem>
          <BoardItem>학벌에 관한 질문</BoardItem>
        </BoardSection>
        <BoardSection>
          <BoardCategoryTitle>시사-이슈</BoardCategoryTitle>
          <BoardItem>근데 감자기 비옴...</BoardItem>
          <BoardItem>방어 어획량 20%증가</BoardItem>
        </BoardSection>
        <BoardSection>
          <BoardCategoryTitle>홍보게시판</BoardCategoryTitle>
          <BoardItem>알바 구함</BoardItem>
          <BoardItem>서현우</BoardItem>
        </BoardSection>
      </BoardContainer>

      {/* 오른쪽 인기 게시글 영역 */}
      <PopularPosts>
        <PopularSection>
          <h3>실시간 인기 글</h3>
          <PopularPostItem>
            아니 ㅋㅋㅋㅋ그거앎? <span>17 추천, 9 댓글</span>
          </PopularPostItem>
        </PopularSection>
        <PopularSection>
          <h3>HOT 게시글</h3>
          <PopularPostItem>7층 뒷길</PopularPostItem>
          <PopularPostItem>야하노</PopularPostItem>
        </PopularSection>
        <PopularSection>
          <h3>BEST 게시판</h3>
          <PopularPostItem>물가 소식</PopularPostItem>
        </PopularSection>
      </PopularPosts>
    </Container>
  );
};

export default CommunityMain;
