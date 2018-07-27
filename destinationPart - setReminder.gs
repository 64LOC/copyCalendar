function doGet(e) {   
  var result;
  var params = JSON.parse(JSON.stringify(e));
    
  if (params.parameter.minutesBefore)  
    result = setReminder(params.parameter.eventId, params.parameter.startTime, params.parameter.endTime, params.parameter.minutesBefore);
  else
    result = setReminder(params.parameter.eventId, params.parameter.startTime, params.parameter.endTime);
  
  return ContentService.createTextOutput(result);   
}

function setReminder(eventId, startTime, endTime, minutesBefore) {
  
  // find the event (can not be searched just with eventId 
  startTime = startTime.replace("GMT ", "GMT+");
  var st = new Date(startTime);
  endTime = endTime.replace("GMT ", "GMT+");
  var et = new Date(endTime)
  
  var events = CalendarApp.getDefaultCalendar().getEvents(st, et);
  var event;  
    
  for (var i = 0; i < events.length; i++)
    if (events[i].getId() == eventId) {
      event = events[i];      
      break;
    }
    
  // no event was found
  if (!event)
    return -1;
  
  // re-settig of reminder
  event.removeAllReminders(); 
  // is there a reminder?
  if (minutesBefore && minutesBefore != "undefined")
    event.addPopupReminder(minutesBefore);
  
  return 1;
}
