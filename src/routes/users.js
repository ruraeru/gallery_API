const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        const { id } = req.params;
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${id}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('이미지 파일만 업로드 가능합니다!'));
        }
    }
});

// 모든 사용자 조회
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.promise().query(
            'SELECT id, username, license, avatar, created_at from users ORDER BY created_at DESC'
        );
        console.log("조회된 사용자: ", users);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('사용자 조회 중 에러 발생:', error.sqlMessage);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/users', async (req, res) => {
    console.log("POST /api/users 요청 받음, body:", req.body);
    const { id, username, password } = req.body;

    if (!id || !username || !password) {
        return res.status(400).json({
            success: false,
            error: "id, username, password은 필수 필드입니다."
        });
    }

    try {
        const existingUsers = await query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (existingUsers && existingUsers.length > 0) {
            // const duplicateField = existingUsers[0].username === username ? "username" : "email";
            return res.status(400).json({
                success: false,
                error: `이미 사용 중인 username입니다.`
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            "INSERT INTO users (id, username, password, license) VALUES (?, ?, ?, ?)",
            [id, username, hashedPassword, 1]
        );
        console.log("생성된 사용자:", { id: id, username, license: result.license });
        res.status(201).json({
            success: true,
            data: { id: result.insertId, username }
        });
    }
    catch (error) {
        console.error("에러 발생:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                success: false,
                error: "이미 사용 중인 username입니다."
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/users/:id',)

// 사용자 avatar 업데이트 (파일 업로드)
router.put('/:id/avatar', upload.single('avatar'), async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "이미지 파일을 업로드해주세요."
        });
    }

    try {
        // 사용자 존재 여부 확인
        const [user] = await pool.promise().query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!user || user.length === 0) {
            return res.status(404).json({
                success: false,
                error: "사용자를 찾을 수 없습니다."
            });
        }

        // 파일 경로 생성
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        // avatar 업데이트
        await query(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatarPath, id]
        );

        res.json({
            success: true,
            data: {
                id,
                avatar: avatarPath
            }
        });
    } catch (error) {
        console.error("avatar 업데이트 중 에러 발생:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 