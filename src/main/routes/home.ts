import * as express from 'express'

const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home')
})

module.exports = router
