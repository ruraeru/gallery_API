const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();

//로그
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

//로그
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '서버 에러가 발생했습니다.' });
})

// 미들웨어 설정
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MySQL 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gallery_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 연결 테스트
pool.getConnection((err, connection) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err);
        return;
    }
    console.log('MySQL 데이터베이스 연결 성공!');
    connection.release();
});

// 라우터 설정
const usersRouter = require('./routes/users');
app.use('/api', usersRouter);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'Gallery API 서버가 실행 중입니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 