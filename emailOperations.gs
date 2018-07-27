function sendEmailWithError(text) {
  var htmlContent = "<html>" + text + "</html>";
  GmailApp.sendEmail(DESTINATION_ACCOUNT, "copyCalendar: error notification", text, {htmlBody: htmlContent});    
}