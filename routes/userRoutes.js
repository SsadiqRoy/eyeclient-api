const express = require('express');

const controller = require('../controllers/userControllers');
const middleware = require('../middlewares/globalMdw');

const router = express.Router();

router.post('/new', controller.addUser);
router.post('/login', controller.login);

router.use(middleware.protect);
router.get('/', controller.users);
router.patch('/', controller.update);
router.patch('/upgrade', controller.upgrade);
router.patch('/password', controller.password);
router.patch('/deactivate', controller.deactivate);
router.patch('/activate', controller.activate);
router.get('/:id', controller.single);
router.delete('/:id', controller.deleteUser);

module.exports = router;
