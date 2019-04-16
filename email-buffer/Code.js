var buffer = GmailApp.getUserLabelByName('buffered');

function release() {
  buffer.getThreads().map(unbuffer);
}

function unbuffer(thread) {
  thread.moveToInbox();
  thread.removeLabel(buffer);
}