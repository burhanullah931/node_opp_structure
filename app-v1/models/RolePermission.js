const { Model, Sequelize } = require('sequelize');
const db = require('../../config/database');

class RolePermission extends Model {}

RolePermission.init(
  {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    role_id: { type: Sequelize.INTEGER, allowNull: false },
    permission_id: { type: Sequelize.INTEGER, allowNull: false },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  },
  {
    sequelize: db.getConnection(),
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = RolePermission;

