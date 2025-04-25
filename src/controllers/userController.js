const { pool, query } = require('../config/database');
const bcrypt = require('bcrypt');
const { createErrorResponse, createSuccessResponse, handleDatabaseError } = require('../middleware/errorHandler');

// 모든 사용자 조회
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.promise().query(
            'SELECT id, username, license, avatar, created_at from users ORDER BY created_at DESC'
        );
        return createSuccessResponse(res, users);
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 사용자 생성
const createUser = async (req, res) => {
    const { id, username, password } = req.body;

    if (!id || !username || !password) {
        return createErrorResponse(res, 400, "id, username, password은 필수 필드입니다.");
    }

    try {
        const existingUsers = await query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (existingUsers && existingUsers.length > 0) {
            return createErrorResponse(res, 400, "이미 사용 중인 username입니다.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            "INSERT INTO users (id, username, password, license) VALUES (?, ?, ?, ?)",
            [id, username, hashedPassword, 1]
        );

        return createSuccessResponse(res, { id: result.insertId, username }, 201);
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 특정 유저 조회
const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const [user] = await pool.promise().query(
            'SELECT id, username, avatar, created_at FROM users WHERE username=?',
            [username]
        );

        if (user.length === 0) {
            return createErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
        }

        return createSuccessResponse(res, user);
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 사용자 avatar 업데이트
const updateUserAvatar = async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return createErrorResponse(res, 400, "이미지 파일을 업로드해주세요.");
    }

    try {
        const [user] = await pool.promise().query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!user || user.length === 0) {
            return createErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
        }

        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        await query(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatarPath, id]
        );

        return createSuccessResponse(res, { id, avatar: avatarPath });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUserByUsername,
    updateUserAvatar
}; 