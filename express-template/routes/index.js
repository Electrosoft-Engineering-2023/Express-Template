var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('analytics', { title: 'Analytics Template', layout: './layouts/full-width' })
});



module.exports = router;
