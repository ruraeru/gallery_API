// 에러 응답 생성 함수
const createErrorResponse = (res, status, message) => {
    return res.status(status).json({
        success: false,
        error: message
    });
};

const successResponse = (res, data, status = 200) => {
    return res.status(status).json({
        success: true,
        data
    });
}

// 성공 응답 생성 함수
const createSuccessResponse = (res, data, status = 200) => {
    return res.status(status).json({
        success: true,
        data
    });
};

// 데이터베이스 에러 처리
const handleDatabaseError = (error, res) => {
    console.error("데이터베이스 에러:", error);

    if (error.code === "ER_DUP_ENTRY") {
        return createErrorResponse(res, 400, "E13");
    }

    return createErrorResponse(res, 500, error.message);
};

// 파일 업로드 에러 처리
const handleFileUploadError = (error, res) => {
    console.error("파일 업로드 에러:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
        return createErrorResponse(res, 400, "FILE_SIZE_ERR");
    }

    return createErrorResponse(res, 500, error.message);
};

module.exports = {
    successResponse,
    createErrorResponse,
    createSuccessResponse,
    handleDatabaseError,
    handleFileUploadError
}; 