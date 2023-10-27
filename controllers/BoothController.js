const moment = require('moment')
const Redis = require('ioredis');
const sequelize = require('../services/booth-db.service')
const { Sequelize, Op } = require('sequelize')
const { BoothItem, ItemLog } = require('../models/index')
const bc = require('./batch/updateGetTopItem')

const client = new Redis({
    host: 'redis',
    port: 6379
});

// router.get('/get', function (req, res, next) {
//   res.send('respond with a resource')
// })

const getOne = async (req, res, next) => {
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
}

const getTopItems = async (req, res, next) => {
    try {
        const cachedResult = await new Promise((resolve, reject) => {
            client.get('topItemsCache', (err, reply) => {
                if (err) reject(err)
                resolve(reply)
            })
        })

        if (cachedResult) {
            return res.status(200).send(JSON.parse(cachedResult))
        }
        
        const result = await bc.getTopItemsData()
        res.status(200).send(result)
    } catch (err) {
        res.status(500).send(err)
    }
}

const getWeekSummary = async (req, res, next) => {
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
}

const getItemLikes = async (req, res, next) => {
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
}

const getItemLogs = async (req, res, next) => {
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
}

const getIntervalItemLogs = async (req, res, next) => {
    try {
        const item_id = req.query.item_id
        const interval = req.query.interval // interval in minutes

        const itemLogs = await ItemLog.findAll({
            where: { data_product_id: item_id },
            order: [['createdAt', 'ASC']]
        })

        const filteredLogs = [];
        let currentTime = new Date(itemLogs[0].createdAt);
        currentTime.setSeconds(0, 0);
        filteredLogs.push(itemLogs[0]);

        for (const log of itemLogs.slice(1)) {
            const logTime = new Date(log.createdAt);
            logTime.setSeconds(0, 0);

            const diffMinutes = (logTime - currentTime) / (1000 * 60);

            if (diffMinutes >= interval) {
                filteredLogs.push(log);
                currentTime = logTime;
            }
        }

        res.status(200).send(filteredLogs)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}



const getAllSummary = async (req, res, next) => {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    try {
        if (!startDate || !endDate) {
            const result = await sequelize.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM boothitems
      GROUP BY date
      ORDER BY date
    `, { type: Sequelize.QueryTypes.SELECT });

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
}


module.exports = {
    getOne,
    getTopItems,
    getWeekSummary,
    getItemLikes,
    getItemLogs,
    getAllSummary,
    getIntervalItemLogs,
}