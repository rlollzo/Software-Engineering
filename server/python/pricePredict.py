import numpy as np
import torch
import torch.nn as nn
import json
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

import mysql.connector
from pickle import load


detail_list = ['부류코드', '품목코드', '품종코드', '거래단량', '단위코드', '포장상태코드']

period_mapping = {
    '01상순': 0, '01중순': 1, '01하순': 2,
    '02상순': 3, '02중순': 4, '02하순': 5,
    '03상순': 6, '03중순': 7, '03하순': 8,
    '04상순': 9, '04중순': 10, '04하순': 11,
    '05상순': 12, '05중순': 13, '05하순': 14,
    '06상순': 15, '06중순': 16, '06하순': 17,
    '07상순': 18, '07중순': 19, '07하순': 20,
    '08상순': 21, '08중순': 22, '08하순': 23,
    '09상순': 24, '09중순': 25, '09하순': 26,
    '10상순': 27, '10중순': 28, '10하순': 29,
    '11상순': 30, '11중순': 31, '11하순': 32,
    '12상순': 33, '12중순': 34, '12하순': 35
}


def map_period(x):
    period = x.split('-')
    period_key = period[1] + period[2]
    return period_mapping.get(period_key)

def classify_period(day):
    if day <= 10:
        return "상순"
    elif day <= 20:
        return "중순"
    else:
        return "하순"

def extract_input_sequence(df, detail_item):
    # 특정 품목의 정보만 가져오기
    detail_df = df[(df['부류코드'] == detail_item['부류코드']) &
                   (df['품목코드'] == detail_item['품목코드']) &
                   (df['품종코드'] == detail_item['품종코드']) &
                   (df['거래단량'] == detail_item['거래단량']) &
                   (df['단위코드'] == detail_item['단위코드']) &
                   (df['포장상태코드'] == detail_item['포장상태코드'])]

    # 세부 항목별 당일 기준 평균가, 최고가, 최저가, 총거래량 계산
    detail_df = (
        detail_df.groupby(['경락일자'] + detail_list)
        .agg(
            총금액=('총금액', 'sum'),
            최고가=('최고가', 'max'),
            최저가=('최저가', 'min'),
            평균가=('평균가', 'mean'),
            총거래량=('총거래량', 'sum'),
            총물량=('총물량', 'sum')
        )
        .reset_index()
    )
    detail_df = detail_df[['경락일자', '총금액', '최고가', '최저가', '평균가', '총거래량', '총물량']]

    # 상순 중순 하순으로 다운샘플링(결측치가 일정하지 않아서)
    detail_df['경락일자'] = pd.to_datetime(detail_df['경락일자'])
    detail_df['구분'] = detail_df['경락일자'].dt.day.apply(classify_period)
    detail_df['기간'] = detail_df['경락일자'].dt.strftime('%Y-%m-') + detail_df['구분']
    downsampled_df = detail_df.groupby('기간').agg({
        '총금액': 'sum',
        '최고가': 'max',
        '최저가': 'min',
        '평균가': 'mean',
        '총거래량': 'sum',
        '총물량': 'sum'
    }).reset_index()

    # T-9~T-1까지의 입력 데이터
    downsampled_df = downsampled_df.iloc[-10:-1]
    downsampled_df = downsampled_df[['기간', '평균가']]

    return downsampled_df

def extract_input_data(downsampled_df, scaler):
    # 계절성이 있다면 계절성 변수 추가
    downsampled_df['계절변수'] = downsampled_df['기간'].apply(map_period)

    # 필요한 feature만 가져오기
    feature_list = ['평균가', '계절변수']
    downsampled_df = downsampled_df[feature_list]

    # 입력 데이터 스케일링 필요(학습할 때 사용했던 스케일러 사용)
    columns_to_scale = ['평균가', '계절변수']
    scaled_df = downsampled_df.copy()
    scaled_df[columns_to_scale] = scaler.transform(downsampled_df[columns_to_scale])

    # 입력 데이터 생성
    tensor = torch.tensor(scaled_df.values, dtype=torch.float32)
    tensor = tensor.unsqueeze(0)

    return tensor


class LSTM(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers, dropout=0):
        super(LSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])

        return out

