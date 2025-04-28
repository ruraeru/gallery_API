const multer = require("multer");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
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

        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        console.log(ext)
        cb(null, `avatar${ext}`);
    }
});

module.exports = multer({
    storage: storage,
})