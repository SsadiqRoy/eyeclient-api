const express = require('express');

const controller = require('../controllers/mediaControllers');
const middleware = require('../middlewares/globalMdw');

const router = express.Router();

router.get('/', controller.allMedia);
router.get('/single/:id', controller.singleMedia);
router.get('/full/:id', controller.fullMedia);

router.get('/season', controller.allSeasons);
router.get('/season/:id', controller.singleSeason);

router.get('/episode', controller.allEpisodes);
router.get('/episode/:id', controller.singleEpisode);

router.get('/link', controller.allLinks);
router.get('/link/:id', controller.singleLink);

// Protected section
router.use(middleware.protect);
router.post('/soft', controller.softAdd);
router.patch('/soft', controller.softUpdate);
router.post('/hard', controller.hardAdd);
router.patch('/hard/:id', controller.hardUpdate);
router.patch('/about/:id', controller.about);
router.delete('/single/:id', controller.deleteMedia);

router.post('/season', controller.addSeason);
router.patch('/season/:id', controller.updateSeason);
router.delete('/season/:id', controller.deleteSeason);

router.post('/episode/soft', controller.softAddEpisode);
router.patch('/episode/soft', controller.softUpdateEpisode);
router.post('/episode/hard', controller.hardAddEpisode);
router.patch('/episode/hard/:id', controller.hardUpdateEpisode);
router.delete('/episode/:id', controller.deleteEpisode);

router.post('/link', controller.addLink);
router.patch('/link/:id', controller.updateLink);
router.delete('/link/:id', controller.deleteLink);

router.patch('/collection', controller.collection);

module.exports = router;
