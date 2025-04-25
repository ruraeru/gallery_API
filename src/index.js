const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 데이터베이스 연결 및 테이블 동기화
sequelize.authenticate()
    .then(() => {
        console.log('MySQL 데이터베이스 연결 성공!');
        return sequelize.sync();
    })
    .then(() => {
        console.log('데이터베이스 테이블 동기화 완료!');
    })
    .catch(err => {
        console.error('데이터베이스 연결 실패:', err);
    });

// 라우터 설정
const usersRouter = require('./routes/users');
app.use('/api', usersRouter);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'Gallery API 서버가 실행 중입니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 