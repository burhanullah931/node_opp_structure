const { Model, Sequelize } = require('sequelize');
const db = require('../../config/database');

class UserRole extends Model {}

UserRole.init(
  {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    role_id: { type: Sequelize.INTEGER, allowNull: false },
    createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  },
  {
    sequelize: db.getConnection(),
    modelName: 'UserRole',
    tableName: 'user_roles',
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = UserRole;

