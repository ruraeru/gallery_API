const bcrypt = require('bcrypt');
const User = require('../../models/users/Users');

module.exports = {
    // 모든 사용자 조회
    getAllUsers: async () => {
        const users = await User.findAll({
            attributes: ['id', 'username', 'license', 'avatar', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        return users.map(user => user.get({ plain: true }));
    },

    // 사용자 생성
    createUser: async (id, username, password) => {
        const existingUser = await User.findOne({ where: { username } });

        if (existingUser) {
            throw new Error("이미 사용 중인 username입니다.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            id,
            username,
            password: hashedPassword,
            license: 1
        });

        const userData = user.get({ plain: true });
        return { id: userData.id, username: userData.username };
    },

    // 특정 유저 조회
    getUserByUsername: async (username) => {
        const user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'avatar', 'created_at']
        });

        if (!user) {
            throw new Error("사용자를 찾을 수 없습니다.");
        }

        return user.get({ plain: true });
    },

    // 사용자 avatar 업데이트
    updateUserAvatar: async (id, avatarPath) => {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error("사용자를 찾을 수 없습니다.");
        }

        await user.update({ avatar: avatarPath });
        return { id, avatar: avatarPath };
    }
};
