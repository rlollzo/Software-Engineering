 
const express = require('express');
const router = express.Router();
const axios = require('axios'); 

const NEXT_PUBLIC_API_REALTIME_PRICE = " https://at.agromarket.kr/openApi/price/real.do";

//const API_KEY ='BF9DF705B16A4337BC2736DA4B93EFCC'
const API_KEY ='A0C3CA636DF8425981B8CEB3D58ED279'


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const extractedData = function(jsonData) {
    console.log(jsonData);
    return jsonData.data.map(({ 
        sbidtime, whsalName, cmpName, 
        largeName, midName, smallName, sanName,
        cost, qty, std
        /* 경락일자 ,경락일시, 도매시장명, 법인명
        대분류명, 중분류명, 소분류명, 산지명,
        경락가, 물량, 규격, 경략일시 */
    }) => ({
        sbidtime, whsalName, cmpName, 
        largeName, midName, smallName, sanName,
        cost, qty, std    
    }));
}; 

router.get('/', async (req, res) => {    
    const large = req.query.large;
    const mid = req.query.mid || undefined; // mid가 없으면 undefined로 처리
    const small = req.query.small || undefined; // small이 없으면 undefined로 처리
    console.log('Received large:', large);
    console.log('Received mid:', mid);
    console.log('Received small:', small);
     
    console.log("Receive REAL-time api requests")
    try {
        const response = await axios.get(NEXT_PUBLIC_API_REALTIME_PRICE, {
            params: {
                serviceKey: API_KEY, apiType: "json", pageNo: 1, whsalCd: 110001
            },
        });

        if (response.status === 200 && response.data && Array.isArray(response.data.data)) { 
            const exData = extractedData(response.data);
            console.log('Extracted data:', exData);   
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.json(exData);
        } else { 
            console.error('Unexpected API response:', response.data);
            return res.status(response.status).json({ error: 'Unexpected API response structure' });
        }
    } catch (error) {
        console.error('External API request failed:', error.message || error);
        const status = error.response?.status || 500;
        return res.status(status).json({
            error: 'Failed to get data from external API.',
            details: error.response?.data || error.message,
        });
    } 
    console.log("Receive REAL-time api requests")
});

 
module.exports = router; // 라우터를 내보냄