import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import Login from './Login';  // 이미 작성한 로그인 컴포넌트
import SignUp from './SignUp';  // 이전에 만든 회원가입 컴포넌트

// 네비게이션 바 스타일 정의
const NavBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #ccffcc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;

  & > a {
    margin-right: 20px;
    text-decoration: none;
    color: #333;
    font-weight: bold;

    &:hover {
      color: #007aff;
    }
  }
`;

const LoginButton = styled.button`
  background-color: #007aff;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #005bb5;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #007aff;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 15px;

  &:hover {
    color: #005bb5;
  }
`;

const ModalLinkButton = styled.button`
  background: none;
  border: none;
  color: #007aff;
  cursor: pointer;
  &:hover {
    color: #005bb5;
  }
`;

// 모달 스타일 설정
Modal.setAppElement('#root');

const CustomModalStyles = {
  content: {
    maxWidth: '400px',
    margin: 'auto',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

const NavBar = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openLoginModal = () => {
    setIsLogin(true);
    setModalIsOpen(true);
  };

  const openSignUpModal = () => {
    setIsLogin(false);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <>
      <NavBarContainer>  
        <img src={require('./logo.jpg')} alt="농수농수" style={{ width: '80px', height: 'auto' }} />

        <NavLink to="/">홈</NavLink>
        <NavLink to="/news">뉴스</NavLink>
        <NavLink to="/SettlementPrice">상세검색</NavLink>
        <NavLink to="/ModelLSTM">AI가격예측</NavLink>
        <NavLink to="/PastTransactionTrend">과거경락데이터</NavLink>
        {/* <LoginButton onClick={openLoginModal}>로그인</LoginButton> */}
      </NavBarContainer>

      {/* 로그인 및 회원가입 모달 */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={CustomModalStyles}
      >
        {isLogin ? (
          <>
            <Login />
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              계정이 없으신가요?{' '}
              <ModalLinkButton onClick={openSignUpModal}>회원가입</ModalLinkButton>
            </p>
          </>
        ) : (
          <>
            <SignUp />
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              이미 계정이 있으신가요?{' '}
              <ModalLinkButton onClick={openLoginModal}>로그인</ModalLinkButton>
            </p>
          </>
        )}
      </Modal>
    </>
  );
};

export default NavBar;