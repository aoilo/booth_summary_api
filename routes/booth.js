const express = require('express')
const moment = require('moment')
const sequelize = require('../services/booth-db.service')
const { Sequelize, Op } = require('sequelize')
const _ = require('lodash')
const router = express.Router()
const authenticate = require('../services/authenticate')
const { BoothItem, ItemLog } = require('../models/index')

// router.get('/get', function (req, res, next) {
//   res.send('respond with a resource')
// })

router.get('/getOne', authenticate, async (req, res, next) => {
  try {
    const item = await BoothItem.findOne({
      where: {
        data_product_id: req.query.data_product_id,
      }
    })
    res.status(200).send(item)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/getTopItems', authenticate, async (req, res, next) => {
  try {
    //　表示数指定　指定がない場合5件とする
    const limit = parseInt(req.query.limit) || 5

    // ７日前の日付を格納
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const result = await sequelize.query(`
      SELECT boothitems.*, item_logs.likes
      FROM boothitems
      JOIN (
        SELECT item_id, likes, created_at
        FROM item_logs
        WHERE (item_id, created_at) IN (
          SELECT item_id, MAX(created_at)
          FROM item_logs
          GROUP BY item_id
        )
      ) as item_logs
      ON boothitems.id = item_logs.item_id
      WHERE boothitems.created_at >= :oneWeekAgo
      ORDER BY item_logs.likes DESC
      LIMIT :limit;
    `, {
      replacements: { limit: limit, oneWeekAgo: oneWeekAgo },
      type: sequelize.QueryTypes.SELECT
    });
    res.status(200).send(result)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/getWeekSummary', authenticate, async (req, res, next) => {
  try {
    moment.locale('ja')  // 日本語に設定
    const oneWeekAgo = moment().subtract(7, 'days').startOf('day').toDate()
    const today = moment().endOf('day').toDate()
    const result = []

    for (let m = moment(oneWeekAgo); m.isBefore(today); m.add(1, 'days')) {
      const dayStart = m.clone().startOf('day').toDate()
      const dayEnd = m.clone().endOf('day').toDate()
      const count = await BoothItem.count({
        where: {
          createdAt: {
            [Op.gte]: dayStart,
            [Op.lt]: dayEnd,
          },
        },
      });
      // moment.locale('ja');  // 日本語に設定
      // const dayOfWeek = m.format('dddd'); 

      result.push({ date: m.format('YYYY-MM-DD'), dayOfWeek: m.format('dddd'), count })
    }
    // res.json(result);
    res.status(200).send(result)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/getItemLikes', authenticate, async (req, res, next) => {
  try {
    const item_id = req.query.item_id
    const itemLog = await ItemLog.findOne({
      where: { data_product_id: item_id },
      order: [['createdAt', 'DESC']]
    })
    res.status(200).send(itemLog)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/getItemLogs', authenticate, async (req, res, next) => {
  try {
    const item_id = req.query.item_id
    const itemLogs = await ItemLog.findAll({
      where: { data_product_id: item_id },
      order: [['createdAt', 'ASC']]
    })
    res.status(200).send(itemLogs)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

router.get('/getAllSummary', async (req, res, next) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  try {
    if (!startDate || !endDate) {
      const result = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM boothitems
      GROUP BY date
      ORDER BY date
    `, { type: Sequelize.QueryTypes.SELECT});
      
      return res.status(200).send(result);
    }

    const result = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM boothitems
      WHERE created_at >= :startDate AND created_at < :endDate
      GROUP BY date
      ORDER BY date
    `, 
    { 
      replacements: { startDate: startDate, endDate: endDate },
      type: Sequelize.QueryTypes.SELECT
    })

    res.status(200).send(result)
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})


module.exports = router