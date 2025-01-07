const express = require('express');
const router = express.Router();
const conn = require('../database/connect/maria'); // MariaDB 연결 모듈을 가져옵니다.

router.get('/PastTransactionTrend', (req, res) => { 
    console.log("Receive DB-PastTransactionTrend api requests"); 
    const { large, mid, small } = req.query;

    const bCode = large || null; 
    const pCode = mid || null;
    const vCode = small || null;

    console.log('Received large:', large);
    console.log('Received mid:', mid);
    console.log('Received small:', small);

    // 기본 쿼리
    let query = `
WITH AggregatedData AS (
    SELECT 
        경락일자,
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드,
        SUM(총금액) AS 총금액,
        MAX(최고가) AS 최고가,
        MIN(최저가) AS 최저가,
        AVG(평균가) AS 평균가,
        SUM(총거래량) AS 총거래량,
        SUM(총물량) AS 총물량
    FROM 거래정보
    WHERE`; 
    if (bCode) {
        query += ` 부류코드 = ${bCode}`; 
    }
    if (pCode) {
        query += ` AND 품목코드 = ${pCode}`;  
    }
    if (vCode) {
        query += ` AND 품종코드 = ${vCode}`;  
    }

    query += `
    GROUP BY 경락일자, 부류코드, 품목코드, 품종코드, 거래단량, 단위코드, 포장상태코드) SELECT * FROM AggregatedData;`;
 
    // 데이터베이스 쿼리 실행
    conn.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
        console.log(results);
    });
});


router.get('/Previous', (req, res) => {
    console.log("Receive DB-Previous api requests") 
    const { large, mid, small, today} = req.query;
    const bCode = large || null; 
    const pCode = mid || null;
    const vCode = small || null;
    console.log('=PastTransactionTrend=');
    console.log('Received large:', large);
    console.log('Received mid:', mid);
    console.log('Received small:', small); 
    console.log('Received today:', today);
    let query = `
WITH AggregatedData AS (
    SELECT 
        경락일자,
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드,
        SUM(총금액) AS 총금액,
        MAX(최고가) AS 최고가,
        MIN(최저가) AS 최저가,
        AVG(평균가) AS 평균가,
        SUM(총거래량) AS 총거래량,
        SUM(총물량) AS 총물량
    FROM 거래정보
    WHERE`; 
    if (bCode) {
        query += ` 부류코드 = ${bCode}`;
    }
    if (pCode) {
        query += ` AND 품목코드 = ${pCode}`; 
    }
    if (vCode) {
        query += ` AND 품종코드 = ${vCode}`; 
    } 
    
    query += `
    GROUP BY 
        경락일자, 
        부류코드,
        품목코드, 
        품종코드, 
        거래단량, 
        단위코드, 
        포장상태코드
),

GroupCounts AS (
    SELECT 
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드,
        COUNT(*) AS 그룹_행수
    FROM AggregatedData
    GROUP BY 
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드
    ORDER BY 그룹_행수 DESC
    LIMIT 1
),

CurrentData AS (
    SELECT 
        A.경락일자,
        A.부류코드,
        A.품목코드,
        A.품종코드,
        A.거래단량,
        A.단위코드,
        A.포장상태코드,
        A.총금액,
        A.최고가,
        A.최저가,
        A.평균가,
        A.총거래량,
        A.총물량
    FROM AggregatedData A
    JOIN GroupCounts G
        ON A.부류코드 = G.부류코드
        AND A.품목코드 = G.품목코드
        AND A.품종코드 = G.품종코드
        AND A.거래단량 = G.거래단량
        AND A.단위코드 = G.단위코드
        AND A.포장상태코드 = G.포장상태코드
    
)

SELECT *
FROM CurrentData
WHERE 경락일자 = DATE_SUB(`;
    query += `'${today}'`;
    query += `, INTERVAL 1 DAY)
OR 경락일자 = DATE_SUB(`;
query += `'${today}'`;
    query += `, INTERVAL 1 MONTH)
OR 경락일자 = DATE_SUB(`;
query += `'${today}'`;
    query += `, INTERVAL 1 YEAR);`; 
    // 데이터베이스 쿼리 실행 
    conn.query(query, (err, results) => { 
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
        console.log(results);
    });
});
 
