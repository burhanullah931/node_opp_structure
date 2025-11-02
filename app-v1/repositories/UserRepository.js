const { BaseRepository, dataQuery } = require("./BaseRepository");
const UserModel = require("../models/User");
const RoleModel = require("../models/Role");
const PermissionModel = require("../models/Permission");

class UserRepository extends BaseRepository {
  constructor() {
    super();
    this.limit = 10;
  }

  async findByEmail(email, attrs = undefined) {
    const include = attrs?.include || [
      {
        model: RoleModel,
        as: 'roles',
        through: { attributes: [] },
        include: [{ model: PermissionModel, as: 'permissions', through: { attributes: [] } }],
      },
    ];
    const dq = new dataQuery({ email }, [], [], { ...attrs, include });
    return await this.findOne(UserModel, dq);
  }

  async updateLastLogin(userInstance) {
    userInstance.last_login = new Date();
    await userInstance.save();
    return userInstance;
  }

  async findById(id, attrs = undefined) {
    const include = attrs?.include || [
      {
        model: RoleModel,
        as: 'roles',
        through: { attributes: [] },
        include: [{ model: PermissionModel, as: 'permissions', through: { attributes: [] } }],
      },
    ];
    const dq = new dataQuery({ id }, [], [], { ...attrs, include });
    return await this.findOne(UserModel, dq);
  }
}

module.exports = UserRepository;
