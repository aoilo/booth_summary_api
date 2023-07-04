const express = require('express')
const router = express.Router()
const authenticate = require('../services/authenticate')

const BoothItem = require('../models/BoothItem')

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


module.exports = router
