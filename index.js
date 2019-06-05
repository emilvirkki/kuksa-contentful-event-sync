const kuksa = require('../kuksa-event-scraper');

const TROOP_ID = 9999426;

(async () => {
  try {
    const eventIds = await kuksa.getEvents({
      organizer: TROOP_ID,
      dateStart: new Date(),
    });

    console.log(eventIds);
  } catch(e) {
    console.error(e);
  }
})();
