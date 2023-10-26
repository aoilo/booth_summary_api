const Sequelize = require('sequelize')
const booth_api_db = require('../services/api-db.service')
const bcryptService = require('../services/bcrypt.service')

const hooks = {
    beforeCreate(user) {
      user.password = bcryptService().password(user) // eslint-disable-line no-param-reassign
    },
  }

const User = booth_api_db.define('users', {
  id            : { field: 'id',             type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true         },
  username      : { field: 'username',       type: Sequelize.STRING,  unique: { msg: 'this id is already used' },   },
  password      : { field: 'password',       type: Sequelize.STRING,                                                },
  email         : { field: 'email',          type: Sequelize.STRING,  unique: { msg: 'this mail is already used' }, },
  auth_code     : { field: 'auth_code',      type: Sequelize.STRING,                                                },
  is_authorized : { field: 'is_authorized',  type: Sequelize.INTEGER,                                               },
  createdAt     : { field: 'created_at',     type: Sequelize.DATE,                                                  },
  updatedAt     : { field: 'updated_at',     type: Sequelize.DATE,                                                  }
}, { hooks })

module.exports = User