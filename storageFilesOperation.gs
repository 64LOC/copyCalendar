var NAME_OF_STORAGE_FILE = "copyCalendar storage file";
var storageFile;
var sheet;
var indexOfDay;


function addAttempt() {
  sheet.getRange(indexOfDay, 3).setValue(sheet.getRange(indexOfDay, 3).getValue() + 1);
}

function setDayAsFinished() {
  sheet.getRange(indexOfDay, 2).setValue("finished");
}

function allDaysSynchronized() {
  return sheet.getRange(indexOfDay + 1, 2).getValue() == "" ? true : false;
}

function findDayToSynchronize() {
  var line = 1;  
  while (sheet.getRange(line, 2).getValue() == "finished")
    line++;
  
  var synchronizedDay = new Date(sheet.getRange(line, 1).getValue());
  indexOfDay = line;
  
  synchronizedDayStart = new Date(synchronizedDay);
  synchronizedDayStart.setHours(0);
  synchronizedDayStart.setMinutes(0);
  synchronizedDayStart.setSeconds(0);
  synchronizedDayStart.setMilliseconds(0); 
  
  synchronizedDayEnd = new Date(synchronizedDay);
  synchronizedDayEnd.setHours(23);
  synchronizedDayEnd.setMinutes(59);
  synchronizedDayEnd.setSeconds(59);
  synchronizedDayEnd.setMilliseconds(999);
}

function createStorageFile() {
  var currentDay = new Date();
  var line = 1;
  
  sheet = SpreadsheetApp.create(NAME_OF_STORAGE_FILE).getActiveSheet();
  
  currentDay = firstDay;
  while (currentDay <= lastDay) {
    sheet.getRange(line, 1).setValue(currentDay);
    sheet.getRange(line, 2).setValue("not started");
    sheet.getRange(line, 3).setValue(0);
    currentDay.setTime(currentDay.getTime() + (1000 * 60 * 60 * 24));
    line++;
  }
}

function isThereTheStorageFile() {
  var files = DriveApp.getFilesByName(NAME_OF_STORAGE_FILE);  
  
  if (files.hasNext()) {
    storageFile = files.next();
    sheet = SpreadsheetApp.openById(storageFile.getId()).getActiveSheet();
    return true;
  }
  
  return false;
}

function deleteOrphanStorageFiles() {
  var orphanFiles = DriveApp.getFilesByName(NAME_OF_STORAGE_FILE);
  var numberOfFiles = 0;
  
  while (orphanFiles.hasNext()) {
    orphanFiles.next();
    numberOfFiles++;
  }
  
  if (numberOfFiles > 1) {
    orphanFiles = DriveApp.getFilesByName(NAME_OF_STORAGE_FILE);
    
    while (orphanFiles.hasNext()) {
      var orphanFile = orphanFiles.next();
      if (orphanFile.getMimeType() == "application/vnd.google-apps.spreadsheet") {
        Drive.Files.remove(orphanFile.getId());
      }
    }    
  }
}

function deleteStorageFile() {
  Drive.Files.remove(storageFile.getId());
}