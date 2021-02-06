import config     from 'config';
import { Router } from 'express';
import Path       from 'path';

const __dirname = Path.dirname(new URL(import.meta.url).pathname);

const router = Router({ mergeParams: true });

router.get('/', function (req, res) {

  const context  = {};
  context.layout = null;

  context.title            = 'API Response Home Document';
  context.external_api_url = 'http://api.froyo.io';

  context.base_url = config.app.base_url || req.protocol + '://' + req.headers.host;

  const template = Path.join(__dirname, '/views/homedoc');

  res.set('Content-Type', 'application/vnd.uber+json');

  return res.status(200).render(template, context);
});

export default router;
