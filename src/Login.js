// 로그인 컴포넌트 추가
import React, { useState } from 'react';
import styled from 'styled-components';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const LoginInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
`;

const Login = () => {
  const [loginData, setLoginData] = useState({
    userId: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('로그인 정보:', loginData);
    // 실제 로그인 처리 로직 추가
  };

  return (
    <LoginContainer>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <LoginInput
          type="text"
          name="userId"
          placeholder="사용자 ID"
          value={loginData.userId}
          onChange={handleChange}
          required
        />
        <LoginInput
          type="password"
          name="password"
          placeholder="비밀번호"
          value={loginData.password}
          onChange={handleChange}
          required
        />
        <LoginButton type="submit">로그인</LoginButton>
      </form>
    </LoginContainer>
  );
};

export default Login;