router.get('/Previous-thisFriday', (req, res) => { 
    const { large, mid, small, saleDate } = req.query; 
    const bCode = large || null; 
    const pCode = mid || null;
    const vCode = small || null; 
    console.log('Received large:', large);
    console.log('Received mid:', mid);
    console.log('Received small:', small); 
    console.log('Received saleDate:', saleDate);

    let query = `
WITH AggregatedData AS (
    SELECT 
        경락일자,
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드,
        SUM(총금액) AS 총금액,
        MAX(최고가) AS 최고가,
        MIN(최저가) AS 최저가,
        AVG(평균가) AS 평균가,
        SUM(총거래량) AS 총거래량,
        SUM(총물량) AS 총물량
    FROM 거래정보
    WHERE`;
    if (bCode) query += ` 부류코드 = ${bCode}`;
    if (pCode) query += ` AND 품목코드 = ${pCode}`; 
    if (vCode) query += ` AND 품종코드 = ${vCode}`;

    query += `
    GROUP BY 
        경락일자, 
        부류코드,
        품목코드, 
        품종코드, 
        거래단량, 
        단위코드, 
        포장상태코드
),

GroupCounts AS (
    SELECT 
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드,
        COUNT(*) AS 그룹_행수
    FROM AggregatedData
    GROUP BY 
        부류코드,
        품목코드,
        품종코드,
        거래단량,
        단위코드,
        포장상태코드
    ORDER BY 그룹_행수 DESC
    LIMIT 1
),

CurrentData AS (
    SELECT 
        A.경락일자,
        A.부류코드,
        A.품목코드,
        A.품종코드,
        A.거래단량,
        A.단위코드,
        A.포장상태코드,
        A.총금액,
        A.최고가,
        A.최저가,
        A.평균가,
        A.총거래량,
        A.총물량
    FROM AggregatedData A
    JOIN GroupCounts G
        ON A.부류코드 = G.부류코드
        AND A.품목코드 = G.품목코드
        AND A.품종코드 = G.품종코드
        AND A.거래단량 = G.거래단량
        AND A.단위코드 = G.단위코드
        AND A.포장상태코드 = G.포장상태코드
)
SELECT *
FROM CurrentData
WHERE 경락일자 = DATE_SUB(`;
    query += `'${saleDate}'`;
    query += `, INTERVAL 1 DAY)
OR 경락일자 = DATE_SUB(`;
query += `'${saleDate}'`;
    query += `, INTERVAL 1 MONTH)
OR 경락일자 = DATE_SUB(`;
query += `'${saleDate}'`;
    query += `, INTERVAL 1 YEAR);`;  

    conn.query(query, (err, results) => { 
        console.log("금일 데이터가 없어 금주 금요일 데이터를 가져옵니다.")   
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
        console.log(results);
    });
});

router.get('/News-Newspaper', (req, res) => {
    console.log("Receive DB-News api requests") 
    const query = `
    SELECT id, url, title, sub_title, image_url, 
            CASE 
                WHEN LENGTH(content) > 100 THEN CONCAT(SUBSTRING(content, 1, 100), '...')
                ELSE content
            END AS content, 
            date 
     FROM news 
     WHERE site_name = '농민신문' 
     ORDER BY date DESC LIMIT 4
`;

    // 데이터베이스 쿼리 실행
    conn.query(query, (err, results) => {
        console.log("농민신문 데이터를 가져옵니다.")
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
        console.log(results);
    });
});

router.get('/News-Alimi', (req, res) => {
    console.log("Receive DB-News api requests")
 
    const query = `
        SELECT id, url, title, sub_title, image_url, 
                CASE 
                    WHEN LENGTH(content) > 100 THEN CONCAT(SUBSTRING(content, 1, 100), '...')
                    ELSE content
                END AS content, 
                date 
         FROM news 
         WHERE site_name = '농어촌알리미' 
         ORDER BY date DESC LIMIT 6
`;

    // 데이터베이스 쿼리 실행
    conn.query(query, (err, results) => {
        console.log("농어촌알리미의 데이터를 가져옵니다.")
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        res.json(results);
        console.log(results);
    });
});

