/* eslint-disable camelcase */
// const { Sequelize, Op } = require('sequelize');

const Episode = require('../models/episodeModel');
const Link = require('../models/linkModel');
const Media = require('../models/mediaModel');
const Season = require('../models/seasonModel');
const AppError = require('../utils/appError');
const { getRequest } = require('../utils/model');

const { catchAsync, generateId, filterQuery, updater, mergeString } = require('../utils/utils');
// const QueryFeature = require('../utils/queryFeature');

exports.softAdd = catchAsync(async (req, res, next) => {
  const [imdbId, type] = req.body.imdbId.split(',');
  const { omdb_url_id } = process.env;
  const response = await getRequest(`${omdb_url_id}${imdbId}`, req);

  if (response.Response === 'False') return next(new AppError(`${response.Error} with imdb id ${imdbId}`, 404));

  const oldMedia = await Media.findOne({ where: { imdbId, type: type || response.Type } });
  if (oldMedia) return next(new AppError(`Media (${oldMedia.title}) already exist: ${oldMedia.type} (${imdbId})`, 401));

  const data = {
    imdbId,
    type: type || response.Type,
    title: response.Title,
    year: response.Year === 'N/A' ? null : response.Year,
    rated: response.Rated === 'N/A' ? null : response.Rated,
    released: response.Released === 'N/A' ? undefined : response.Released,
    genre: response.Genre === 'N/A' ? null : response.Genre,
    directors: response.Director === 'N/A' ? null : response.Director,
    writers: response.Writer.length < 500 ? response.Writer : response.Writer.slice(0, 500),
    actors: response.Actor === 'N/A' ? null : response.Actors,
    plot: response.Plot === 'N/A' ? null : response.Plot,
    poster: response.Poster === 'N/A' ? null : response.Poster,
    language: response.Language === 'N/A' ? null : response.Language,
    country: response.Country === 'N/A' ? null : response.Country,
    runtime: response.Runtime === 'N/A' ? null : response.Runtime,
    imdbRating: response.imdbRating === 'N/A' ? null : response.imdbRating,
    totalSeasons: response.totalSeasons === 'N/A' ? null : response.totalSeasons,
    keywords: response.Production && response.Production !== 'N/A' ? response.Production : null,
    collectionType: type === 'collection' ? response.Type : undefined,
  };
  data.id = await generateId(Media);
  data.createdBy = req.user.id;

  // console.log(data);

  const media = await Media.create(data);

  res.status(200).json({
    status: 'success',
    message: 'Media added Softly',
    data: media,
  });
});

//

exports.softUpdate = catchAsync(async (req, res, next) => {
  const { id } = req.body,
    { omdb_url_id } = process.env;

  let media = await Media.findByPk(id);

  const response = await getRequest(`${omdb_url_id}${media.imdbId}`, req);

  if (response.Response === 'False') return next(new AppError(`${response.Error} with imdb id ${media.imdbId}`, 404));

  const data = {
    // type: response.Type,
    title: response.Title,
    year: response.Year === 'N/A' ? null : response.Year,
    rated: response.Rated === 'N/A' ? null : response.Rated,
    released: response.Released === 'N/A' ? undefined : response.Released,
    genre: response.Genre === 'N/A' ? null : response.Genre,
    directors: mergeString(media.directors, response.Director),
    writers: mergeString(media.writers, response.Writer.slice(0, 500)),
    actors: mergeString(media.actors, response.Actors),
    plot: response.Plot === 'N/A' ? null : response.Plot,
    poster: response.Poster === 'N/A' ? null : response.Poster,
    language: response.Language === 'N/A' ? null : response.Language,
    country: response.Country === 'N/A' ? null : response.Country,
    runtime: response.Runtime === 'N/A' ? null : response.Runtime,
    imdbRating: response.imdbRating === 'N/A' ? null : response.imdbRating,
    totalSeasons: response.totalSeasons === 'N/A' ? null : response.totalSeasons,
  };
  data.keywords = [
    ...new Set(
      `${media.keywords || ''},${response.Production || ''}`
        .split(',')
        .filter((word) => word !== 'N/A')
        .map((word) => word.trim())
    ),
  ].join(', ');

  await Media.update(data, { where: { id } });
  media = await Media.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No media updated with that id' : 'Media updated Softly',
    data: media,
  });
});

