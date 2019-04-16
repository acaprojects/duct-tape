/**
 * GChat bot for filling in missing functionality around
 * scoped @mentions.
 *
 * Adds support for `@tag here` for notifing all people
 * who are part of the current channel.
 */
let scriptProperties = PropertiesService.getScriptProperties()

const TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'
const SCOPE = 'https://www.googleapis.com/auth/chat.bot'

let SERVICE_ACCOUNT_PRIVATE_KEY = scriptProperties.getProperty('SERVICE_ACCOUNT_PRIVATE_KEY')
let SERVICE_ACCOUNT_EMAIL = scriptProperties.getProperty('SERVICE_ACCOUNT_EMAIL')

/**
 * Gets an access token for interacting with the chat API.
 */
function getAccessToken() {
  let service = OAuth2.createService('chat')
    .setTokenUrl(TOKEN_URL)
    .setPrivateKey(SERVICE_ACCOUNT_PRIVATE_KEY)
    .setClientId(SERVICE_ACCOUNT_EMAIL)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope(SCOPE)

  if (!service.hasAccess()) {
    Logger.log('Authentication error: %s', service.getLastError())
    return
  }

  return service.getAccessToken()
}

/**
 * Gets the contents of a chat API resource.
 */
function query(resource) {
  let url = `https://chat.googleapis.com/v1/${resource}`
  let token = getAccessToken()

  let response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { 'Authorization': `Bearer ${token}` },
    contentType: 'application/json'
  })

  return JSON.parse(response.getContentText())
}

/**
 * Get a list of all users that are memebers of a space.
 */
function getMembers(spaceId) {
  return query(`${spaceId}/members`)
    .memberships
    .filter(x => x.state === 'JOINED')
    .map(x => x.member.name)
}

/**
 * Event handler for incoming mentions.
 */
function onMessage(event) {
  let users = null

  switch (event.message.argumentText.trim().toLowerCase()) {
    case 'here':
      users = getMembers(event.space.name)
      break
    default:
      return { 'text': 'Unrecognized tag group :(' }
  }

  let message = users.map(user => `<${user}>`).join(' ')

  return { 'text': message }
}
