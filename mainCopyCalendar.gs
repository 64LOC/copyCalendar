var INITIAL_TIME_RANGE_HISTORY = 2; // 2 days backward
var INITIAL_TIME_RANGE_FUTURE = 28; // 28 days forward

var DESTINATION_ACCOUNT = UserProperties.getProperty('copyCalendarDT_destinationAccount');
var DESTINATION_CALENDAR = CalendarApp.getCalendarById(DESTINATION_ACCOUNT);
var SOURCE_CALENDAR = CalendarApp.getDefaultCalendar(); 

var firstDay = new Date();
var lastDay = new Date();
var currentDate = new Date();
var synchronizedDayStart;
var synchronizedDayEnd;



function mainCopyCalendar() {
     
  deletePreviousTriggers();
  deleteOrphanStorageFiles();  
  if (!isThereTheStorageFile()) {
    initializeTimeRangeFirstDayLastDay();
    createStorageFile();    
  }

  var nextRun = "continueAfterDelay";
  findDayToSynchronize();
  addAttempt();  
  try {    
    etPushSourceEvents(SOURCE_CALENDAR.getEvents(synchronizedDayStart, synchronizedDayEnd));
    etPushDestinationEvents(DESTINATION_CALENDAR.getEvents(synchronizedDayStart, synchronizedDayEnd, {search: 'copyCalendar'}));
    synchronizeEventTable();    
    setDayAsFinished();      
    
    if (allDaysSynchronized()) {
      nextRun = "plusTwoHours";
      deleteStorageFile();
      UserProperties.setProperty('copyCalendarDT_lastSuccesfulRun', currentDate);      
    }
  }
  catch (error) {
    sendEmailWithError(error);
    if (error != "Exception: V krátké dobì jste vytvoøili nebo smazali pøíliš mnoho kalendáøù nebo událostí. Zkuste to znovu pozdìji.") {
      nextRun = "nextDay";
    }
  }
  
  checkAndScheduleNextTrigger(nextRun);     
}

function initializeTimeRangeFirstDayLastDay() {  
  var lastSuccessfulTimestamp = new Date(UserProperties.getProperty('copyCalendarDT_lastSuccesfulRun'));
  
  firstDay.setTime(lastSuccessfulTimestamp.getTime() - (1000 * 60 * 60 * 24 * INITIAL_TIME_RANGE_HISTORY));
  lastDay.setTime(currentDate.getTime() + (1000 * 60 * 60 * 24 * INITIAL_TIME_RANGE_FUTURE));  
}