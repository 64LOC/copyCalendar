var DELAY_OF_TRIGGER = 2 * 60 * 1000; // 2 minutes
var STANDARD_START_HOUR = 17; // means 17 o'clock next day


function deletePreviousTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++)
    if (triggers[i].getHandlerFunction() == "mainCopyCalendar")
      ScriptApp.deleteTrigger(triggers[i]);
}

function checkAndScheduleNextTriggerAfterDelay() {  
  checkAndScheduleNextTrigger("continueAfterDelay");
}

function checkAndScheduleNextTrigger(when) { 
  if (isTriggerSet())
    return;

  var nextRunOfTrigger;  
  switch (when) {
    case "nextDay":
      nextRunOfTrigger = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      nextRunOfTrigger.setHours(STANDARD_START_HOUR);
      break;
    case "plusTwoHours":
      nextRunOfTrigger = new Date((new Date()).getTime() + 1000 * 60 * 60 * 2);
      break;
    case "continueAfterDelay":
      nextRunOfTrigger = new Date((new Date()).getTime() + DELAY_OF_TRIGGER);      
      break;  
  }
  
  ScriptApp.newTrigger("mainCopyCalendar")
    .timeBased()
    .at(nextRunOfTrigger)
    .create();  
}

function isTriggerSet() {
  var triggers = ScriptApp.getProjectTriggers();  
  for (var i = 0; i < triggers.length; i++) 
    if (triggers[i].getHandlerFunction() == "mainCopyCalendar")
      return true;
  
  return false;
}

function setCheckingTrigger() {   
  ScriptApp.newTrigger("checkAndScheduleNextTriggerAfterDelay")
    .timeBased()
    .everyHours(4)
    .create();  
}