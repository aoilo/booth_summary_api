const express = require('express')
const router = express.Router()

const bcryptService = require('../services/bcrypt.service')
const authService = require('../services/auth.service')
const User = require('../models/User')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.post('/register', async (req, res, next) => {
  try {
    console.log(req.body)
    const { body } = req
    // const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const userResult = await User.findOne({
      where: {
        username: body.username,
      }
    })
    if (userResult) {
      return res.status(400).json({ msg: 'すでにそのユーザー名は使用されています。' })
    }
    const user = await User.create({
      username: body.username,
      password: body.password,
    })
    res.status(201).json({ user: user.id })
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username && password) {
      const userResult = await User.findOne({
        where: {
          username,
        },
      })
      if (userResult == null) {
        return res.status(400).json({ msg: 'Bad Request: User not found' })
      }
      if (bcryptService().comparePassword(password, userResult.password)) {
        const token = authService().issue({ id: userResult.id })
        return res.status(200).json({ token })
      }
    }
    return res.status(401).json({ msg: 'usernameとpasswordを入力してください。' })
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
