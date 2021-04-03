const Sequelize = require('sequelize')
const db = require('../database/db.js')

module.exports = db.sequelize.define(
  'user_details',
  {
    user_name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    is_active:{
      type:Sequelize.BOOLEAN
    },
    verified:{
      type:Sequelize.BOOLEAN
    },
  },
  {
    timestamps: false
  }
)