 
const express = require('express');
const router = express.Router();
const axios = require('axios'); 

const NEXT_PUBLIC_API_REALTIME_PRICE = " https://at.agromarket.kr/openApi/price/real.do";
const NEXT_PUBLIC_API_SALE_PRICE = "https://at.agromarket.kr/openApi/price/sale.do";
 
const config = require('../confidence.js'); // 상대 경로를 사용
const API_KEY_REAL = config.NONGNET_API_KEY1;
const API_KEY_SALE = config.NONGNET_API_KEY2;
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const extractedDataReal = function(jsonData) {
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

const extractedDataSale = function(jsonData) {
    return jsonData.data.map(({ 
        saleDate, whsalName, cmpName, 
        largeName, midName, smallName, 
        std, sizeName, lvName, sanName,
        totQty, totAmt, minAmt, maxAmt, avgAmt
        /* 정산일자, 도매시장명, 법인명
        대분류명, 중분류명, 소분류명
        규격, 크기명, 등급명, 산지명,
        총 물량, 총금액, 최저가, 최고가, 평균가 */
    }) => ({
        saleDate, whsalName, cmpName, 
        largeName, midName, smallName, 
        std, sizeName, lvName, sanName,
        totQty, totAmt, minAmt, maxAmt, avgAmt      
    }));
}; 

router.get('/realtime', async (req, res) => {    
    const large = req.query.large;
    const mid = req.query.mid || undefined; 
    const small = req.query.small || undefined; 
    console.log('Received large:', large);
    console.log('Received mid:', mid);
    console.log('Received small:', small);
     
    console.log("Receive REAL-time api requests")
    try {
        const response = await axios.get(NEXT_PUBLIC_API_REALTIME_PRICE, {
            params: {
                serviceKey: API_KEY_REAL, apiType: "json", pageNo: 1, whsalCd: 110001
            },
        });

        if (response.status === 200 && response.data && Array.isArray(response.data.data)) { 
            const exData = extractedDataReal(response.data);
            console.log('The API DATA [REAL] received the results normally');  
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
});


router.get('/sale', async (req, res) => { 
    console.log("Receiving an api request for meridians information")
    const saleDate = req.query.saleDate;
    const large = req.query.large;
    const mid = req.query.mid;
    
    console.log('Received saleDate:', saleDate);
    console.log('Received large:', large);
    console.log('Received mid:', mid);
     
    if (!saleDate) { 
        return res.status(400).json({ error: 'Required parameter is missing:saleDate' });
    } 

    try {
        const response = await axios.get(NEXT_PUBLIC_API_SALE_PRICE, {
            params: {
                serviceKey: API_KEY_SALE, apiType: "json", pageNo: 1, whsalCd: 110001,
                saleDate: saleDate,
                largeCd : large,
                midCd : mid
            },
        });

        if (response.status === 200 && response.data && Array.isArray(response.data.data)) { 
            const exData = extractedDataSale(response.data);
            console.log('The API DATA [SALE] received the results normally');   
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
});
 
module.exports = router; // 라우터를 내보냄