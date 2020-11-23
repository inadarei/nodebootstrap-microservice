const router = require('express').Router({ mergeParams: true })
    , config = require("config")
    , path   = require("path");

module.exports = router;

router.get('/', function(req, res) {

  const context = {};
  context.layout = null;

  context.title = "API Response Home Document";
  context.external_api_url = "http://api.froyo.io";

  context.base_url = config.app.base_url || req.protocol + "://" + req.headers.host;

  const template = path.join(__dirname,'/views/homedoc');

  res.set('Content-Type', 'application/vnd.uber+json');

  return res.status(200).render(template, context);

});
