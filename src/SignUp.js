import React, { useState } from 'react';
import styled from 'styled-components';

// 전체 레이아웃 스타일 정의
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

// 각 입력 필드 스타일 정의
const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

// 가입 버튼 스타일 정의
const Button = styled.button`
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

const SignUp = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: ''
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 가입 버튼 클릭 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('회원가입 정보:', formData);
    // 여기서 실제 회원가입 처리 로직을 추가하면 됩니다.
  };

  return (
    <Container>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="userId"
          placeholder="사용자 ID"
          value={formData.userId}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="name"
          placeholder="이름"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Button type="submit">가입하기</Button>
      </form>
    </Container>
  );
};

export default SignUp;
