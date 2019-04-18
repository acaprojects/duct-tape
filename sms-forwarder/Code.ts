/**
 * Basic proxy for receiving webhooks from https://www.smsbroadcast.com.au/ and
 * forwarding to Google Chat.
 *
 * Parsers may be added below to provide custom formatting for specific
 * providers.
 */

interface MessageParser {
  (from: string, content: string): GChatMessage | void
}

const parsers = new Map<string, MessageParser>()

const DefaultParser: MessageParser = (from, content) => keyValCard({
  topLabel: from,
  content: content,
  contentMultiline: true,
  icon: 'EMAIL'
})

// PWC 2FA Tokens
parsers.set('61427046424', (from, content) => {
  // Something is very broken in either the SMS provider, or PwC's message
  // generation. We currently received a multipart message for 2FA tokens, with
  // the second part being useless.
  if (content.startsWith("[2/2] ___________________")) {
    return
  }

  let otpRegex = /PwC VPN One-Time Password\D+(\d+)/
  if (otpRegex.test(content)) {
    let [, otp] = otpRegex.exec(content)
    return keyValCard({
      topLabel: 'PwC VPN One-Time Password',
      content: otp,
      icon: 'CONFIRMATION_NUMBER_ICON'
    })
  }

  return DefaultParser(from, content)
})


// ----------------------------------------------------------------------------
// Internals - probably no need to touch things below here


const property = PropertiesService.getScriptProperties().getProperty

const GCHAT_WEBHOOK = property('GCHAT_WEBHOOK')
const SMS_NUMBER = property('SMS_NUMBER')


// Plain text post
interface SimpleMessage { text: string }

// Card
// See https://developers.google.com/hangouts/chat/reference/message-formats/cards
interface CardSection {
  header?: string
  widgets: Array<any>
}
interface Card {
  header?: {
    title?: string
    subtitle?: string
    imageUrl?: string
    imageStyle?: "IMAGE" | "AVATAR"
  }
  sections: Array<CardSection>
}
interface CardMessage { cards: Array<Card> }

type GChatMessage = SimpleMessage | CardMessage

/**
 * Creates a post on the linked Google chat thread.
 */
const postToChat = (payload: GChatMessage) => {
  UrlFetchApp.fetch(GCHAT_WEBHOOK, {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  })
}

/**
 * Util for wrapping a set of props up in a fully formed card message.
 */
const keyValCard = (props) => ({
  cards: [
    {
      sections: [
        {
          widgets: [
            {
              keyValue: props
            }
          ]
        }
      ]
    }
  ]
})

/**
 * Callback for incoming webhooks.
 */
function doGet(e) {
  const to = e.parameter['to']
  const from = e.parameter['from']
  const message = e.parameter['message']

  if (to !== SMS_NUMBER) {
    Logger.log(`Received message directed to unknwon number: ${to}`)
    return ContentService.createTextOutput('Unknown number, ignored.')
  }

  const parser = parsers.get(from) || DefaultParser

  const gchatMessage = parser(from, message)

  if (gchatMessage) {
    postToChat(gchatMessage)
  } else {
    Logger.log(`Message from ${from} ignored (${message})`)
  }

  // Note: void return is intentional. Returning content results in a redirect
  // which is not handled by the SMS service endpioint.
  // See https://developers.google.com/apps-script/guides/content#redirects
}
