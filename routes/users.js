const express = require('express')
const router = express.Router()

const {
  register,
  login,
  confirm,
} = require('../controllers/UserController')

// router.get('/', function (req, res, next) {
//   res.send('respond with a resource')
// })

router.post('/register', register)

router.post('/login', login)

router.get('/confirm/:auth_code/:id', confirm)


module.exports = router
