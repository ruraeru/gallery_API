const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllUsers, createUser, getUserByUsername, updateUserAvatar } = require('./userController');
const { IMAGE_TYPE_ERR } = require('../../config/errorCode');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const { id } = req.params;
        const userDir = `uploads/${id}`;
        const avatarDir = `${userDir}/avatar`;

        // 사용자 디렉토리 생성
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        // avatar 디렉토리 생성
        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }

        callback(null, avatarDir);
    },
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        callback(null, `avatar${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: "50mb"
    },
    fileFilter: function (req, file, callback) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return callback(null, true);
        } else {
            callback(new Error(IMAGE_TYPE_ERR.message));
        }
    }
});

// 라우트 설정
router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:username', getUserByUsername);
router.put('/:id/avatar', upload.single('avatar'), updateUserAvatar);

module.exports = router;
