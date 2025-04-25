const bcrypt = require('bcrypt');
const { createErrorResponse, createSuccessResponse, handleDatabaseError } = require('../middleware/errorHandler');
const User = require('../models/User');

// 모든 사용자 조회
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'license', 'avatar', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        return createSuccessResponse(res, users.map(user => user.get({ plain: true })));
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
        const existingUser = await User.findOne({ where: { username } });

        if (existingUser) {
            return createErrorResponse(res, 400, "이미 사용 중인 username입니다.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            id,
            username,
            password: hashedPassword,
            license: 1
        });

        const userData = user.get({ plain: true });
        console.log("생성된 유저:", userData);

        return createSuccessResponse(res, { id: userData.id, username: userData.username }, 201);
    } catch (error) {
        return handleDatabaseError(error, res);
    }
};

// 특정 유저 조회
const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'avatar', 'created_at']
        });

        if (!user) {
            return createErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
        }

        return createSuccessResponse(res, user.get({ plain: true }));
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
        const user = await User.findByPk(id);

        if (!user) {
            return createErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
        }

        const avatarPath = `/uploads/${id}/avatar/${req.file.filename}`;
        await user.update({ avatar: avatarPath });

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