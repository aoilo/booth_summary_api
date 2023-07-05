const express = require('express')
const moment = require('moment')
const { Op } = require('sequelize')
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
    const items = await ItemLog.findAll({
      where: {
        created_at: {
          [Op.gte]: oneWeekAgo
        }
      },
      order: [
        ['like', 'DESC']
      ],
      limit: parseInt(req.query.limit),
      include: [BoothItem],
    })
    res.status(200).send(items)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
