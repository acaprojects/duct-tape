/**
 * Lists 10 upcoming events in the user's calendar.
 */
function listUpcomingEvents() {
  var calendarId = 'place.technology_9dkjn7048d86g0vjj28o6hsspo@group.calendar.google.com';
  var optionalArgs = {
    timeMin: (new Date()).toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 10,
    orderBy: 'startTime'
  };
  var response = Calendar.Events.list(calendarId, optionalArgs);
  var events = response.items;
  var today = new Date();
  var today_events = events.filter(i => {
    var when = i.start.dateTime;
       if (!when) {
           when = i.start.date;
         }
  return new Date(when).setHours(0,0,0,0) === today.setHours(0,0,0,0)
});
  if (today_events.length > 0) {
    for (i = 0; i < today_events.length; i++) {
      var event = today_events[i];
      var when = event.start.dateTime;
      if (!when) {
        when = event.start.date;
      }
      const data = { "text" : event.summary + ' ' + when };

      var options = {
        'method' : 'post',
        'contentType': 'application/json',
        'payload' : JSON.stringify(data)
      };
      UrlFetchApp.fetch('https://chat.googleapis.com/v1/spaces/AAAAI6TUT4E/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Us9fcYcwVrx_5vasJXa1BNxdDmusq9TGkvr7c_7DGtA%3D', options);

      Logger.log('%s (%s)', event.summary, when);
    }
  } else {
    Logger.log('No upcoming events found.');
  }
}