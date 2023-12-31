const Sequelize = require('sequelize')
const booth_db = require('../services/booth-db.service')

const ItemLog = booth_db.define('item_logs', {
  id: { field: 'id', type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  item_id: { field: 'item_id', type: Sequelize.INTEGER },
  data_product_id: { field: 'data_product_id', type: Sequelize.INTEGER, allowNull: true },
  likes: { field: 'likes', type: Sequelize.INTEGER },
  createdAt: { field: 'created_at', type: Sequelize.DATE, },
  updatedAt: { field: 'updated_at', type: Sequelize.DATE, }
}, {
  tableName: 'item_logs'
}, {
  indexes: [
    {
      fields: ['item_id', 'created_at']
    }
  ]
}
)

module.exports = ItemLog