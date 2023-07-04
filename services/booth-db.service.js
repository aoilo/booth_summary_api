const { Sequelize } = require('sequelize')
const path = require('path')
const ENV_PATH = path.join(__dirname, '../.env');
require('dotenv').config({path: ENV_PATH});
// require('dotenv').config()

const booth_db = new Sequelize(process.env.DB2_NAME, process.env.DB2_USER, process.env.DB2_PASS, {
  host: process.env.DB2_HOST,
  port: process.env.DB2_PORT,
  dialect: 'mysql',
  timezone:'+09:00'
});

module.exports = booth_db