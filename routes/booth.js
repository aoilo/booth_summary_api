const express = require('express')
const router = express.Router()
const authenticate = require('../services/authenticate')

const {
	getOne,
	getTopItems,
	getWeekSummary,
	getItemLikes,
	getItemLogs,
	getAllSummary,
	getIntervalItemLogs
} = require('../controllers/BoothController')

router.get('/getOne', authenticate, getOne)

router.get('/getTopItems', authenticate, getTopItems)

router.get('/getWeekSummary', authenticate, getWeekSummary)

router.get('/getItemLikes', authenticate, getItemLikes)

router.get('/getItemLogs', authenticate, getItemLogs)

router.get('/getIntervalItemLogs', authenticate, getIntervalItemLogs)

router.get('/getAllSummary', authenticate, getAllSummary)


module.exports = router