//

exports.hardAdd = catchAsync(async (req, res, next) => {
  const data = {
    imdbId: req.body.imdbId,
    type: req.body.type,
    title: req.body.title,
    year: req.body.year,
    rated: req.body.rated,
    released: req.body.released,
    genre: req.body.genre,
    directors: req.body.directors,
    writers: req.body.writers,
    actors: req.body.actors,
    plot: req.body.plot,
    poster: req.body.poster,
    language: req.body.language,
    country: req.body.country,
    runtime: req.body.runtime,
    imdbRating: req.body.imdbRating,
    totalSeasons: req.body.totalSeasons,
    keywords: req.body.keywords,
  };

  data.id = await generateId(Media);
  data.createdBy = req.user.id;

  const media = await Media.create(data);

  res.status(200).json({
    status: 'success',
    message: 'Media added',
    data: media,
  });
});

//

exports.hardUpdate = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = {
    imdbId: req.body.imdbId,
    type: req.body.type,
    title: req.body.title,
    year: req.body.year,
    rated: req.body.rated,
    released: req.body.released,
    genre: req.body.genre,
    directors: req.body.directors,
    writers: req.body.writers,
    actors: req.body.actors,
    plot: req.body.plot,
    poster: req.body.poster,
    language: req.body.language,
    country: req.body.country,
    runtime: req.body.runtime,
    imdbRating: req.body.imdbRating,
    totalSeasons: req.body.totalSeasons,
    keywords: req.body.keywords,
    collectionType: req.body.collectionType,
  };

  await Media.update(data, { where: { id } });
  const media = await Media.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No media updated with that id' : 'Media updated',
    data: media,
  });
});

//

exports.about = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Media.update({ about: req.body.about }, { where: { id } });
  const media = await Media.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: 'About media added | updated',
    data: media,
  });
});

//

exports.deleteMedia = catchAsync(async (req, res, next) => {
  const data = await Media.findByPk(req.params.id);
  await Media.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    status: 'success',
    message: `${data.title} is deleted`,
    data,
  });
});

//

exports.allMedia = catchAsync(async (req, res, next) => {
  const data = await filterQuery(Media, req.query);

  res.status(200).json({
    status: 'success',
    ...data,
  });
});

//

exports.singleMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findByPk(req.params.id);

  res.status(200).json({
    status: 'success',
    data: media,
  });
});

//

exports.fullMedia = catchAsync(async (req, res, next) => {
  const data = await Media.findByPk(req.params.id, {
    include: ['Collections', 'CollectionId', 'Seasons', 'Links'],
    order: [
      ['Links', 'resolution', 'ASC'],
      ['Links', 'position', 'ASC'],
      ['Seasons', 'season', 'ASC'],
      ['Collections', 'released', 'DESC'],
    ],
  });

  res.status(200).json({
    status: 'success',
    data,
  });
});

/*











*/

exports.addSeason = catchAsync(async (req, res, next) => {
  const { series, season, released, poster } = req.body;
  const body = { series, season, released, poster };
  body.id = await generateId(Season);
  body.createdBy = req.user.id;

  const data = await Season.create(body);

  res.status(200).json({
    status: 'success',
    message: 'New season added',
    data,
  });
});

//

exports.updateSeason = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { series, season, released, poster } = req.body;

  const body = { series, season, released, poster };

  await Season.update(body, { where: { id } });
  const data = await Season.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No season updated with that id' : 'Season updated',
    data,
  });
});

