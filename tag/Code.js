var scriptProperties = PropertiesService.getScriptProperties();

var SCOPE = 'https://www.googleapis.com/auth/chat.bot';
var SERVICE_ACCOUNT_PRIVATE_KEY = scriptProperties.getProperty("SERVICE_ACCOUNT_PRIVATE_KEY");
var SERVICE_ACCOUNT_EMAIL = scriptProperties.getProperty("SERVICE_ACCOUNT_EMAIL");

/**
 * Gets the contents of a chat API resource.
 */
function query(resource) {
  var service = OAuth2.createService('chat')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setPrivateKey(SERVICE_ACCOUNT_PRIVATE_KEY)
    .setClientId(SERVICE_ACCOUNT_EMAIL)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope(SCOPE);
  if (!service.hasAccess()) {
    Logger.log('Authentication error: %s', service.getLastError());
    return;
  }

  var url = 'https://chat.googleapis.com/v1/' + resource;

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'Authorization': 'Bearer ' + service.getAccessToken() },
    contentType: 'application/json'
  });

  return JSON.parse(response.getContentText());
}

/**
 * Get a list of all users that are memebers of a space.
 */
function getMembers(spaceId) {
  return query(spaceId + '/members')
    .memberships
    .filter(function(x) { return x.state == 'JOINED' })
    .map(function(x) { return x.member.name});
}

/**
 * Event handler for incoming mentions.
 */
function onMessage(event) {
  var users = null;

  switch(event.message.argumentText.trim().toLowerCase()) {
    case 'here':
      users = getMembers(event.space.name);
      break;
    default:
      return { "text": "Unrecognized tag group :(" };
  }

  var message = users.map(function(user) { return '<' + user + '>' }).join(' ');

  return { "text": message };
}
