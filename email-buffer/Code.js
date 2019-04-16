/**
 * Util to help with batch processing of personal emails.
 *
 * Setup:
 * 1. Deploy as a Google Apps Script to your personal account.
 * 2. Set gmail to auto archive and label all incoming email with the tag below
 *    Note: rules for this can be customised via your search criteria so that
 *    certain emails bypass this buffer (e.g. subjects containing 'URGENT',
 *    specific people etc).
 * 3. Schedule `release` to operate at the desired intervals / times throughout
 *    the day(s).
 *
 * This process will prevent notiications from firing on phones, watches outside
 * of the buffer release windows. This helps reduce context switching so that
 * any incoming items can be batch processed and prioritied, rather than reacted
 * to.
 */

var buffer = GmailApp.getUserLabelByName('buffered')

function release() {
  buffer.getThreads().map(unbuffer)
}

function unbuffer(thread) {
  thread.moveToInbox()
  thread.removeLabel(buffer)
}
