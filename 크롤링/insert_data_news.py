import mysql.connector
import json

# MySQL 연결 설정
db_config = {
    'host': 'localhost',  # MySQL 서버 호스트
    'user': 'root',       # MySQL 사용자명
    'password': 'gusdn7447!',  # MySQL 비밀번호
    'database': '소공'  # 사용할 데이터베이스 이름
}

# MySQL 연결
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# JSON 파일 경로
json_file_path = r'C:\Users\shw\Desktop\소공\DB\뉴스정보\크롤링\농민신문\daily_news_농민.json'

# JSON 파일 읽기
with open(json_file_path, 'r', encoding='utf-8') as file:
    news_data = json.load(file)

# 1. 뉴스 데이터 삽입 쿼리
insert_query = """
INSERT INTO news (url, title, sub_title, image_url, content, date)
VALUES (%s, %s, %s, %s, %s, %s)
"""

# 각 뉴스 데이터를 데이터베이스에 삽입
for article in news_data:
    # 필요한 데이터를 추출
    url = article['url']
    title = article['title']
    sub_title = article['sub_title']
    image_url = article['image_url']
    content = article['content']
    date = article['modified_date']  # 이 값은 'yyyy-mm-dd HH:MM' 형식이므로 그대로 사용

    # 데이터 튜플로 준비
    data_tuple = (url, title, sub_title, image_url, content, date)

    # 데이터 삽입
    cursor.execute(insert_query, data_tuple)

# 변경사항 커밋
conn.commit()

print(f"{len(news_data)}개의 뉴스 기사가 데이터베이스에 삽입되었습니다.")

# 연결 종료
cursor.close()
conn.close()
