import { Router } from 'express';
import metalogger from 'metalogger';
import _spieler   from 'spieler';

import actions from './actions.js';

const { spieler, check, matchedData, sanitize } = _spieler();

const router = Router({ mergeParams: true });
const log    = metalogger();

const addUserValidator = spieler([
  check('email').exists().withMessage('email must be provided')
    .isEmail().withMessage('email format is invalid')
    .trim().normalizeEmail(),

  check('password', 'passwords must be at least 5 chars long and contain one number')
    .exists()
    .isLength({ min: 5 })
    .matches(/\d/)
]);

router.get('/', actions.getUsers);
router.post('/', addUserValidator, actions.addUser);

export default router;
