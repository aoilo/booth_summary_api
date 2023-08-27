const path = require('path')
const ENV_PATH = path.join(__dirname, '../.env')
require('dotenv').config({path: ENV_PATH})
const nodemailer = require("nodemailer")

// メール送信機能作成
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.MAIL_PASS,
  }
})

// Gmailからメール送信
async function mailService(to, subject, text, html) {
  // 送信情報設定
  let message = {
    from: `'${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>'`,
    to: to,
    subject: subject,
    text: text,
    html: html
  }
  // メール送信
  transporter.sendMail(message, (error, info) => {
    if (error) {
        return process.exit(1)
    }
    transporter.close()
  })
}

module.exports = mailService