//

exports.deleteSeason = catchAsync(async (req, res, next) => {
  const data = await Season.findByPk(req.params.id);
  await Season.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    status: 'success',
    message: 'Season deleted from database',
    data,
  });
});

//

exports.singleSeason = catchAsync(async (req, res, next) => {
  const data = await Season.findByPk(req.params.id, {
    include: { model: Episode, include: ['Links'] },
    order: [
      ['Episodes', 'episode', 'ASC'],
      [{ modle: 'Episodes.Link' }, 'resolution', 'ASC'],
      [{ modle: 'Episodes.Link' }, 'position', 'ASC'],
    ],
  });

  res.status(200).json({
    status: 'success',
    data,
  });
});

//

exports.allSeasons = catchAsync(async (req, res, next) => {
  const data = await filterQuery(Season, req.query, 'season');

  res.status(200).json({
    status: 'success',
    length: data.length,
    data,
  });
});

/*












*/

exports.softAddEpisode = catchAsync(async (req, res, next) => {
  const { imdbId, series, season } = req.body,
    { omdb_url_id } = process.env;

  const response = await getRequest(`${omdb_url_id}${imdbId}`, req);

  if (response.Response === 'False') return next(new AppError(`${response.Error} with imdb id ${imdbId}`, 404));

  const data = {
    series,
    season,
    imdbId,
    imdbSeries: response.seriesID,
    episode: response.Episode,
    title: response.Title,
    plot: response.Plot,
    poster: response.Poster,
    runtime: response.Runtime,
    rated: response.Rated,
    imdbRating: response.imdbRating,
    released: response.Released === 'N/A' ? undefined : response.Released,
  };

  data.id = await generateId(Episode);
  data.createdBy = req.user.id;

  const episode = await Episode.create(data);

  updateLastEpisode(series, episode);

  res.status(200).json({
    status: 'success',
    message: 'Episode added',
    data: episode,
  });
});

//

exports.softUpdateEpisode = catchAsync(async (req, res, next) => {
  const { id } = req.body,
    { omdb_url_id } = process.env;

  let episode = await Episode.findByPk(id);

  const response = await getRequest(`${omdb_url_id}${episode.imdbId}`, req);

  if (response.Response === 'False') return next(new AppError(`${response.Error} with imdb id ${episode.imdbId}`, 404));

  const data = {
    imdbSeries: response.seriesID,
    episode: response.Episode,
    title: response.Title,
    plot: response.Plot,
    poster: response.Poster,
    runtime: response.Runtime,
    rated: response.Rated,
    imdbRating: response.imdbRating,
    released: response.Released === 'N/A' ? undefined : response.Released,
  };

  await Episode.update(data, { where: { id } });
  episode = await Episode.findByPk(id);

  updateLastEpisode(episode.series, episode);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No episode updated with that id' : 'Episode updated',
    data: episode,
  });
});

//

exports.hardAddEpisode = catchAsync(async (req, res, next) => {
  const data = {
    series: req.body.series,
    season: req.body.season,
    imdbId: req.body.imdbId,
    imdbSeries: req.body.imdbSeries,
    episode: req.body.episode,
    title: req.body.title,
    plot: req.body.plot,
    poster: req.body.poster,
    runtime: req.body.runtime,
    rated: req.body.rated,
    imdbRating: req.body.imdbRating,
    released: req.body.released,
  };

  data.id = await generateId(Episode);
  data.createdBy = req.user.id;

  const episode = await Episode.create(data);
  updateLastEpisode(episode.series, episode);

  res.status(200).json({
    status: 'success',
    message: 'Episode added',
    data: episode,
  });
});

//

