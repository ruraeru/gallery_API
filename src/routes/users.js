const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/database');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { createErrorResponse, createSuccessResponse, handleDatabaseError, handleFileUploadError } = require('../middleware/errorHandler');
const { getAllUsers, createUser, getUserByUsername, updateUserAvatar } = require('../controllers/userController');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, `uploads/avatars/`);
    },
    filename: function (req, file, callback) {
        const { id } = req.params;
        const ext = path.extname(file.originalname);
        callback(null, `avatar-${id}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    },
    fileFilter: function (req, file, callback) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            callback(new Error('이미지 파일만 업로드 가능합니다!'));
        }
    }
});

// 라우트 설정
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:username', getUserByUsername);
router.put('/:id/avatar', upload.single('avatar'), updateUserAvatar);

module.exports = router; 