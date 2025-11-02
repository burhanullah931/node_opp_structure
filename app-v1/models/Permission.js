const { Model, Sequelize } = require('sequelize');
const db = require('../../config/database');

class Permission extends Model {
  static associate(models) {
    // Permission ↔ Roles
    this.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles',
    });
  }
}

Permission.init(
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
    modelName: 'Permission',
    tableName: 'permissions',
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Permission;
