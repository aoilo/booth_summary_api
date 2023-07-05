const Sequelize = require('sequelize')
const booth_db = require('../services/booth-db.service')

const BoothItem = booth_db.define('boothitems', {
  id       : { field: 'id'        , type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  data_product_id : { field: 'data_product_id' , type: Sequelize.INTEGER, allowNull: true                      },
  name : { field: 'name'   , type: Sequelize.TEXT                                         },
  shop_name : { field: 'shop_name' , type: Sequelize.STRING, allowNull: true                      },
  data_product_category : { field: 'data_product_category' , type: Sequelize.INTEGER, allowNull: true                      },
  url : { field: 'url'   , type: Sequelize.TEXT                                         },
  img : { field: 'img'   , type: Sequelize.TEXT                                         },
  createdAt: { field: 'created_at', type: Sequelize.DATE,                                                },
  updatedAt: { field: 'updated_at', type: Sequelize.DATE,                                               }
}, {
    tableName: 'boothitems'
})

module.exports = BoothItem