router.get("/News-BOTH", (req, res) => {
    const newsData = {};
  
    // 농민신문 데이터 가져오기
        conn.query(
      `SELECT id, url, title, sub_title, image_url, 
              CASE 
                  WHEN LENGTH(content) > 100 THEN CONCAT(SUBSTRING(content, 1, 100), '...')
                  ELSE content
              END AS content, 
              date 
       FROM news 
       WHERE site_name = '농민신문' 
       ORDER BY date DESC LIMIT 4`,
      (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }
        newsData.Newspaper = results;
  
        // 농어촌알리미 데이터 가져오기
        conn.query(
          `SELECT id, url, title, sub_title, image_url, 
                  CASE 
                      WHEN LENGTH(content) > 100 THEN CONCAT(SUBSTRING(content, 1, 100), '...')
                      ELSE content
                  END AS content, 
                  date 
           FROM news 
           WHERE site_name = '농어촌알리미' 
           ORDER BY date DESC LIMIT 6`,
          (err, results) => {
            if (err) {
              return res.status(500).json({ message: "오류 발생", error: err });
            }
            newsData.Alimi = results;
            console.log(newsData.Newspaper)
            console.log(newsData.Alimi)
            res.json(newsData); // 두 뉴스 데이터를 클라이언트로 전송
          }
        );
      }
    );
  });

  
router.get('/Real', (req, res) => {
    console.log("Receive DB-PastTransactionTrend api requests");
    const { large, mid, small, today } = req.query;

    const normalizeCode = (code) => code.toString().padStart(2, '0');
    const bCode = normalizeCode(large || '');
    const pCode = normalizeCode(mid || '');
    const vCode = normalizeCode(small || '');

    console.log('Received large:', bCode);
    console.log('Received mid:', pCode);
    console.log('Received small:', vCode);
    console.log('Received today:', today);

    const query = `
    WITH AggregatedData AS (
        SELECT 
            DATE(경락일자) AS 경락일자,
            부류코드,
            품목코드,
            품종코드,
            SUM(총금액) AS 총금액,
            MAX(최고가) AS 최고가,
            MIN(최저가) AS 최저가,
            AVG(평균가) AS 평균가,
            SUM(총거래량) AS 총거래량,
            SUM(총물량) AS 총물량
        FROM 거래정보
        WHERE 부류코드 = '${bCode}'
          AND 품목코드 = '${pCode}'
          AND 품종코드 = '${vCode}'
          AND (
              DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 MONTH), '%Y-%m-01')
                                AND LAST_DAY(DATE_SUB('${today}', INTERVAL 1 MONTH))
              OR DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-01-01')
                                AND DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-12-31')
              OR DATE(경락일자) = DATE_SUB('${today}', INTERVAL 1 DAY)
          )
        GROUP BY DATE(경락일자), 부류코드, 품목코드, 품종코드
    ),
    MostRecentData AS (
        SELECT * 
        FROM AggregatedData
        WHERE DATE(경락일자) = (
            SELECT MAX(DATE(경락일자))
            FROM AggregatedData
            WHERE DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 MONTH), '%Y-%m-01')
                                      AND LAST_DAY(DATE_SUB('${today}', INTERVAL 1 MONTH))
        )
        UNION ALL
        SELECT * 
        FROM AggregatedData
        WHERE DATE(경락일자) = (
            SELECT MAX(DATE(경락일자))
            FROM AggregatedData
            WHERE DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-01-01')
                                      AND DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-12-31')
        )
    ),
    ClosestData AS (
        SELECT * 
        FROM AggregatedData
        WHERE DATE(경락일자) <= DATE_SUB('${today}', INTERVAL 1 DAY)
        ORDER BY DATE(경락일자) DESC
        LIMIT 1
    )
    SELECT 
    *,
    CASE
        WHEN DATE(경락일자) = DATE_SUB('${today}', INTERVAL 1 DAY) THEN '전일'
        WHEN DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 MONTH), '%Y-%m-01')
                                 AND LAST_DAY(DATE_SUB('${today}', INTERVAL 1 MONTH)) THEN '전월'
        WHEN DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-01-01')
                                 AND DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-12-31') THEN '전년'
        ELSE '기타'
    END AS 날짜범주
    FROM MostRecentData
    UNION ALL
    SELECT 
        *,
        CASE
            WHEN DATE(경락일자) = DATE_SUB('${today}', INTERVAL 1 DAY) THEN '전일'
            WHEN DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 MONTH), '%Y-%m-01')
                                    AND LAST_DAY(DATE_SUB('${today}', INTERVAL 1 MONTH)) THEN '전월'
            WHEN DATE(경락일자) BETWEEN DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-01-01')
                                    AND DATE_FORMAT(DATE_SUB('${today}', INTERVAL 1 YEAR), '%Y-12-31') THEN '전년'
            ELSE '기타'
        END AS 날짜범주
    FROM ClosestData;`;

    console.log('Generated SQL Query:', query);

    conn.query(query, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query error', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No matching data found' });
        }

        res.json(results);
        console.log('Query Results:', results);
    });
});

module.exports = router;
