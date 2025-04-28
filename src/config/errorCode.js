module.exports = {
    // Auth Errors
    E01: { message: "not have token" },
    E02: { message: "expired token" },
    E03: { message: "invalid token" },
    E04: { message: "not have authority" },

    // Tool Errors
    E05: { message: "can not rental this tool" },
    E06: { message: "check server" },
    E07: { message: "can not find this tool" },

    // User Errors
    E08: { message: "can not find this user" },
    E09: { message: "can not find the department`s tool" },
    E10: { message: "this password equeals last password" },
    E11: { message: "not exist image of tool" },
    E12: { message: "not exist the department`s log" },
    E13: { message: "이미 사용 중인 username입니다." },
    E14: { message: "사용자를 찾을 수 없습니다." },

    // File Upload Errors
    IMAGE_TYPE_ERR: { message: '이미지 파일만 업로드 가능합니다!' },
    FILE_SIZE_ERR: { message: '파일 크기는 5MB를 초과할 수 없습니다.' }
}
