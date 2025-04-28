const { createErrorResponse, createSuccessResponse, handleDatabaseError } = require('../../middleware/errorHandler');
const userService = require('./userService');
const { IMAGE_TYPE_ERR } = require('../../config/errorCode');

module.exports = {
    // 모든 사용자 조회
    getAllUsers: async (req, res) => {
        try {
            const users = await userService.getAllUsers();
            return createSuccessResponse(res, users);
        } catch (error) {
            return handleDatabaseError(error, res);
        }
    },

    // 사용자 생성
    createUser: async (req, res) => {
        const { id, username, password } = req.body;

        if (!id || !username || !password) {
            return createErrorResponse(res, 400, "id, username, password은 필수 필드입니다.");
        }

        try {
            const userData = await userService.createUser(id, username, password);
            console.log("생성된 유저:", userData);
            return createSuccessResponse(res, userData, 201);
        } catch (error) {
            if (error.message === "E13") {
                return createErrorResponse(res, 400, error.message);
            }
            return handleDatabaseError(error, res);
        }
    },

    // 특정 유저 조회
    getUserByUsername: async (req, res) => {
        const { username } = req.params;

        try {
            const user = await userService.getUserByUsername(username);
            return createSuccessResponse(res, user);
        } catch (error) {
            if (error.message === "E14") {
                return createErrorResponse(res, 404, error.message);
            }
            return handleDatabaseError(error, res);
        }
    },

    // 사용자 avatar 업데이트
    updateUserAvatar: async (req, res) => {
        const { id } = req.params;

        if (!req.file) {
            return createErrorResponse(res, 400, IMAGE_TYPE_ERR.message);
        }

        try {
            const avatarPath = `/uploads/${id}/avatar/${req.file.filename}`;
            const result = await userService.updateUserAvatar(id, avatarPath);
            return createSuccessResponse(res, result);
        } catch (error) {
            if (error.message === "E14") {
                return createErrorResponse(res, 404, error.message);
            }
            return handleDatabaseError(error, res);
        }
    }
};