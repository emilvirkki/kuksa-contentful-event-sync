const kuksa = require('../kuksa-event-scraper');
const contentful = require('contentful-management');

const TROOP_ID = 9999426;
const SPACE_ID = process.env.SPACE_ID;
const contentfulClient = contentful.createClient({
  accessToken: process.env.CONTENTFUL_TOKEN,
});

(async () => {
  try {
    const eventIds = await getEventIdsFromKuksa();
    for (eventId of eventIds) {
      if (!await eventExistsInContentful(eventId)) {
        const event = await getEventFromKuksa(eventId);
        await createEventInContentful(event);
      }
    }
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();

async function getEventIdsFromKuksa() {
	return await kuksa.getEvents({
    organizer: TROOP_ID,
    dateStart: new Date('2019-06-01'),
  });
}

async function getEventFromKuksa(eventId) {
  return await kuksa.getEventInfo(eventId);
}

async function eventExistsInContentful(eventId) {
  const env = await getContentfulEnv();
  const entries = await env.getEntries({
    'content_type': 'event',
    'fields.kuksaId': eventId,
  });
  return entries.total > 0;
}

async function createEventInContentful(eventInfo) {
  console.log('CREATE EVENT:', eventInfo);
}

async function getContentfulEnv() {
  const space = await contentfulClient.getSpace(SPACE_ID);
  const env = await space.getEnvironment('master');
  return env;
}
