// dbRelation: import models and call their static associate(models)

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');

function dbRelation() {
  const models = { User, Role, Permission, UserRole, RolePermission };
  if (typeof User.associate === 'function') User.associate(models);
  if (typeof Role.associate === 'function') Role.associate(models);
  if (typeof Permission.associate === 'function') Permission.associate(models);
}

module.exports = dbRelation;

