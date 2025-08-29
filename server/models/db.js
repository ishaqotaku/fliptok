const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB || 'videoShareDb';
const usersContainerId = process.env.COSMOS_CONTAINER_USERS || 'users';
const videosContainerId = process.env.COSMOS_CONTAINER_VIDEOS || 'videos';

if (!endpoint || !key) {
  console.warn('COSMOS_ENDPOINT or COSMOS_KEY not set. Database functions will fail until configured.');
}

const client = new CosmosClient({ endpoint, key });

async function getContainers() {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container: usersContainer } = await database.containers.createIfNotExists({ id: usersContainerId, partitionKey: { kind: 'Hash', paths: ['/id'] } });
  const { container: videosContainer } = await database.containers.createIfNotExists({ id: videosContainerId, partitionKey: { kind: 'Hash', paths: ['/id'] } });
  return { usersContainer, videosContainer };
}

async function createUser(user) {
  const { usersContainer } = await getContainers();
  const { resource } = await usersContainer.items.create(user);
  return resource;
}

async function findUserByEmail(email) {
  const { usersContainer } = await getContainers();
  const querySpec = { query: 'SELECT * FROM c WHERE c.email = @email', parameters: [{ name: '@email', value: email }] };
  const { resources } = await usersContainer.items.query(querySpec).fetchAll();
  return resources[0];
}

async function createVideo(video) {
  const { videosContainer } = await getContainers();
  const { resource } = await videosContainer.items.create(video);
  return resource;
}

async function listVideos(q) {
  const { videosContainer } = await getContainers();
  let query = 'SELECT * FROM c ORDER BY c._ts DESC';
  const parameters = [];
  if (q) {
    query = 'SELECT * FROM c WHERE CONTAINS(LOWER(c.title), @q) OR CONTAINS(LOWER(c.genre), @q) OR CONTAINS(LOWER(c.publisher), @q) ORDER BY c._ts DESC';
    parameters.push({ name: '@q', value: q.toLowerCase() });
  }
  const { resources } = await videosContainer.items.query({ query, parameters }).fetchAll();
  return resources;
}

async function getVideoById(id) {
  const { videosContainer } = await getContainers();
  try {
    const { resource } = await videosContainer.item(id, id).read();
    return resource;
  } catch (e) {
    return null;
  }
}

async function updateVideo(id, patch) {
  const { videosContainer } = await getContainers();
  const { resource } = await videosContainer.items.upsert({ id, ...patch });
  return resource;
}

async function addCommentToVideo(id, comment) {
  const video = await getVideoById(id);
  if (!video) throw new Error('Video not found');
  video.comments = video.comments || [];
  video.comments.push(comment);
  const { videosContainer } = await getContainers();
  const { resource } = await videosContainer.items.upsert(video);
  return resource;
}

async function addRatingToVideo(id, ratingObj) {
  const video = await getVideoById(id);
  if (!video) throw new Error('Video not found');

  video.ratings = video.ratings || [];
  console.log(video);
  console.log(ratingObj);

  // Check if the user has already rated the video
  const existingRatingIndex = video.ratings.findIndex(r => r.userId === ratingObj.userId);

  if (existingRatingIndex >= 0) {
    // Update existing rating
    video.ratings[existingRatingIndex].rating = ratingObj.rating;
  } else {
    // Add new rating
    video.ratings.push(ratingObj);
  }

  // Recalculate average rating
  video.avgRating = video.ratings.reduce((sum, r) => sum + r.rating, 0) / video.ratings.length;

  const { videosContainer } = await getContainers();
  const { resource } = await videosContainer.items.upsert(video);
  return resource;
}

module.exports = {
  createUser,
  findUserByEmail,
  createVideo,
  listVideos,
  getVideoById,
  addCommentToVideo,
  addRatingToVideo,
};