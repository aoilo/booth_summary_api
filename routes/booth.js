const express = require('express')
const moment = require('moment')
const sequelize = require('../services/booth-db.service')
const router = express.Router()
const authenticate = require('../services/authenticate')
const { BoothItem, ItemLog } = require('../models/index');

// router.get('/get', function (req, res, next) {
//   res.send('respond with a resource')
// })

router.get('/getOne', authenticate, async (req, res, next) => {
  try {
    const item = await BoothItem.findOne({
      where:{
        data_product_id: req.query.data_product_id,
      }
    })
    res.status(200).send(item)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/getTopItems', authenticate, async (req, res, next) => {
  const oneWeekAgo = moment().subtract(7, 'days').toDate()
  try {
    const result = await sequelize.query(`
      SELECT il.*, bi.*
      FROM item_logs as il
      INNER JOIN (
        SELECT MAX(id) as id
        FROM item_logs
        WHERE created_at >= :oneWeekAgo
        GROUP BY item_id
      ) as filter_il ON filter_il.id = il.id
      LEFT JOIN boothitems as bi ON il.item_id = bi.id
      ORDER BY il.\`like\` DESC
      LIMIT :limit
    `, {
      replacements: {
        oneWeekAgo,
        limit: parseInt(req.query.limit),
      },
      type: sequelize.QueryTypes.SELECT
    });
    res.status(200).send(result)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
