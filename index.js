/*
TODO for the future:
- transforming the description to markdown (they don't seem to be used much)
*/

require('dotenv').config();

const kuksa = require('kuksa-event-scraper');
const contentful = require('contentful-management');
const slugify = require('slugify');

const TROOP_ID = process.env.TROOP_ID;
const SPACE_ID = process.env.SPACE_ID;
const contentfulClient = contentful.createClient({
  accessToken: process.env.CONTENTFUL_TOKEN,
});

(async () => {
  try {
    console.log('Syncing events from Kuksa...');
    const eventIds = await getEventIdsFromKuksa();
    for (eventId of eventIds) {
      if (await eventExistsInContentful(eventId)) {
        console.log(`- Event #${eventId} already exists`);
      } else {
        console.log(`- Event #${eventId} is a NEW EVENT, creating...`);
        const event = await getEventFromKuksa(eventId);
        await createEventInContentful(event);
        console.log(`--> Event "${event.name}" created!`);
      }
    }
    console.log('Event sync COMPLETE')
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
  // Wraps the value in a localisation object required by Contentful
  function val(content) {
    return {
      'fi-FI': content,
    }
  }

  const env = await getContentfulEnv();
  const entry = await env.createEntry('event', {
    fields: {
      title: val(eventInfo.name),
      // add id to avoid duplicates
      slug: val(`${eventInfo.id}-${slugify(eventInfo.name)}`),
      datetimeStart: val(eventInfo.dateTimeStarts),
      datetimeEnd: val(eventInfo.dateTimeEnds),
      content: val(eventInfo.descriptionText),
      registrationLink: val(getRegistrationLink(eventInfo)),
      kuksaId: val(eventInfo.id),
    }
  });
  await entry.publish();
}

function getRegistrationLink(eventInfo) {
  // Heuristic: if there's and ending time for the registration, there's a registration
  if(eventInfo.registrationEnds) {
    return `https://kuksa.partio.fi/Kotisivut/tilaisuus_tiedot.aspx?TIAId=${eventInfo.id}`;
  }
  return null;
}

async function getContentfulEnv() {
  const space = await contentfulClient.getSpace(SPACE_ID);
  const env = await space.getEnvironment('master');
  return env;
}
