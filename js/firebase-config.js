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
    apiKey: "AIzaSyBdBHNVpGj4HmHUTKXaBCrDM7Ap7n_Hdhc",
    authDomain: "memorial-levi.firebaseapp.com",
    databaseURL: "https://memorial-levi-default-rtdb.firebaseio.com",
    projectId: "memorial-levi",
    storageBucket: "memorial-levi.firebasestorage.app",
    messagingSenderId: "250090138671",
    appId: "1:250090138671:web:4bd36dacc6991095c42ada"
};
