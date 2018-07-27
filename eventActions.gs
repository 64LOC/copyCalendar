var eventTable = [];

function etPushSourceEvents(events) {
  for (var i = 0; i < events.length; i++) {
    var tableEventItem = { sourceId: events[i].getId(), sourceEvent: events[i], destinationEvent: null };
    eventTable.push(tableEventItem);
  }  
}

function etPushDestinationEvents(destEvents) {  
  for (var i = 0; i < destEvents.length; i++) {
    var eventFound = false;
    var destIdTag = destEvents[i].getTag("synchSourceID");
   
    for (var j = 0; j < eventTable.length && !eventFound; j++) {      
      if (destIdTag == eventTable[j].sourceId && eventTable[j].destinationEvent == null) {
        eventTable[j].destinationEvent = destEvents[i];
        eventFound = true;
      }
    }
       
    if (!eventFound) {
      var tableEventItem = { sourceId: destEvents[i].getTag("synchSourceID"), sourceEvent: null, destinationEvent: destEvents[i] };
      eventTable.push(tableEventItem);
    }
   }
}

function synchronizeEventTable() {
  for (var i = 0; i < eventTable.length; i++) {
    if (eventTable[i].sourceEvent == null)
      eventTable[i].destinationEvent.deleteEvent();          
    else
      if (isValidToCopy(eventTable[i].sourceEvent))
        if (eventTable[i].destinationEvent == null)
          copyEventToCalendar(eventTable[i].sourceEvent, "insert", null);
        else
          if (eventTable[i].sourceEvent.getLastUpdated() > eventTable[i].destinationEvent.getLastUpdated())
            copyEventToCalendar(eventTable[i].sourceEvent, "update", eventTable[i].destinationEvent);
  }
}

function copyEventToCalendar(event, action, updatedEvent) {        
  var destinationEvent;
  if (action == "insert")
    destinationEvent = DESTINATION_CALENDAR.createEvent(event.getTitle(), event.getStartTime(), event.getEndTime());
  else {
    destinationEvent = updatedEvent;
    destinationEvent.setTitle(event.getTitle());
    destinationEvent.setTime(event.getStartTime(), event.getEndTime());    
  }  

  destinationEvent.setLocation(event.getLocation());
  destinationEvent.setVisibility(event.getVisibility()); 
  destinationEvent.setAnyoneCanAddSelf(event.anyoneCanAddSelf());
  destinationEvent.setGuestsCanInviteOthers(event.guestsCanInviteOthers());
  destinationEvent.setGuestsCanModify(event.guestsCanModify());
  destinationEvent.setGuestsCanSeeGuests(event.guestsCanSeeGuests());
  destinationEvent.setTag("synchSourceID", event.getId());
       
  var tagKeys = event.getAllTagKeys();
  for (var i = tagKeys.length; i--; )
    destinationEvent.setTag(tagKeys[i], event.getTag(tagKeys[i]));
  
  var additionalDescription = new String("\n\n\n-------- additional description --------\n");      
  var guestList = event.getGuestList(true);
  for (var i = guestList.length; i--; ) {    
    additionalDescription += guestList[i].getEmail() + ", " + guestList[i].getName() + ", " + guestList[i].getGuestStatus() + "\n";  
  }
 
  var creators = event.getCreators();
  additionalDescription += "\n";
  for (var i = creators.length; i--; )
    additionalDescription += "author: " + creators[i] + "\n";  
  
  // vlož znaèku události ze synchronizace
  additionalDescription += "\n" + "<synchSignatureTag>copyCalendar</synchSignatureTag>" + "\n";
  var completeDescription = event.getDescription() + additionalDescription;
  if (completeDescription.length >= 7900) {
    completeDescription = completeDescription.slice(0, 7899);  
    completeDescription += "\n" + "<synchSignatureTag>copyCalendar</synchSignatureTag>" + "\n";
  }  
  
  destinationEvent.setDescription(completeDescription);  
  
  copyNonDefaultReminders(destinationEvent, event);
}

function copyNonDefaultReminders(destinationEvent, sourceEvent) {  
  var url = "https://script.google.com/macros/s/blahblahblah_replace_this/exec";  
  url = url + "?eventId=" + destinationEvent.getId() + "&startTime=" + sourceEvent.getStartTime() + "&endTime=" + sourceEvent.getEndTime() + "&minutesBefore=" + sourceEvent.getPopupReminders()[0];
  
  try {  
    var response = UrlFetchApp.fetch(url);
  } catch(e) {
    sendEmailWithError(e);
  }
  
  if (!(response.getResponseCode() == 200 && response.getContentText() == 1))
    sendEmailWithError("Chyba nastavení pøipomínky.\n" + "Response: " +  response.getResponseCode() + "\nResult: " + response.getContentText());  
}