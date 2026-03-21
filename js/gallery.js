// gallery.js - Media gallery with Firebase

var firebaseReady = false;
var db = null;
var storage = null;
var pendingFiles = [];

function initGallery() {
    if (!FIREBASE_CONFIG || FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
        document.getElementById('gallery-section').innerHTML =
            '<p class="info-text">גלריה משפחתית - ממתין להגדרת Firebase</p>';
        return;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        db = firebase.database();
        storage = firebase.storage();
        firebaseReady = true;

        loadGallery();

        // File select button
        document.getElementById('upload-btn').addEventListener('click', function() {
            document.getElementById('file-input').click();
        });

        // File selected - show preview
        document.getElementById('file-input').addEventListener('change', handleFileSelect);

        // Submit upload
        document.getElementById('upload-submit-btn').addEventListener('click', submitUpload);

        // Cancel
        document.getElementById('upload-cancel-btn').addEventListener('click', cancelUpload);

    } catch (e) {
        document.getElementById('gallery-status').textContent = 'שגיאה בטעינת הגלריה: ' + e.message;
    }
}

function handleFileSelect(e) {
    var files = e.target.files;
    if (!files.length) return;

    pendingFiles = Array.from(files);

    // Show preview
    var preview = document.getElementById('upload-preview');
    var thumbs = document.getElementById('preview-thumbs');
    thumbs.innerHTML = '';

    pendingFiles.forEach(function(file) {
        var div = document.createElement('div');
        div.className = 'preview-thumb';

        if (file.type.startsWith('image/')) {
            var img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            div.appendChild(img);
        } else {
            div.innerHTML = '<div class="preview-video-icon">▶</div>';
        }

        var name = document.createElement('span');
        name.textContent = file.name.substring(0, 15);
        div.appendChild(name);

        thumbs.appendChild(div);
    });

    preview.classList.remove('hidden');
    document.getElementById('upload-description').focus();
}

function cancelUpload() {
    pendingFiles = [];
    document.getElementById('upload-preview').classList.add('hidden');
    document.getElementById('preview-thumbs').innerHTML = '';
    document.getElementById('upload-description').value = '';
    document.getElementById('file-input').value = '';
}

function submitUpload() {
    if (!pendingFiles.length || !firebaseReady) return;

    var description = document.getElementById('upload-description').value.trim();
    var status = document.getElementById('gallery-status');
    var total = pendingFiles.length;
    var uploaded = 0;
    var submitBtn = document.getElementById('upload-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'מעלה...';

    pendingFiles.forEach(function(file) {
        uploadFile(file, description, function(success) {
            uploaded++;
            status.textContent = 'הועלו ' + uploaded + ' מתוך ' + total;
            if (uploaded === total) {
                setTimeout(function() {
                    status.textContent = '';
                    cancelUpload();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'העלה';
                }, 1500);
            }
        });
    });
}

function uploadFile(file, description, onDone) {
    var isImage = file.type.startsWith('image/');
    var isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
        alert('ניתן להעלות רק תמונות או סרטונים');
        onDone(false);
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        alert('הקובץ גדול מדי (מקסימום 50MB)');
        onDone(false);
        return;
    }

    var fileName = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    var ext = file.name.split('.').pop();
    var ref = storage.ref('memorial/' + fileName + '.' + ext);

    var uploadTask = ref.put(file);

    uploadTask.on('state_changed',
        function(snapshot) {
            // Progress
            var pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            document.getElementById('gallery-status').textContent = 'מעלה... ' + pct + '%';
        },
        function(error) {
            console.error('Upload error:', error);
            alert('שגיאה בהעלאה: ' + error.message);
            onDone(false);
        },
        function() {
            // Complete
            uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
                return db.ref('media').push().set({
                    url: url,
                    type: isImage ? 'image' : 'video',
                    description: description,
                    timestamp: Date.now()
                });
            }).then(function() {
                onDone(true);
            }).catch(function(err) {
                alert('שגיאה בשמירה: ' + err.message);
                onDone(false);
            });
        }
    );
}

function loadGallery() {
    var grid = document.getElementById('family-gallery-grid');

    db.ref('media').orderByChild('timestamp').on('value', function(snapshot) {
        grid.innerHTML = '';
        var items = [];

        snapshot.forEach(function(child) {
            items.push({ key: child.key, data: child.val() });
        });

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

            if (d.type === 'image') {
                div.innerHTML =
                    '<img src="' + d.url + '" alt="' + (d.description || '') + '" loading="lazy" onclick="openMedia(this.src, \'image\')">' +
                    '<div class="gallery-meta">' +
                    (d.description ? '<p class="gallery-caption">' + d.description + '</p>' : '') +
                    '<p class="gallery-uploader">' + dateStr + '</p>' +
                    '</div>';
            } else {
                div.innerHTML =
                    '<video src="' + d.url + '" preload="metadata" onclick="openMedia(this.src, \'video\')"></video>' +
                    '<div class="play-overlay">▶</div>' +
                    '<div class="gallery-meta">' +
                    (d.description ? '<p class="gallery-caption">' + d.description + '</p>' : '') +
                    '<p class="gallery-uploader">' + dateStr + '</p>' +
                    '</div>';
            }

            // Context menu
            div.dataset.key = item.key;
            div.dataset.url = d.url;
            div.dataset.type = d.type;
            div.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showCtxMenu(e, this);
            });
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
    }, function(error) {
        grid.innerHTML = '<p class="info-text">שגיאה בטעינה: ' + error.message + '</p>';
    });
}

// ==================== CONTEXT MENU ====================
var ctxTarget = null;

function showCtxMenu(e, el) {
    ctxTarget = el;
    var menu = document.getElementById('photo-context-menu');
    menu.dataset.isStatic = '';
    menu.classList.remove('hidden');
    var x = e.clientX || (e.touches && e.touches[0].clientX) || 100;
    var y = e.clientY || (e.touches && e.touches[0].clientY) || 100;
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
    var url = menu.dataset.isStatic === 'true' ? menu.dataset.imgSrc : (ctxTarget ? ctxTarget.dataset.url : '');
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
    if (menu.dataset.isStatic === 'true') {
        alert('לא ניתן למחוק תמונות קבועות מהאתר');
        closeCtxMenu();
        return;
    }
    if (!ctxTarget || !firebaseReady) { closeCtxMenu(); return; }

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

document.addEventListener('click', function(e) {
    var menu = document.getElementById('photo-context-menu');
    if (menu && !menu.contains(e.target)) menu.classList.add('hidden');
});

// Lightbox
function openMedia(src, type) {
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.onclick = function() { document.body.removeChild(overlay); };
    overlay.innerHTML = type === 'image'
        ? '<img src="' + src + '">'
        : '<video src="' + src + '" controls autoplay></video>';
    document.body.appendChild(overlay);
}