exports.hardUpdateEpisode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const data = {
    imdbId: req.body.imdbId,
    imdbSeries: req.body.imdbSeries,
    episode: req.body.episode,
    title: req.body.title,
    plot: req.body.plot,
    poster: req.body.poster,
    runtime: req.body.runtime,
    rated: req.body.rated,
    imdbRating: req.body.imdbRating,
    released: req.body.released,
  };

  await Episode.update(data, { where: { id } });
  const episode = await Episode.findByPk(id);
  updateLastEpisode(episode.series, episode);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No episode updated with that id' : 'Episode updated',
    data: episode,
  });
});

//

exports.deleteEpisode = catchAsync(async (req, res, next) => {
  const data = await Episode.findByPk(req.params.id);
  await Episode.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    status: 'success',
    message: 'Episode deleted from database',
    data,
  });
});

//

exports.allEpisodes = catchAsync(async (req, res, next) => {
  const episode = await filterQuery(Episode, req.query, 'episode');

  res.status(200).json({
    status: 'success',
    length: episode.length,
    data: episode,
  });
});

//

exports.singleEpisode = catchAsync(async (req, res, next) => {
  const episode = await Episode.findByPk(req.params.id, { include: ['Links'], order: [['Links', 'resolution', 'ASC']] });

  res.status(200).json({
    status: 'success',
    data: episode,
  });
});

//

function updateLastEpisode(series, episode) {
  updater(async () => {
    const { lastEpisodeOn } = await Media.findByPk(series, { attributes: ['lastEpisodeOn'] });
    const lastEpisode = lastEpisodeOn ? new Date(lastEpisodeOn).getTime() : 0;
    const episodeReleased = episode.released ? new Date(episode.released) : 0;

    // console.log(series, lastEpisode, episodeReleased);
    if (lastEpisode >= episodeReleased) return;

    await Media.update({ lastEpisodeOn: episode.released }, { where: { id: series } });
  });
}

/*












*/

exports.addLink = catchAsync(async (req, res, next) => {
  const { filled, media, episode, name, position, resolution, link } = req.body;
  const body = { filled, media, episode, name, position, resolution, link };

  body.createdBy = req.user.id;
  body.id = await generateId(Link);

  const data = await Link.create(body);

  res.status(200).json({
    status: 'success',
    message: `New link added - ${data.name}`,
    data,
  });
});

//

exports.updateLink = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { filled, name, position, resolution, link } = req.body;
  const body = { filled, name, position, resolution, link };

  await Link.update(body, { where: { id } });
  const data = await Link.findByPk(id);

  res.status(200).json({
    status: 'success',
    message: !data ? 'No link updated with that id' : 'Link updated',
    data,
  });
});

//

exports.deleteLink = catchAsync(async (req, res, next) => {
  const data = await Link.findByPk(req.params.id);
  await Link.destroy({ where: { id: req.params.id } });

  res.status(200).json({
    status: 'success',
    message: 'Link deleted from database',
    data,
  });
});

//

exports.allLinks = catchAsync(async (req, res, next) => {
  const data = await filterQuery(Link, req.query, 'link');

  res.status(200).json({
    status: 'success',
    length: data.length,
    data,
  });
});

//

exports.singleLink = catchAsync(async (req, res, next) => {
  const data = await Link.findByPk(req.params.id);

  res.status(200).json({
    status: 'success',
    data,
  });
});

//

exports.collection = catchAsync(async (req, res, next) => {
  const { action, collection, id } = req.body;
  // const { action, collection: collectionId, id } = req.body;

  let message;
  if (action === 'add') await Media.update({ collection }, { where: { id } }), (message = 'Media added to collection');
  if (action === 'remove') await Media.update({ collection: null }, { where: { id } }), (message = 'Media removed from collection');
  // if (action === 'add') await Media.update({ collectionId }, { where: { id } }), (message = 'Media added to collection');
  // if (action === 'remove') await Media.update({ collectionId: null }, { where: { id } }), (message = 'Media removed from collection');

  const data = await Media.findByPk(id);

  res.status(200).json({
    status: 'success',
    message,
    action,
    data,
  });
});
