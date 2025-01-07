const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const PYTHON_PATH = 'C:/Users/yean/Desktop/2024-2/subject/swe/TEAMPROJECT/SoftwareEngineering/myapp/server/python/pricePredict.py';

router.get('/', (req, res) => {   
    console.log("Connect Model Server")
    const python = spawn('python.exe', [PYTHON_PATH]);
 
    let dataString = ''; 
    python.stdout.on('data', (dataToSend) => { 
        console.log('Received data from python:', dataToSend.toString());  
        dataString += dataToSend.toString(); // Buffer를 문자열로 변환하여 누적
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: data.toString() });
    });

    python.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code == 0) {
            try {
                const result = JSON.parse(dataString); // 누적된 문자열을 JSON으로 파싱
                res.json(result); // JSON 응답으로 클라이언트에 전송
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).json({ error: 'Error parsing JSON' });
            }
        } else {
            
            res.status(500).json({ error: `Python process exited with code ${code}` });
        }
    });
});

module.exports = router;
