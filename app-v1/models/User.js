const {
    Model,
    DataTypes,
    Sequelize
  } = require('sequelize');
  const db = require('./../../config/database');

  
  class User extends Model {
    static associate(models) {
      // Define only user-side relations here via passed models
      // Many-to-many: User ↔ Role through user_roles
      this.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles',
      });
    }
  }
  
  User.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: {
        args: true,
        msg: "Email Already Exist"
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    role: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true
    },
    contact_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    profile_photo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    contact_number: {
      type: Sequelize.STRING,
      allowNull: true
    },
    password_reset: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    disable_reason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    disabled_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM(
        'active',
        'inactive'
      ),
      defaultValue: 'active'
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
      
  }, {
    sequelize: db.getConnection(),
    modelName: 'User',
    tableName: 'users',
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  
    hooks: {
     
    }
  });

  
  module.exports = User;
