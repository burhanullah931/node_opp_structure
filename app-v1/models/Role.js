const { Model, Sequelize } = require('sequelize');
const db = require('../../config/database');

class Role extends Model {
  static associate(models) {
    // Role ↔ Users
    this.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });
    // Role ↔ Permissions
    this.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });
  }
}

Role.init(
  {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  },
  {
    sequelize: db.getConnection(),
    modelName: 'Role',
    tableName: 'roles',
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Role;
