// Basic proxy for receiving webhooks from https://www.smsbroadcast.com.au/ and forwarding to Google Chat.

function buildCard(from, msg) {
  return {
    "cards": [
      {
        "sections": [
          {
            "widgets": [
              {
                "keyValue": {
                  "topLabel": from,
                  "content": msg,
                  "contentMultiline": "true",
                  "icon": "EMAIL"
                }
              }
            ]
          }
        ]
      }
    ]
  };
}

function forwardToChat(from, msg) {
  var options = {
    "method": "post",
    'contentType': 'application/json',
    "payload": JSON.stringify(buildCard(from, msg))
  };
  endpoint = PropertiesService.getScriptProperties().getProperty("GCHAT_WEBHOOK");
  UrlFetchApp.fetch(endpoint, options);
}

function doGet(e) {
  if (e.parameter['to'] == PropertiesService.getScriptProperties().getProperty("SMS_NUMBER")) {
    forwardToChat(e.parameter['from'], e.parameter['message']);
    // Note: null return is intentional. Returning content results in a redirect which is not handled by the SMS service endpioint.
    // See https://developers.google.com/apps-script/guides/content#redirects
    return;
  } else {
    return ContentService.createTextOutput('Unknown number, ignored.');
  }
}
