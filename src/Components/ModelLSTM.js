import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Box, Button } from '@mui/material';
import styled from 'styled-components';
const PageDescription = styled.div`
  background-color: #ccffcc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
`;
const Home = () => {
  const DB_PAST_SERVER_URL = 'http://localhost:4444/model'; // 데이터 가져올 URL
  const [structuredData, setStructuredData] = useState([]);
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const [showIntro, setShowIntro] = useState(true); // 소개 텍스트 표시 상태

  const itemNames = ['바나나', '방울토마토', '토마토', '애호박', '가지'];

  const calculateChange = (current, previous) => {
    if (previous === 0) return '-'; // 이전 값이 0이면 표시 안 함
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`; // 소수점 2자리까지 표시
  };

  const fetchData = async () => {
    setLoading(true); // 로딩 시작
    setShowIntro(false); // 설명 텍스트 숨기기
    try {
      const response = await fetch(DB_PAST_SERVER_URL);
      const rawData = await response.json();

      const parsedData = rawData.map((row, rowIndex) => {
        const previousData = row[0].map(([date, value]) => ({
          date,
          value: Math.round(value),
        }));

        const updatedPreviousData = previousData.map((item, index) => {
          if (index === 0) {
            return { ...item, change: '-' };
          } else {
            const change = ((item.value - previousData[index - 1].value) / previousData[index - 1].value) * 100;
            return { ...item, change: `${change > 0 ? '+' : ''}${change.toFixed(1)}%` };
          }
        });

        const lastPreviousValue = previousData[previousData.length - 1].value;

        const addPredictionChange = (predictions, previousValue) => {
          return predictions.map((item, index) => {
            const change = index === 0
              ? calculateChange(item.value, previousValue)
              : calculateChange(item.value, predictions[index - 1].value);
            return { ...item, change };
          });
        };

        return {
          name: itemNames[rowIndex],
          previousData: updatedPreviousData,
          predictions: {
            LSTM: addPredictionChange(
              row[1].map(([date, value]) => ({
                date,
                value: Math.round(parseFloat(value)),
              })),
              lastPreviousValue
            ),
            Linear: addPredictionChange(
              row[2].map(([date, value]) => ({
                date,
                value: Math.round(parseFloat(value)),
              })),
              lastPreviousValue
            ),
            DLinear: addPredictionChange(
              row[3].map(([date, value]) => ({
                date,
                value: Math.round(parseFloat(value)),
              })),
              lastPreviousValue
            ),
            NLinear: addPredictionChange(
              row[4].map(([date, value]) => ({
                date,
                value: Math.round(parseFloat(value)),
              })),
              lastPreviousValue
            ),
          },
        };
      });

      setStructuredData(parsedData);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const renderChart = (data, containerId) => {
    const chart = echarts.init(document.getElementById(containerId));

    const previousDates = data.previousData.map((item) => item.date);
    const previousValues = data.previousData.map((item) => item.value);

    const predictionDates = data.predictions.LSTM.map((item) => item.date);
    const xAxisData = [...previousDates, ...predictionDates];

    const seriesData = [
      {
        name: '이전 데이터',
        type: 'line',
        data: previousValues,
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { color: '#FF9F43' },
      },
      ...Object.entries(data.predictions).map(([model, modelData]) => {
        const modelValues = modelData.map((item) => item.value);
        const mergedValues = [...previousValues.slice(-1), ...modelValues];

        return {
          name: model,
          type: 'line',
          data: [...new Array(previousValues.length - 1).fill(null), ...mergedValues],
          smooth: true,
          lineStyle: { width: 2 },
          itemStyle: {
            color:
              model === 'LSTM'
                ? '#4CAF50'
                : model === 'Linear'
                ? '#2196F3'
                : model === 'DLinear'
                ? '#E91E63'
                : '#9C27B0',
          },
        };
      }),
    ];

    const option = {
      title: {
        text: `${data.name} 가격 차트`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 10,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} 원',
        },
      },
      series: seriesData,
    };

    chart.setOption(option);
  };

  const renderTable = (data) => {
    const headers = ['날짜', ...data.previousData.map((item) => item.date)];
    const previousValues = ['가격', ...data.previousData.map((item) => `${item.value} 원`)];
    const changeValues = ['등락율', ...data.previousData.map((item) => item.change)];
    const predictionHeaders = ['모델', ...data.predictions.LSTM.map((item) => item.date)];
    const predictionRows = Object.entries(data.predictions).map(([model, values]) => [
      model,
      ...values.map((item) => `${item.value} 원 (${item.change})`),
    ]);

    return (
      <Box style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '20px', marginBottom: '40px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Typography variant="h5" style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
          {data.name}
        </Typography>
        <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index} align="center">
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {previousValues.map((value, index) => (
                  <TableCell key={index} align="center">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {changeValues.map((value, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    style={{
                      color: value.includes('+') ? 'red' : value.includes('-') ? 'blue' : 'black',
                    }}
                  >
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {predictionHeaders.map((header, index) => (
                  <TableCell key={index} align="center">
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {predictionRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      align="center"
                      style={{
                        color: cell.includes('+') ? 'red' : cell.includes('-') ? 'blue' : 'black',
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  useEffect(() => {
    structuredData.forEach((data, index) => {
      renderChart(data, `chart-container-${index}`);
    });
  }, [structuredData]);

  return (
    <div>
      

      {showIntro && (
        <Box style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
          <PageDescription>
        <h3>AI 기반 가격 예측</h3>
        <p>
        검색일 기준일로부터의  T-9~T-1의 데이터를 기반으로 4가지 모델로 
        5가지의 물품의 T~T+2의 가격을 예측
        </p>
      </PageDescription>
        </Box>
      )}

      <Box style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button variant="contained" color="primary" onClick={fetchData}>
          가격 예측
        </Button>
      </Box>

      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <CircularProgress />
          <p>가격을 예측하고 있습니다 잠시만 기다려주세요...</p>
        </div>
      )}

      {!loading && structuredData.length > 0 && (
        <div>
          {structuredData.map((row, index) => (
            <div key={index}>
              {renderTable(row)}
              <div id={`chart-container-${index}`} style={{ width: '100%', height: '400px', margin: '20px 0', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
