// ==== Google Apps Script - להדביק ב-script.google.com ====
// אחרי ההדבקה:
// 1. לחץ Deploy > New deployment
// 2. בחר Type: Web app
// 3. Execute as: Me
// 4. Who has access: Anyone
// 5. לחץ Deploy ותעתיק את ה-URL

var FOLDER_NAME = 'אתר הנצחה - תמונות';

function getOrCreateFolder() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

function doPost(e) {
  try {
    var folder = getOrCreateFolder();
    var data = JSON.parse(e.postData.contents);
    var fileData = Utilities.base64Decode(data.file);
    var blob = Utilities.newBlob(fileData, data.mimeType, data.fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Save metadata as file description
    var meta = {
      description: data.description || '',
      timestamp: new Date().toISOString(),
      fileId: file.getId()
    };
    file.setDescription(JSON.stringify(meta));

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      url: 'https://drive.google.com/uc?id=' + file.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'updateDesc') {
      var pass = e.parameter.pass;
      if (pass !== '2803') {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, error: 'סיסמה שגויה'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      var fileId = e.parameter.fileId;
      var desc = e.parameter.desc || '';
      var file = DriveApp.getFileById(fileId);
      var meta = {};
      try { meta = JSON.parse(file.getDescription()); } catch (x) {}
      meta.description = desc;
      file.setDescription(JSON.stringify(meta));
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete') {
      var pass = e.parameter.pass;
      if (pass !== '2803') {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, error: 'סיסמה שגויה'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      var fileId = e.parameter.fileId;
      DriveApp.getFileById(fileId).setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: list files
    var folder = getOrCreateFolder();
    var files = folder.getFiles();
    var result = [];

    while (files.hasNext()) {
      var file = files.next();
      var meta = {};
      try { meta = JSON.parse(file.getDescription()); } catch (x) {}

      result.push({
        fileId: file.getId(),
        name: file.getName(),
        url: 'https://drive.google.com/uc?id=' + file.getId(),
        thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w400',
        mimeType: file.getMimeType(),
        description: meta.description || '',
        timestamp: meta.timestamp || file.getDateCreated().toISOString()
      });
    }

    // Sort newest first
    result.sort(function(a, b) { return b.timestamp.localeCompare(a.timestamp); });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      files: result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
