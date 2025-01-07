import mysql.connector

# MySQL 데이터베이스 연결 (root 사용자로 연결)
db_connection = mysql.connector.connect(
    host="localhost",      # 데이터베이스 서버
    user="root",           # 사용자명
    password="gusdn7447!"    # 비밀번호
)

# MySQL 연결
cursor = db_connection.cursor()
# 데이터베이스 생성 (소공 데이터베이스가 없는 경우에만 실행)
create_database_query = "CREATE DATABASE IF NOT EXISTS 소공;"
cursor.execute(create_database_query)
print("데이터베이스 '소공'이 성공적으로 생성되었습니다.")

# 소공 데이터베이스를 사용
cursor.execute("USE 소공;")

# 1. 테이블 생성 SQL 쿼리
create_table_query = """
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 뉴스 기사 ID (자동 증가)
    url VARCHAR(255) NOT NULL,  -- 뉴스 기사 URL
    title TEXT NOT NULL,  -- 기사 제목
    sub_title TEXT,  -- 기사 서브 제목
    image_url TEXT,  -- 이미지 URL
    content TEXT,  -- 기사 본문
    date DATETIME  -- 수정 날짜 (DATETIME 형식)
);
"""

# 테이블 생성 실행
cursor.execute(create_table_query)
print("테이블이 성공적으로 생성되었습니다.")

# 연결 종료
cursor.close()
