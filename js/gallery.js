// gallery.js - Media gallery with Firebase

let firebaseReady = false;
let db = null;
let storage = null;

function initGallery() {
    // Check if Firebase config is set
    if (!FIREBASE_CONFIG || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
        document.getElementById('gallery-section').innerHTML =
            '<p class="info-text">גלריה משפחתית - ממתין להגדרת Firebase</p>';
        return;
    }

    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        db = firebase.database();
        storage = firebase.storage();
        firebaseReady = true;

        // Load existing media
        loadGallery();

        // Setup upload button
        document.getElementById('upload-btn').addEventListener('click', function() {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', handleFileSelect);

    } catch (e) {
        console.error('Firebase init error:', e);
        document.getElementById('gallery-status').textContent = 'שגיאה בטעינת הגלריה';
    }
}

function handleFileSelect(e) {
    var files = e.target.files;
    if (!files.length) return;

    var uploaderName = prompt('מה שמך?');
    if (!uploaderName) return;

    var caption = prompt('תיאור (אופציונלי):') || '';

    // Show progress
    var status = document.getElementById('gallery-status');
    var totalFiles = files.length;
    var uploaded = 0;
    status.textContent = 'מעלה ' + totalFiles + ' קבצים...';

    for (var i = 0; i < files.length; i++) {
        uploadFile(files[i], uploaderName, caption, function() {
            uploaded++;
            status.textContent = 'הועלו ' + uploaded + ' מתוך ' + totalFiles;
            if (uploaded === totalFiles) {
                setTimeout(function() { status.textContent = ''; }, 2000);
                e.target.value = '';
            }
        });
    }
}

function uploadFile(file, uploaderName, caption, onDone) {
    // Validate file type
    var isImage = file.type.startsWith('image/');
    var isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
        alert('ניתן להעלות רק תמונות או סרטונים');
        onDone();
        return;
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
        alert('הקובץ גדול מדי (מקסימום 50MB)');
        onDone();
        return;
    }

    var fileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    var ref = storage.ref('memorial/' + fileName);

    ref.put(file).then(function(snapshot) {
        return snapshot.ref.getDownloadURL();
    }).then(function(url) {
        // Save metadata to database
        var mediaRef = db.ref('media').push();
        return mediaRef.set({
            url: url,
            type: isImage ? 'image' : 'video',
            fileName: file.name,
            uploaderName: uploaderName,
            caption: caption,
            timestamp: Date.now()
        });
    }).then(function() {
        onDone();
    }).catch(function(err) {
        console.error('Upload error:', err);
        alert('שגיאה בהעלאה: ' + err.message);
        onDone();
    });
}

function loadGallery() {
    var grid = document.getElementById('family-gallery-grid');

    db.ref('media').orderByChild('timestamp').on('value', function(snapshot) {
        grid.innerHTML = '';
        var items = [];

        snapshot.forEach(function(child) {
            items.push({ key: child.key, data: child.val() });
        });

        // Reverse to show newest first
        items.reverse();

        if (items.length === 0) {
            grid.innerHTML = '<p class="info-text">עדיין לא הועלו תמונות. היו הראשונים!</p>';
            return;
        }

        items.forEach(function(item) {
            var d = item.data;
            var div = document.createElement('div');
            div.className = 'gallery-item';

            var date = new Date(d.timestamp);
            var dateStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

            var mediaEl;
            if (d.type === 'image') {
                div.innerHTML =
                    '<img src="' + d.url + '" alt="' + (d.caption || '') + '" loading="lazy" onclick="openMedia(this.src, \'image\')">' +
                    '<div class="gallery-meta">' +
                    (d.caption ? '<p class="gallery-caption">' + d.caption + '</p>' : '') +
                    '<p class="gallery-uploader">' + d.uploaderName + ' | ' + dateStr + '</p>' +
                    '</div>';
            } else {
                div.innerHTML =
                    '<video src="' + d.url + '" preload="metadata" onclick="openMedia(this.src, \'video\')"></video>' +
                    '<div class="play-overlay">▶</div>' +
                    '<div class="gallery-meta">' +
                    (d.caption ? '<p class="gallery-caption">' + d.caption + '</p>' : '') +
                    '<p class="gallery-uploader">' + d.uploaderName + ' | ' + dateStr + '</p>' +
                    '</div>';
            }

            // Context menu on long-press / right-click
            div.dataset.key = item.key;
            div.dataset.url = d.url;
            div.dataset.type = d.type;
            div.dataset.fileName = d.fileName || 'photo';
            div.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showCtxMenu(e, this);
            });

            // Long press for mobile
            var longPressTimer;
            div.addEventListener('touchstart', function(e) {
                var el = this;
                longPressTimer = setTimeout(function() {
                    e.preventDefault();
                    showCtxMenu(e, el);
                }, 600);
            });
            div.addEventListener('touchend', function() { clearTimeout(longPressTimer); });
            div.addEventListener('touchmove', function() { clearTimeout(longPressTimer); });

            grid.appendChild(div);
        });
    });
}

// ==================== CONTEXT MENU ====================
var ctxTarget = null;

function showCtxMenu(e, el) {
    ctxTarget = el;
    var menu = document.getElementById('photo-context-menu');
    menu.classList.remove('hidden');

    // Position
    var x = e.clientX || (e.touches && e.touches[0].clientX) || 100;
    var y = e.clientY || (e.touches && e.touches[0].clientY) || 100;

    // Keep in viewport
    menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';
}

function closeCtxMenu() {
    var menu = document.getElementById('photo-context-menu');
    menu.classList.add('hidden');
    menu.dataset.isStatic = '';
    menu.dataset.imgSrc = '';
    ctxTarget = null;
}

function ctxDownload() {
    var menu = document.getElementById('photo-context-menu');
    var url = '';
    if (menu.dataset.isStatic === 'true') {
        url = menu.dataset.imgSrc;
    } else if (ctxTarget) {
        url = ctxTarget.dataset.url;
    }
    if (url) {
        var a = document.createElement('a');
        a.href = url;
        a.download = 'photo';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    closeCtxMenu();
}

function ctxDelete() {
    var menu = document.getElementById('photo-context-menu');

    // Static photos can't be deleted (they're in the repo)
    if (menu.dataset.isStatic === 'true') {
        alert('לא ניתן למחוק תמונות קבועות מהאתר');
        closeCtxMenu();
        return;
    }

    if (!ctxTarget || !firebaseReady) {
        closeCtxMenu();
        return;
    }

    var pass = prompt('הזן סיסמה למחיקה:');
    if (pass !== '2803') {
        alert('סיסמה שגויה');
        closeCtxMenu();
        return;
    }
    var key = ctxTarget.dataset.key;
    var url = ctxTarget.dataset.url;

    db.ref('media/' + key).remove().then(function() {
        try { storage.refFromURL(url).delete(); } catch (e) {}
        closeCtxMenu();
    }).catch(function(err) {
        alert('שגיאה במחיקה: ' + err.message);
        closeCtxMenu();
    });
}

// Close context menu on click elsewhere
document.addEventListener('click', function(e) {
    var menu = document.getElementById('photo-context-menu');
    if (menu && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// Lightbox for viewing full media
function openMedia(src, type) {
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.onclick = function() { document.body.removeChild(overlay); };

    if (type === 'image') {
        overlay.innerHTML = '<img src="' + src + '">';
    } else {
        overlay.innerHTML = '<video src="' + src + '" controls autoplay></video>';
    }

    document.body.appendChild(overlay);
}
