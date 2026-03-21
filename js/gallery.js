// gallery.js - Media gallery with Google Drive (via Apps Script)

// IMPORTANT: Replace with your Apps Script Web App URL after deployment
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0aLyFIHBTk-bwSKEAvclwztHgqCcjDQviAF3ThU1huN3rDtsS2EKsaQyqTw-5mSPLIw/exec';

var pendingFiles = [];

function initGallery() {
    if (!APPS_SCRIPT_URL) {
        document.getElementById('gallery-status').textContent = 'גלריה ממתינה להגדרה';
        return;
    }

    loadGallery();

    document.getElementById('upload-btn').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    document.getElementById('upload-submit-btn').addEventListener('click', submitUpload);
    document.getElementById('upload-cancel-btn').addEventListener('click', cancelUpload);
}

function handleFileSelect(e) {
    var files = e.target.files;
    if (!files.length) return;
    pendingFiles = Array.from(files);

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
    if (!pendingFiles.length) return;
    var description = document.getElementById('upload-description').value.trim();
    var status = document.getElementById('gallery-status');
    var total = pendingFiles.length;
    var uploaded = 0;
    var submitBtn = document.getElementById('upload-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'מעלה...';

    pendingFiles.forEach(function(file) {
        uploadToGDrive(file, description, function(success) {
            uploaded++;
            status.textContent = 'הועלו ' + uploaded + ' מתוך ' + total;
            if (uploaded === total) {
                setTimeout(function() {
                    status.textContent = '';
                    cancelUpload();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'העלה';
                    loadGallery();
                }, 1000);
            }
        });
    });
}

function uploadToGDrive(file, description, onDone) {
    if (file.size > 50 * 1024 * 1024) {
        alert('הקובץ גדול מדי (מקסימום 50MB)');
        onDone(false);
        return;
    }

    var status = document.getElementById('gallery-status');
    status.textContent = 'קורא קובץ...';

    var reader = new FileReader();
    reader.onload = function() {
        var base64 = reader.result.split(',')[1];
        status.textContent = 'מעלה ל-Google Drive...';

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                file: base64,
                fileName: file.name,
                mimeType: file.type,
                description: description
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                onDone(true);
            } else {
                alert('שגיאה: ' + (data.error || 'לא ידוע'));
                onDone(false);
            }
        })
        .catch(function(err) {
            alert('שגיאה בהעלאה: ' + err.message);
            onDone(false);
        });
    };
    reader.readAsDataURL(file);
}

function loadGallery() {
    var grid = document.getElementById('family-gallery-grid');
    grid.innerHTML = '<p class="info-text">טוען גלריה...</p>';

    fetch(APPS_SCRIPT_URL + '?action=list')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) {
                grid.innerHTML = '<p class="info-text">שגיאה: ' + (data.error || '') + '</p>';
                return;
            }

            if (!data.files || data.files.length === 0) {
                grid.innerHTML = '<p class="info-text">עדיין לא הועלו תמונות. היו הראשונים!</p>';
                return;
            }

            grid.innerHTML = '';
            data.files.forEach(function(f) {
                var div = document.createElement('div');
                div.className = 'gallery-item';
                var date = new Date(f.timestamp);
                var dateStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

                var isVideo = f.mimeType && f.mimeType.startsWith('video/');

                if (isVideo) {
                    div.innerHTML =
                        '<video src="' + f.url + '" preload="metadata" onclick="openMedia(this.src, \'video\')"></video>' +
                        '<div class="play-overlay">▶</div>' +
                        '<div class="gallery-meta">' +
                        (f.description ? '<p class="gallery-caption">' + f.description + '</p>' : '') +
                        '<p class="gallery-uploader">' + dateStr + '</p>' +
                        '</div>';
                } else {
                    div.innerHTML =
                        '<img src="' + f.thumbnailUrl + '" alt="' + (f.description || '') + '" loading="lazy" ' +
                        'onclick="openMedia(\'' + f.url + '\', \'image\')">' +
                        '<div class="gallery-meta">' +
                        (f.description ? '<p class="gallery-caption">' + f.description + '</p>' : '') +
                        '<p class="gallery-uploader">' + dateStr + '</p>' +
                        '</div>';
                }

                // Context menu
                div.dataset.fileId = f.fileId;
                div.dataset.url = f.url;
                div.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showCtxMenu(e, this);
                });
                var timer;
                div.addEventListener('touchstart', function(e) {
                    var el = this;
                    timer = setTimeout(function() { e.preventDefault(); showCtxMenu(e, el); }, 600);
                });
                div.addEventListener('touchend', function() { clearTimeout(timer); });
                div.addEventListener('touchmove', function() { clearTimeout(timer); });

                grid.appendChild(div);
            });
        })
        .catch(function(err) {
            grid.innerHTML = '<p class="info-text">שגיאה בטעינה: ' + err.message + '</p>';
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
    if (!ctxTarget) { closeCtxMenu(); return; }

    var pass = prompt('הזן סיסמה למחיקה:');
    if (pass !== '2803') {
        alert('סיסמה שגויה');
        closeCtxMenu();
        return;
    }

    var fileId = ctxTarget.dataset.fileId;
    fetch(APPS_SCRIPT_URL + '?action=delete&fileId=' + fileId + '&pass=' + pass)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                loadGallery();
            } else {
                alert(data.error || 'שגיאה במחיקה');
            }
            closeCtxMenu();
        })
        .catch(function(err) {
            alert('שגיאה: ' + err.message);
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
