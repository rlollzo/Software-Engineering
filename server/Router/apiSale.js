 
const express = require('express');
const router = express.Router();
const axios = require('axios');

const NEXT_PUBLIC_API_REALTIME_PRICE = "https://at.agromarket.kr/openApi/price/sale.do";

const API_KEY = 'BF9DF705B16A4337BC2736DA4B93EFCC'
//

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const extractedData = function(jsonData) {
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

router.get('/', async (req, res) => { 
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
        const response = await axios.get(NEXT_PUBLIC_API_REALTIME_PRICE, {
            params: {
                serviceKey: API_KEY, apiType: "json", pageNo: 1, whsalCd: 110001,
                saleDate: saleDate,
                largeCd : large,
                midCd : mid
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
});
 
module.exports = router; // 라우터를 내보냄