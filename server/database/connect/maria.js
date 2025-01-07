const mysql = require('mysql'); // 'mysql' 모듈을 가져옵니다.

const conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '0000',
    database : '소공'
});

// 연결을 시도하고 에러를 처리합니다.
conn.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.stack);
        return;
    }
    console.log('데이터베이스에 연결됨:', conn.threadId);
});

module.exports = conn; // 연결 객체를 내보냅니다.
