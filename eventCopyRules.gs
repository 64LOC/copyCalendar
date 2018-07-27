function isValidToCopy(event) {
  var checkedRules = [];   
  checkedRules.push(new Function("event", ruleIsWhiteListEvent));
  checkedRules.push(new Function("event", ruleNotJustMidnightEnding));
  checkedRules.push(new Function("event", ruleNotDeniedEvent));
  checkedRules.push(new Function("event", ruleNotCreatedInDestinationCalendar));
  checkedRules.push(new Function("event", ruleDestinationOwnerIsNotInvited)); 
  
  for (var i = 0; i < checkedRules.length; i++) {        
    var ruleValidationResult = checkedRules[i](event);    
    if (ruleValidationResult == false)
      return false;
  }
  
  return true;
}

var ruleIsWhiteListEvent = '{                                                                  \
  var blackListMeetings = [".gh.", ".o.", "svátek:", "s birthday"];  \
  for (var j = 0; j < blackListMeetings.length; j++)                                           \
    if (event.getTitle().indexOf(blackListMeetings[j]) != -1)                                  \
      return false;                                                                            \
                                                                                               \
  return true;                                                                                 \
}';

// do not copy all-day event which ends at the beginning of synchronized day - it is an all-day event of previous day  
var ruleNotJustMidnightEnding = '{                                                                                      \
  if (event.isAllDayEvent() && event.getEndTime().getTime() == synchronizedDayStart.getTime())                          \
    return false;                                                                                                       \
                                                                                                                        \
  return true;                                                                                                          \
}';

var ruleNotDeniedEvent = '{                                    \
  return !(event.getMyStatus() == CalendarApp.GuestStatus.NO); \
}';

var ruleNotCreatedInDestinationCalendar = '{                      \
  return !(event.getOriginalCalendarId() == DESTINATION_ACCOUNT); \
}';

var ruleDestinationOwnerIsNotInvited = '{                     \
  var guestList = event.getGuestList(true);                   \
  for (var i = guestList.length; i--; ) {                     \
    if (guestList[i].getEmail() == DESTINATION_ACCOUNT)       \
      return false;                                           \
  }                                                           \
                                                              \
  return true;                                                \
}';