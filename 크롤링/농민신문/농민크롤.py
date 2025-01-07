import requests
from bs4 import BeautifulSoup
import json

# 실제 웹페이지에 요청을 보내 HTML을 가져옵니다
url = "https://www.nongmin.com/"
response = requests.get(url)

# 페이지가 제대로 로드되었는지 확인
if response.status_code == 200:
    # HTML 파싱
    soup = BeautifulSoup(response.content, 'html.parser')

    # 원하는 요소 찾기 (예: <a> 태그 중 class="siteUrl"인 것들)
    links = soup.find_all('a', class_='siteUrl')

    # 기사 데이터를 저장할 리스트
    news_data = []

    # 각 링크의 href 값으로 세부 페이지 방문
    for link in links:
        article_url = link.get('href')  # 세부 페이지 URL
        full_url = "https://www.nongmin.com" + article_url  # 전체 세부 페이지 URL 생성
        print(f"세부 기사 URL: {full_url}")

        # 세부 기사 페이지 요청
        article_response = requests.get(full_url)

        if article_response.status_code == 200:
            article_soup = BeautifulSoup(article_response.content, 'html.parser')

            # 타이틀과 서브타이틀 추출
            title = article_soup.find('div', class_='view_tit').find('pre').text.strip()
            sub_title = article_soup.find('div', class_='news_sub_tit').find('pre').text.strip()

            # 이미지 URL 추출
            image_tag = article_soup.find('figure', class_='image').find('img') if article_soup.find('figure', class_='image') else None
            image_url = image_tag['src'] if image_tag else None

            # 뉴스 내용 추출
            content_tag = article_soup.find('input', class_='siteViewContent') if article_soup.find('input', class_='siteViewContent') else None
            news_content = content_tag['value'] if content_tag else None

            # 기사 작성 날짜와 수정 날짜 추출
            date_tag = article_soup.find('div', class_='view_data')
            if date_tag:
                dates = date_tag.find_all('pre')
                # '수정'이라는 텍스트가 있는 부분을 찾음
                modified_date = None
                for date in dates:
                    if '수정' in date.text:
                        modified_date = date.text.replace('수정 : ', '').strip()

            # 추출한 데이터를 news_data 리스트에 저장
            news_data.append({
                'url': full_url,
                'title': title,
                'sub_title': sub_title,
                'image_url': image_url,
                'content': news_content,
                'modified_date': modified_date  # 수정 날짜 추가
            })

            print("Title:", title)
            print("Sub-title:", sub_title)
            print("Image URL:", image_url)
            print("Content:", news_content)
            print("Date:", modified_date)
            print("-" * 50)
        else:
            print(f"세부 기사를 불러오는 데 실패했습니다: {full_url}")
    
    # 결과를 daily_news_농민.json 파일로 저장
    with open('daily_news_농민.json', 'w', encoding='utf-8') as json_file:
        json.dump(news_data, json_file, ensure_ascii=False, indent=4)

    print("데이터가 daily_news_농민.json에 저장되었습니다.")

else:
    print("웹페이지를 불러오는 데 실패했습니다.")
