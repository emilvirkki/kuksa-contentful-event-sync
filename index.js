const kuksa = require('../kuksa-event-scraper');

const TROOP_ID = 9999426;

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
  return false;
}

async function createEventInContentful(eventInfo) {
  console.log('CREATE EVENT:', eventInfo);
}
