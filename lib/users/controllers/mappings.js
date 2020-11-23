const {spieler, check, matchedData, sanitize} = require('spieler')();

const router      = require('express').Router({ mergeParams: true });
const actions     = require('./actions');

const log = require("metalogger")();

const addUserValidator = spieler([
  check("email").exists().withMessage('email must be provided')
  .isEmail().withMessage('email format is invalid')
  .trim().normalizeEmail(),

  check('password', 'passwords must be at least 5 chars long and contain one number')
  .exists()
  .isLength({ min: 5 })
  .matches(/\d/)
]);

router.get('/', actions.getUsers);
router.post('/', addUserValidator, actions.addUser);

module.exports = router;