class LTSF_Linear(nn.Module):
    def __init__(self, window_size, forcast_size, individual, feature_size):
        super(LTSF_Linear, self).__init__()
        self.window_size = window_size  # 입력 step 수
        self.forcast_size = forcast_size  # 출력 step 수
        self.individual = individual
        self.channels = feature_size  # 입력 featrue의 수

        if self.individual:
            self.Linear = nn.ModuleList()
            for i in range(self.channels):
                self.Linear.append(nn.Linear(self.window_size, self.forcast_size))
        else:
            self.Linear = nn.Linear(self.window_size, self.forcast_size)

    def forward(self, x):
        if self.individual:
            output = torch.zeros([x.size(0), self.forcast_size, x.size(2)], dtype=x.dtype).to(x.device)
            for i in range(self.channels):
                output[:, :, i] = self.Linear[i](x[:, :, i])
            x = output
        else:
            x = self.Linear(x.permute(0, 2, 1)).permute(0, 2, 1)

        return x


class moving_avg(nn.Module):
    def __init__(self, kernel_size, stride):
        super(moving_avg, self).__init__()
        self.kernel_size = kernel_size
        self.avg = nn.AvgPool1d(kernel_size=kernel_size, stride=stride, padding=0)

    def forward(self, x):
        front = x[:, 0:1, :].repeat(1, (self.kernel_size - 1) // 2, 1)
        end = x[:, -1:, :].repeat(1, (self.kernel_size - 1) // 2, 1)
        x = torch.cat([front, x, end], dim=1)
        x = self.avg(x.permute(0, 2, 1))
        x = x.permute(0, 2, 1)

        return x


class series_decomp(nn.Module):
    def __init__(self, kernel_size):
        super(series_decomp, self).__init__()
        self.moving_avg = moving_avg(kernel_size, stride=1)

    def forward(self, x):
        moving_mean = self.moving_avg(x)
        residual = x - moving_mean

        return moving_mean, residual


class LTSF_DLinear(torch.nn.Module):
    def __init__(self, window_size, forcast_size, kernel_size, individual, feature_size):
        super(LTSF_DLinear, self).__init__()
        self.window_size = window_size
        self.forcast_size = forcast_size
        self.decompsition = series_decomp(kernel_size)
        self.individual = individual
        self.channels = feature_size

        if self.individual:
            self.Linear_Seasonal = nn.ModuleList()
            self.Linear_Trend = nn.ModuleList()
            for i in range(self.channels):
                self.Linear_Trend.append(nn.Linear(self.window_size, self.forcast_size))
                self.Linear_Trend[i].weight = nn.Parameter(
                    (1 / self.window_size) * torch.ones([self.forcast_size, self.window_size]))
                self.Linear_Seasonal.append(nn.Linear(self.window_size, self.forcast_size))
                self.Linear_Seasonal[i].weight = nn.Parameter(
                    (1 / self.window_size) * torch.ones([self.forcast_size, self.window_size]))
        else:
            self.Linear_Trend = nn.Linear(self.window_size, self.forcast_size)
            self.Linear_Trend.weight = nn.Parameter(
                (1 / self.window_size) * torch.ones([self.forcast_size, self.window_size]))
            self.Linear_Seasonal = nn.Linear(self.window_size, self.forcast_size)
            self.Linear_Seasonal.weight = nn.Parameter(
                (1 / self.window_size) * torch.ones([self.forcast_size, self.window_size]))

    def forward(self, x):
        trend_init, seasonal_init = self.decompsition(x)
        trend_init, seasonal_init = trend_init.permute(0, 2, 1), seasonal_init.permute(0, 2, 1)

        if self.individual:
            trend_output = torch.zeros([trend_init.size(0), trend_init.size(1), self.forcast_size],
                                       dtype=trend_init.dtype).to(trend_init.device)
            seasonal_output = torch.zeros([seasonal_init.size(0), seasonal_init.size(1), self.forcast_size],
                                          dtype=seasonal_init.dtype).to(seasonal_init.device)
            for idx in range(self.channels):
                trend_output[:, idx, :] = self.Linear_Trend[idx](trend_init[:, idx, :])
                seasonal_output[:, idx, :] = self.Linear_Seasonal[idx](seasonal_init[:, idx, :])
        else:
            trend_output = self.Linear_Trend(trend_init)
            seasonal_output = self.Linear_Seasonal(seasonal_init)

        x = seasonal_output + trend_output

        return x.permute(0, 2, 1)

class LTSF_NLinear(nn.Module):
    def __init__(self, window_size, forcast_size, individual, feature_size):
        super(LTSF_NLinear, self).__init__()
        self.window_size = window_size
        self.forcast_size = forcast_size
        self.individual = individual
        self.channels = feature_size

        if self.individual:
            self.Linear = torch.nn.ModuleList()
            for i in range(self.channels):
                self.Linear.append(nn.Linear(self.window_size, self.forcast_size))
        else:
            self.Linear = nn.Linear(self.window_size, self.forcast_size)

    def forward(self, x):
        seq_last = x[:, -1:, :].detach()
        x = x - seq_last

        if self.individual:
            output = torch.zeros([x.size(0), self.forcast_size, x.size(2)], dtype=x.dtype).to(x.device)
            for i in range(self.channels):
                output[:, :, i] = self.Linear[i](x[:, :, i])
            x = output
        else:
            x = self.Linear(x.permute(0, 2, 1)).permute(0, 2, 1)

        x = x + seq_last
        return x

def predict(pt_item, x, scaler):
    lstm_model = LSTM(input_size=2, hidden_size=128, output_size=3, num_layers=3, dropout=0.0)
    lstm_model.load_state_dict(torch.load(pt_item['LSTM'], map_location=torch.device('cpu'), weights_only=True))
    lstm_model.eval()

    ltsf_linear_model = LTSF_Linear(window_size=9, forcast_size=3, individual=True, feature_size=2)
    ltsf_linear_model.load_state_dict(torch.load(pt_item['LTSF_Linear'], map_location=torch.device('cpu'), weights_only=True))
    ltsf_linear_model.eval()

    ltsf_dlinear_model = LTSF_DLinear(window_size=9, forcast_size=3, kernel_size=3, individual=True, feature_size=2)
    ltsf_dlinear_model.load_state_dict(torch.load(pt_item['LTSF_DLinear'], map_location=torch.device('cpu'), weights_only=True))
    ltsf_dlinear_model.eval()

    ltsf_nlinear_model = LTSF_NLinear(window_size=9, forcast_size=3, individual=True, feature_size=2)
    ltsf_nlinear_model.load_state_dict(torch.load(pt_item['LTSF_NLinear'], map_location=torch.device('cpu'), weights_only=True))
    ltsf_nlinear_model.eval()

    lstm_model_output = lstm_model(x).transpose(0, 1).detach().numpy()
    linear_model_output = ltsf_linear_model(x)[:, :, 0].transpose(0, 1).detach().numpy()
    dlinear_model_output = ltsf_dlinear_model(x)[:, :, 0].transpose(0, 1).detach().numpy()
    nlinear_model_output = ltsf_nlinear_model(x)[:, :, 0].transpose(0, 1).detach().numpy()

    price_scaler = MinMaxScaler()
    price_scaler.min_ = scaler.min_[0]
    price_scaler.scale_ = scaler.scale_[0]

    lstm_model_output = price_scaler.inverse_transform(lstm_model_output).flatten()
    linear_model_output = price_scaler.inverse_transform(linear_model_output).flatten()
    dlinear_model_output = price_scaler.inverse_transform(dlinear_model_output).flatten()
    nlinear_model_output = price_scaler.inverse_transform(nlinear_model_output).flatten()

    return lstm_model_output, linear_model_output, dlinear_model_output, nlinear_model_output

def get_next_dates(last_date):
    periods = ['상순', '중순', '하순']
    year, month, period = last_date.split('-')
    year = int(year)
    month = int(month)
    next_dates = []

    for _ in range(3):
        next_period_idx = (periods.index(period) + 1) % len(periods)
        if next_period_idx == 0:  # 상순으로 넘어가는 경우
            month += 1
            if month > 12:  # 다음 해로 넘어가는 경우
                month = 1
                year += 1
        period = periods[next_period_idx]
        next_dates.append(f"{year:04d}-{month:02d}-{period}")

    return next_dates

def add_dates_to_output(output, dates):
    result = []
    for date, value in zip(dates, output):
        result.append([date, float(value)])
    return np.array(result)


if __name__ == '__main__':
    db_connection = mysql.connector.connect(
        host="localhost",  # 데이터베이스 서버
        user="root",  # 사용자명
        password="0000",  # 비밀번호
        database="소공",  # 데이터베이스 이름
        collation='utf8mb4_general_ci'
    )

    cursor = db_connection.cursor()

    query = "SELECT * FROM 거래정보;"
    cursor.execute(query)

    columns = [desc[0] for desc in cursor.description]
    data = cursor.fetchall()

    df = pd.DataFrame(data, columns=columns)

    cursor.close()
    db_connection.close()

    detail_items = {
        '바나나': {
            '부류코드': '06',
            '품목코드': '12',
            '품종코드': '98',
            '거래단량': 13.0,
            '단위코드': '12',
            '포장상태코드': '101',
        },
        '방울토마토': {
            '부류코드': '08',
            '품목코드': '06',
            '품종코드': '01',
            '거래단량': 5.0,
            '단위코드': '12',
            '포장상태코드': '101'
        },
        '토마토': {
            '부류코드': '08',
            '품목코드': '03',
            '품종코드': '01',
            '거래단량': 5.0,
            '단위코드': '12',
            '포장상태코드': '101'
        },
        '애호박': {
            '부류코드': '09',
            '품목코드': '02',
            '품종코드': '01',
            '거래단량': 8.0,
            '단위코드': '12',
            '포장상태코드': '101'
        },
        '가지': {
            '부류코드': '09',
            '품목코드': '03',
            '품종코드': '01',
            '거래단량': 8.0,
            '단위코드': '12',
            '포장상태코드': '101',
        }
    }
    

    base_path = r'C:\Users\yean\Desktop\2024-2\subject\swe\TEAMPROJECT\SoftwareEngineering\myapp\server\python\\'

    # model_paths 딕셔너리 생성
    model_paths = {
        '바나나': {
            'LSTM': base_path + 'models/LSTM_바나나.pt',
            'LTSF_Linear': base_path + 'models/LTSF_Linear_바나나.pt',
            'LTSF_DLinear': base_path + 'models/LTSF_DLinear_바나나.pt',
            'LTSF_NLinear': base_path + 'models/LTSF_NLinear_바나나.pt',
        },
        '방울토마토': {
            'LSTM': base_path + 'models/LSTM_방울토마토.pt',
            'LTSF_Linear': base_path + 'models/LTSF_Linear_방울토마토.pt',
            'LTSF_DLinear': base_path + 'models/LTSF_DLinear_방울토마토.pt',
            'LTSF_NLinear': base_path + 'models/LTSF_NLinear_방울토마토.pt',
        },
        '토마토': {
            'LSTM': base_path + 'models/LSTM_토마토.pt',
            'LTSF_Linear': base_path + 'models/LTSF_Linear_토마토.pt',
            'LTSF_DLinear': base_path + 'models/LTSF_DLinear_토마토.pt',
            'LTSF_NLinear': base_path + 'models/LTSF_NLinear_토마토.pt',
        },
        '애호박': {
            'LSTM': base_path + 'models/LSTM_애호박.pt',
            'LTSF_Linear': base_path + 'models/LTSF_Linear_애호박.pt',
            'LTSF_DLinear': base_path + 'models/LTSF_DLinear_애호박.pt',
            'LTSF_NLinear': base_path + 'models/LTSF_NLinear_애호박.pt',
        },
        '가지': {
            'LSTM': base_path + 'models/LSTM_가지.pt',
            'LTSF_Linear': base_path + 'models/LTSF_Linear_가지.pt',
            'LTSF_DLinear': base_path + 'models/LTSF_DLinear_가지.pt',
            'LTSF_NLinear': base_path + 'models/LTSF_NLinear_가지.pt',
        }
    }

    # scalers 딕셔너리 생성
    scalers = {
        '바나나': load(open(base_path + 'scalers/바나나_minmax_scaler.pkl', 'rb')),
        '방울토마토': load(open(base_path + 'scalers/방울토마토_minmax_scaler.pkl', 'rb')),
        '토마토': load(open(base_path + 'scalers/토마토_minmax_scaler.pkl', 'rb')),
        '애호박': load(open(base_path + 'scalers/애호박_minmax_scaler.pkl', 'rb')),
        '가지': load(open(base_path + 'scalers/가지_minmax_scaler.pkl', 'rb'))
    }
    predictions = []
    for item_name, detail_item in detail_items.items():
        scaler = scalers[item_name]
        model_path = model_paths[item_name]
        input_sequence = extract_input_sequence(df, detail_item)
        input_data = extract_input_data(input_sequence, scaler)
        lstm_output, linear_output, dlinear_output, nlinear_output = predict(model_path, input_data, scaler)
        next_dates = get_next_dates(input_sequence.values[-1, 0])
        lstm_result = add_dates_to_output(lstm_output, next_dates)
        linear_result = add_dates_to_output(linear_output, next_dates)
        dlinear_result = add_dates_to_output(dlinear_output, next_dates)
        nlinear_result = add_dates_to_output(nlinear_output, next_dates)
        predictions.append([input_sequence.values.tolist(), lstm_result.tolist(),
                            linear_result.tolist(), dlinear_result.tolist(), nlinear_result.tolist()])

    print(json.dumps(predictions))  # JSON 형식으로 출 

