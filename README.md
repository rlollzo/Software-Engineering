1. 프로그램 개요
	이 프로그램은 농산물 정보를 분석하고 시각화하는 웹 애플리케이션
	사용자는 다양한 데이터를 검색 가능
	분석 결과를 차트와 표 형식으로 확인 가능

2. 주요 기능
2.1 페이지 설명
	- 위치: 각 페이지 상단.
	- 내용: 페이지별 기능과 사용법에 대한 간략한 설명

2.2 네비게이션 바
	- 위치: 모든 페이지 상단
	- 구성 요소:
		- 홈(Home): 메인 화면으로 이동.
		- 상세 검색(Settlement Price): 특정 조건으로 데이터를 검색
		- 실시간 AI 가격 예측(ModelLSTM): 농산물 가격 예측
		- 과거 경락 데이터(Past Transaction Trend): 과거 데이터를 월별/연도별로 분석
	
2.3 상세 검색
	-설명: 특정 부류, 품목, 품종, 날짜를 선택하여 데이터를 검색하고, 차트로 확인
	-사용법:
		1. 부류와 품목, 품종을 선택
		2. 날짜를 설정
		3. 검색 버튼을 클릭
	-주요 특징:
		-데이터가 없으면 "데이터가 없습니다"라는 메시지 표시
		-검색 중에는 로딩 애니메이션 표시	
	-데이터 표시:
		-규격별 판매 데이터
		-등급 및 날짜별 데이터
		-출하지역별 데이터

2.4 실시간 AI 가격 예측
	-설명: LSTM, Linear Regression 등 4가지 AI 모델을 사용한 가격 예측
	-사용법:
		1. 실시간 AI 가격 예측 페이지로 이동
		2. 예측 버튼을 클릭
		3. 예측 결과가 차트와 표로 표시

2.5 뉴스	
	-설명: 농업 관련 최신 뉴스를 확인.
	-사용법:
		1. 뉴스 페이지로 이동.
		2. 농민신문과 농어촌 알리미에서 제공하는 뉴스를 확인.
		3. 뉴스는 슬라이더로 스크롤 가능.

2.6 과거 경락 데이터
	-설명: 과거 데이터를 기반으로 월별 또는 연도별 트렌드를 분석.
	-사용법:
		1. 부류, 품목, 품종을 선택.
		2. 월별/연도별 보기 설정.
		3. 데이터는 차트와 표로 표시.

3. 외부 라이브러리 설치
3.1 프론트 엔드 라이브러리 설치npm install @emotion/react @emotion/styled @mui/material @testing-library/jest-dom @testing-library/react @testing-library/user-event body-parser chart.js chartjs-plugin-zoom csv-parse echarts echarts-for-react express fast-csv mariadb mysql react react-chartjs-2 react-dom react-icons react-modal react-router-dom react-scripts react-slick react-table slick-carousel styled-components web-vitals

3.2 백엔드 서버 라이브러리 설치
npm install express axios cors mysql
3.3 파이썬 라이브러리 설치
(1) numpy
	pip install numpy
(2) PyTorch
	PyTorch는 설치 환경(운영 체제, CUDA 지원 여부 등)에 따라 다름	PyTorch 공식 사이트에서 환경에 맞는 설치 명령을 확인. 
	pip install torch torchvision torchaudio
(3) pandas
	pip install pandas
(4) scikit-learn
	pip install scikit-learn
(5) MySQL Connector
	MySQL 데이터베이스에 연결하려면 mysql-connector-python을 설치
	pip install mysql-connector-python

4. 주의 사항
- 데이터가 많을 경우 로딩 시간이 길어질 수 있음
- 정확한 데이터를 보장하기 위해 검색 조건을 신중히 선택
- db에 과거 데이터가 있어야 조회 가능
- 외부 요인(공휴일, 주말, 날씨) 등 값 없음 존재
- 라이브러리 미설치 및 경로 오류날 시 작동이 아예 안되기에 주의 바람(특히, vscode로 실행하게 된다면 파이썬 인터프리터 설정을 제대로 해줘야 가능)

DB 
1. 파이썬
	- server/python/pricePredict.py 에 들어가 315번째 줄에 Maria DB 정보 입력

2. JS
	- server/database/connect/maria.js 에 들어가 3번째 줄에 Maria DB 정보 입력



파이썬 경로 확인 
1. server/python/pricePredict.py 에 들어가 381번째 줄의 base_path 경로 변경


2. server/Router/pythonCon.js에 들어가 8번째 줄의 PYTHON_PATH 경로 변경

5. FAQ
Q1. 데이터가 없다는 메시지가 표시됩니다. 어떻게 해야 하나요?
- 선택한 조건에 데이터가 없을 수 있음.
- 부류와 날짜를 다시 선택하여 검색.

Q2. 로딩 시간이 너무 깁니다.
- 데이터가 많을 경우 로딩 시간이 길어질 수 있으니 양해 바랍니다.

Q3. AI 예측 값이 정확하지 않아요.
- AI 예측은 과거 데이터를 기반으로 하므로 특정 외부 요인은 반영되지 않을 수 있습니다.
- 여러 모델의 결과를 비교하여 가장 적합한 결과를 선택하세요.


/28
Q4. 홈 페이지에 실시간 데이터가 계속 로딩중이에요.
- 주말일 경우, 거래 정보가 없기에 나오지 않을 수 있습니다.