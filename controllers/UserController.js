const path = require('path')
const ENV_PATH = path.join(__dirname, '../.env')
require('dotenv').config({path: ENV_PATH})
const aes = require('../services/aes.service')
const bcryptService = require('../services/bcrypt.service')
const authService = require('../services/auth.service')
const crypto = require("crypto")
const mailService = require('../services/mail.service')
const User = require('../models/User')

const register = async (req, res, next) => {
    try {
        const { body } = req
        const emailResult = await User.findOne({
          where: {
            email: body.email,
          }
        })
        if (emailResult) {
          return res.status(400).json({ msg: 'すでにそのメールアドレスは使用されています。' })
        }
        const userResult = await User.findOne({
          where: {
            username: body.username,
          }
        })
        if (userResult) {
          return res.status(400).json({ msg: 'すでにそのユーザー名は使用されています。' })
        }

        let auth_code = crypto.randomBytes(64).toString('hex')

        const user = await User.create({
          username: body.username,
          email: body.email,
          password: body.password,
          auth_code: auth_code,
        })

        data = aes.encrypt(user.id.toString())
        let subject = 'メールアドレス認証 (Booth Summary)'
        let text = 'メールアドレスを確認してください'
        let html = `<p>以下のリンクからアカウントの確認を行ってください｡</p><br>
        <a href="${process.env.DOMAIN}/users/confirm/${auth_code}/${data}">アカウントを確認</a>`;

        mailService(body.email, subject, text, html)

        res.status(201).json({ user: user.id })
    } catch (err) {
        res.status(500).send(err)
    }
}

const login = async(req, res, next) => {
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
        if (!(userResult.is_authorized == 1)) {
          return res.status(400).json({ msg: 'メールアドレスが確認されていません' })
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
}

const confirm = async (req, res) => {
  const { auth_code, id } = req.params
  decrypt_id = aes.decrypt(id)
  try {
    const user = await User.findOne({
      where: {
        id: decrypt_id,
      }
    })
    if(!user) {
      return res.status(400).json({ msg: 'Bad Request: Model not found' })
    }

    if(user.auth_code === auth_code) {
      const updatedModel = await user.update({
        is_authorized: 1,
      })
      return res.sendFile(path.resolve(__dirname + '/../public/confirm.html'))
    } else {
    return res.status(401).json({ msg: 'Unauthenticated' })
    }
  } catch (err) {
      console.log(err)
    return res.status(500).json({ msg: 'Internal server error' })
  }
}

module.exports = {
    register,
    login,
    confirm
}