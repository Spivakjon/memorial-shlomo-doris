// firebase-config.js
// הוראות הגדרה:
// 1. היכנס ל-https://console.firebase.google.com
// 2. צור פרויקט חדש (שם חופשי)
// 3. לחץ על Web app (אייקון </>) והוסף אפליקציה
// 4. העתק את הערכים מה-config לכאן
// 5. בתפריט Build > Storage > לחץ Get Started > בחר production > next
// 6. בתפריט Build > Realtime Database > Create Database > Start in test mode
// 7. ב-Storage > Rules, החלף את הכללים ל:
//    rules_version = '2';
//    service firebase.storage {
//      match /b/{bucket}/o {
//        match /memorial/{allPaths=**} {
//          allow read: if true;
//          allow write: if request.resource.size < 50 * 1024 * 1024;
//        }
//      }
//    }
// 8. ב-Realtime Database > Rules, החלף ל:
//    { "rules": { ".read": true, ".write": true } }

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
