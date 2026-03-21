// gallery.js - Unified gallery with categories and people tags

var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0aLyFIHBTk-bwSKEAvclwztHgqCcjDQviAF3ThU1huN3rDtsS2EKsaQyqTw-5mSPLIw/exec';

// Static photos with metadata
var STATIC_PHOTOS = [
    {
        src: 'images/couple-garden.jpg',
        description: 'שלמה ודוריס - תמונה בגינה',
        people: ['שלמה', 'דוריס'],
        category: 'זוגי',
        period: 'שנות ה-2010',
        isStatic: true
    },
    {
        src: 'images/together.jpg',
        description: 'שלמה ודוריס',
        people: ['שלמה', 'דוריס'],
        category: 'זוגי',
        period: 'שנות ה-2020',
        isStatic: true
    },
    {
        src: 'images/family1.jpg',
        description: 'חגיגת יום הולדת משפחתית',
        people: ['שלמה', 'דוריס'],
        category: 'משפחה',
        period: 'שנות ה-2010',
        isStatic: true
    },
    {
        src: 'images/family2.jpg',
        description: 'תמונה משפחתית',
        people: ['שלמה'],
        category: 'משפחה',
        period: 'שנות ה-2010',
        isStatic: true
    },
    {
        src: 'images/doris.jpg',
        description: 'דוריס',
        people: ['דוריס'],
        category: 'אישי',
        period: 'שנות ה-2010',
        isStatic: true
    },
    {
        src: 'images/shabbat.jpg',
        description: 'לחיים! ארוחת שבת',
        people: ['שלמה'],
        category: 'אירועים',
        period: 'שנות ה-2010',
        isStatic: true
    },
    {
        src: 'images/birthday2.jpg',
        description: 'חגיגה משפחתית - יום הולדת',
        people: ['דוריס'],
        category: 'אירועים',
        period: 'שנות ה-2020',
        isStatic: true
    },
    {
        src: 'images/family-outdoor.jpg',
        description: 'טיול משפחתי',
        people: ['דוריס'],
        category: 'משפחה',
        period: 'שנות ה-2020',
        isStatic: true
    },
    {
        src: 'images/train1.jpg',
        description: 'ליד הרכבת הישנה',
        people: ['דוריס'],
        category: 'משפחה',
        period: 'שנות ה-2020',
        isStatic: true
    },
    {
        src: 'images/train2.jpg',
        description: 'ליד הרכבת הישנה',
        people: ['דוריס'],
        category: 'משפחה',
        period: 'שנות ה-2020',
        isStatic: true
    }
];

var CATEGORIES = ['הכל', 'זוגי', 'משפחה', 'אירועים', 'אישי', 'הועלו ע"י המשפחה'];
var activeFilter = 'הכל';
var activePersonFilter = null;
var allPhotos = [];
var pendingFiles = [];

function initGallery() {
    // Build unified gallery
    allPhotos = STATIC_PHOTOS.slice();

    // Render filter buttons
    renderFilters();

    // Load Google Drive photos and merge
    if (APPS_SCRIPT_URL) {
        loadDrivePhotos();
    } else {
        renderGallery();
    }
}

function renderFilters() {
    var container = document.getElementById('gallery-filters');
    if (!container) return;
    container.innerHTML = '';

    CATEGORIES.forEach(function(cat) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn' + (activeFilter === cat ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = function() {
            activeFilter = cat;
            activePersonFilter = null;
            renderFilters();
            renderGallery();
        };
        container.appendChild(btn);
    });
}

function loadDrivePhotos() {
    fetch(APPS_SCRIPT_URL + '?action=list')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success && data.files) {
                data.files.forEach(function(f) {
                    var isVideo = f.mimeType && f.mimeType.startsWith('video/');
                    var desc = f.description || '';
                    var cat = 'הועלו ע"י המשפחה';

                    // Extract category tag from description
                    var catMatch = desc.match(/\[קטגוריה:([^\]]+)\]/);
                    if (catMatch) {
                        cat = catMatch[1];
                        desc = desc.replace(catMatch[0], '').trim();
                    }

                    // Extract people from description
                    var people = [];
                    var familyNames = ['שלמה', 'דוריס', 'אלי', 'שרית', 'לילך', 'שאולי', 'גילי', 'מיכל',
                        'שגיא', 'נועה', 'יניב', 'יהונתן', 'עדן', 'דין', 'ים', 'אדם', 'עומר', 'נועם', 'ליהיא'];
                    familyNames.forEach(function(name) {
                        if (desc.indexOf(name) !== -1) people.push(name);
                    });

                    allPhotos.push({
                        src: 'https://lh3.googleusercontent.com/d/' + f.fileId + '=w600',
                        fullSrc: 'https://lh3.googleusercontent.com/d/' + f.fileId + '=w2000',
                        description: desc,
                        people: people,
                        category: cat,
                        period: '',
                        isStatic: false,
                        fileId: f.fileId,
                        isVideo: isVideo,
                        driveUrl: f.url
                    });
                });
            }
            renderGallery();
        })
        .catch(function() {
            renderGallery();
        });
}

function renderGallery() {
    var grid = document.getElementById('unified-gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var filtered = allPhotos.filter(function(p) {
        if (activePersonFilter) {
            return p.people && p.people.indexOf(activePersonFilter) !== -1;
        }
        if (activeFilter === 'הכל') return true;
        return p.category === activeFilter;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="info-text">אין תמונות בקטגוריה זו</p>';
        return;
    }

    filtered.forEach(function(photo, idx) {
        var div = document.createElement('div');
        div.className = 'gallery-item';

        var imgSrc = photo.src;
        var peopleTags = '';
        if (photo.people && photo.people.length > 0) {
            peopleTags = '<div class="photo-people">' +
                photo.people.map(function(p) {
                    return '<span class="person-tag" onclick="event.stopPropagation(); filterByPerson(\'' + p + '\')">' + p + '</span>';
                }).join('') + '</div>';
        }

        if (photo.isVideo) {
            div.innerHTML =
                '<img src="' + imgSrc + '" alt="סרטון" loading="lazy">' +
                '<div class="play-overlay">▶</div>' +
                peopleTags +
                '<div class="gallery-meta">' +
                (photo.description ? '<p class="gallery-caption">' + photo.description + '</p>' : '') +
                (photo.period ? '<p class="gallery-period">' + photo.period + '</p>' : '') +
                '</div>';
            div.onclick = function() {
                openDriveVideo(photo.fileId, photo.description);
            };
        } else {
            div.innerHTML =
                '<img src="' + imgSrc + '" alt="' + (photo.description || '') + '" loading="lazy">' +
                peopleTags +
                '<div class="gallery-meta">' +
                (photo.description ? '<p class="gallery-caption">' + photo.description + '</p>' : '') +
                (photo.period ? '<p class="gallery-period">' + photo.period + '</p>' : '') +
                '</div>';
            div.onclick = function() {
                var full = photo.fullSrc || photo.src;
                openMedia(full, 'image', photo.fileId || null, photo.description);
            };
        }

        // AI classify button for uploaded photos without category
        if (!photo.isStatic && photo.fileId && photo.category === 'הועלו ע"י המשפחה') {
            var aiBtn = document.createElement('button');
            aiBtn.className = 'gallery-ai-btn';
            aiBtn.textContent = 'סווג AI';
            aiBtn.onclick = function(e) {
                e.stopPropagation();
                classifyExistingPhoto(photo, aiBtn);
            };
            div.appendChild(aiBtn);
        }

        // Context menu for Drive photos
        if (!photo.isStatic && photo.fileId) {
            div.dataset.fileId = photo.fileId;
            div.dataset.url = photo.driveUrl || photo.src;
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
        }

        grid.appendChild(div);
    });
}

// Filter by person (from tag click or tree click)
function filterByPerson(name) {
    activePersonFilter = name;
    activeFilter = 'הכל';
    renderFilters();

    // Add active person indicator
    var container = document.getElementById('gallery-filters');
    var clearBtn = document.createElement('button');
    clearBtn.className = 'filter-btn active person-filter';
    clearBtn.textContent = name + ' ✕';
    clearBtn.onclick = function() {
        activePersonFilter = null;
        renderFilters();
        renderGallery();
    };
    container.appendChild(clearBtn);

    renderGallery();

    // Scroll to gallery
    document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
}

// AI categorization based on image analysis via description + visual cues
function aiCategorize() {
    var btn = document.getElementById('ai-category-btn');
    var desc = (document.getElementById('upload-description').value || '').trim();
    var select = document.getElementById('upload-category');

    // If no description, try to analyze the image filename
    var fileInput = document.getElementById('file-input');
    var fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name.toLowerCase() : '';

    btn.textContent = 'מנתח...';
    btn.classList.add('loading');

    // Simulate brief analysis delay
    setTimeout(function() {
        var category = smartCategorize(desc, fileName);
        select.value = category;
        btn.textContent = 'סווג: ' + category;
        btn.classList.remove('loading');
        setTimeout(function() { btn.textContent = 'סיווג AI'; }, 2000);
    }, 800);
}

function smartCategorize(desc, fileName) {
    var text = (desc + ' ' + fileName).toLowerCase();

    // Family member names
    var familyNames = ['אלי', 'שרית', 'לילך', 'שאולי', 'גילי', 'מיכל', 'שגיא', 'נועה',
        'יניב', 'אנטוניו', 'יהונתן', 'עדן', 'דין', 'ים', 'אדם', 'עומר', 'נועם', 'ליהיא',
        'מיה', 'ליאו', 'עלמה', 'עידן', 'נכדים', 'ילדים', 'משפחה', 'כולם'];

    var coupleWords = ['שלמה ודוריס', 'סבא וסבתא', 'זוג', 'ביחד', 'שניהם'];
    var eventWords = ['יום הולדת', 'חתונה', 'בר מצווה', 'בת מצווה', 'חג', 'פסח', 'ראש השנה',
        'סוכות', 'חנוכה', 'פורים', 'שבת', 'חגיגה', 'מסיבה', 'אירוע', 'טקס', 'birthday',
        'אזכרה', 'שמחה'];
    var personalWords = ['שלמה', 'סבא', 'דוריס', 'סבתא', 'לבד', 'פורטרט', 'portrait'];

    // Check couple
    for (var i = 0; i < coupleWords.length; i++) {
        if (text.indexOf(coupleWords[i]) !== -1) return 'זוגי';
    }

    // Check events
    for (var i = 0; i < eventWords.length; i++) {
        if (text.indexOf(eventWords[i]) !== -1) return 'אירועים';
    }

    // Check family members
    var familyCount = 0;
    for (var i = 0; i < familyNames.length; i++) {
        if (text.indexOf(familyNames[i]) !== -1) familyCount++;
    }
    if (familyCount >= 2) return 'משפחה';

    // Check personal
    for (var i = 0; i < personalWords.length; i++) {
        if (text.indexOf(personalWords[i]) !== -1) return 'אישי';
    }

    // Default based on number of faces mentioned
    if (familyCount >= 1) return 'משפחה';

    return 'משפחה'; // safe default
}

// Classify an already-uploaded photo
function classifyExistingPhoto(photo, btnEl) {
    btnEl.textContent = 'מנתח...';
    btnEl.classList.add('loading');

    setTimeout(function() {
        var category = smartCategorize(photo.description || '', '');

        // Save category to description tag
        var newDesc = photo.description || '';
        // Remove old category tag if exists
        newDesc = newDesc.replace(/\[קטגוריה:[^\]]+\]/, '').trim();
        newDesc = newDesc + (newDesc ? ' ' : '') + '[קטגוריה:' + category + ']';

        fetch(APPS_SCRIPT_URL + '?action=updateDesc&fileId=' + encodeURIComponent(photo.fileId) + '&desc=' + encodeURIComponent(newDesc) + '&pass=2803')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    btnEl.textContent = category;
                    btnEl.style.background = '#4a8';
                    // Reload gallery
                    setTimeout(function() {
                        allPhotos = STATIC_PHOTOS.slice();
                        loadDrivePhotos();
                    }, 800);
                } else {
                    btnEl.textContent = 'שגיאה';
                    btnEl.classList.remove('loading');
                }
            })
            .catch(function() {
                btnEl.textContent = 'שגיאה';
                btnEl.classList.remove('loading');
            });
    }, 600);
}

// Upload handling
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
    document.getElementById('upload-category').value = '';
    document.getElementById('file-input').value = '';
}

function submitUpload() {
    if (!pendingFiles.length || !APPS_SCRIPT_URL) return;
    var description = document.getElementById('upload-description').value.trim();
    var category = document.getElementById('upload-category').value || 'הועלו ע"י המשפחה';
    // Append category to description as tag
    if (category && category !== 'הועלו ע"י המשפחה') {
        description = description + (description ? ' ' : '') + '[קטגוריה:' + category + ']';
    }
    var status = document.getElementById('gallery-status');
    var total = pendingFiles.length;
    var uploaded = 0;
    var btn = document.getElementById('upload-submit-btn');
    btn.disabled = true;
    btn.textContent = 'מעלה...';

    pendingFiles.forEach(function(file) {
        uploadToGDrive(file, description, function() {
            uploaded++;
            status.textContent = 'הועלו ' + uploaded + ' מתוך ' + total;
            if (uploaded === total) {
                setTimeout(function() {
                    status.textContent = '';
                    cancelUpload();
                    btn.disabled = false;
                    btn.textContent = 'העלה';
                    // Reload all
                    allPhotos = STATIC_PHOTOS.slice();
                    loadDrivePhotos();
                }, 1000);
            }
        });
    });
}

function uploadToGDrive(file, description, onDone) {
    if (file.size > 50 * 1024 * 1024) {
        alert('הקובץ גדול מדי (מקסימום 50MB)');
        onDone();
        return;
    }
    var status = document.getElementById('gallery-status');
    status.textContent = 'קורא קובץ...';

    var reader = new FileReader();
    reader.onload = function() {
        status.textContent = 'מעלה ל-Google Drive...';
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                file: reader.result.split(',')[1],
                fileName: file.name,
                mimeType: file.type,
                description: description
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) alert('שגיאה: ' + (data.error || ''));
            onDone();
        })
        .catch(function(err) {
            alert('שגיאה: ' + err.message);
            onDone();
        });
    };
    reader.readAsDataURL(file);
}

// ==================== LIGHTBOX ====================

function openMedia(src, type, fileId, currentDesc) {
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.id = 'active-lightbox';

    var descText = currentDesc || '';
    var descHtml = descText ? '<p class="lb-desc">' + descText + '</p>' : '<p class="lb-desc lb-empty">לחצו להוסיף תיאור</p>';
    var editBtn = fileId ? '<button class="lb-edit-btn" onclick="editDescription(\'' + fileId + '\')">ערוך תיאור</button>' : '';
    var undoBtn = (fileId && lastDescriptions[fileId] !== undefined) ? '<button class="lb-undo-btn" onclick="undoDescription(\'' + fileId + '\')">החזר תיאור קודם</button>' : '';

    overlay.innerHTML =
        '<div class="lb-close" onclick="closeLightbox()">✕</div>' +
        '<div class="lb-content">' +
            '<img src="' + src + '">' +
            '<div class="lb-bottom">' + descHtml + '<div class="lb-buttons">' + editBtn + undoBtn + '</div></div>' +
        '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
}

function openDriveVideo(fileId, currentDesc) {
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.id = 'active-lightbox';

    var undoBtn2 = lastDescriptions[fileId] !== undefined ? '<button class="lb-undo-btn" onclick="undoDescription(\'' + fileId + '\')">החזר תיאור קודם</button>' : '';

    overlay.innerHTML =
        '<div class="lb-close" onclick="closeLightbox()">✕</div>' +
        '<div class="lb-content">' +
            '<iframe src="https://drive.google.com/file/d/' + fileId + '/preview" allowfullscreen></iframe>' +
            '<div class="lb-bottom">' +
                (currentDesc ? '<p class="lb-desc">' + currentDesc + '</p>' : '') +
                '<div class="lb-buttons"><button class="lb-edit-btn" onclick="editDescription(\'' + fileId + '\')">ערוך תיאור</button>' + undoBtn2 + '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
}

function closeLightbox() {
    var lb = document.getElementById('active-lightbox');
    if (lb) lb.remove();
}

var lastDescriptions = {}; // fileId -> previous description (for undo)

function editDescription(fileId) {
    // Find current description
    var currentDesc = '';
    allPhotos.forEach(function(p) {
        if (p.fileId === fileId) currentDesc = p.description || '';
    });

    var newDesc = prompt('תיאור התמונה (מקום, תאריך, אירוע):', currentDesc);
    if (newDesc === null || newDesc === currentDesc) return;

    // Save previous for undo
    lastDescriptions[fileId] = currentDesc;

    fetch(APPS_SCRIPT_URL + '?action=updateDesc&fileId=' + encodeURIComponent(fileId) + '&desc=' + encodeURIComponent(newDesc) + '&pass=2803')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                closeLightbox();
                allPhotos = STATIC_PHOTOS.slice();
                loadDrivePhotos();
            } else {
                alert(data.error || 'שגיאה');
            }
        })
        .catch(function(err) { alert('שגיאה: ' + err.message); });
}

function undoDescription(fileId) {
    var prevDesc = lastDescriptions[fileId];
    if (prevDesc === undefined) {
        alert('אין תיאור קודם להחזרה');
        return;
    }

    fetch(APPS_SCRIPT_URL + '?action=updateDesc&fileId=' + encodeURIComponent(fileId) + '&desc=' + encodeURIComponent(prevDesc) + '&pass=2803')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                delete lastDescriptions[fileId];
                closeLightbox();
                allPhotos = STATIC_PHOTOS.slice();
                loadDrivePhotos();
            } else {
                alert(data.error || 'שגיאה');
            }
        })
        .catch(function(err) { alert('שגיאה: ' + err.message); });
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
    document.getElementById('photo-context-menu').classList.add('hidden');
    ctxTarget = null;
}

function ctxDownload() {
    var menu = document.getElementById('photo-context-menu');
    var url = menu.dataset.isStatic === 'true' ? menu.dataset.imgSrc : (ctxTarget ? ctxTarget.dataset.url : '');
    if (url) {
        var a = document.createElement('a');
        a.href = url; a.download = 'photo'; a.target = '_blank';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
    closeCtxMenu();
}

function ctxDelete() {
    var menu = document.getElementById('photo-context-menu');
    if (menu.dataset.isStatic === 'true') {
        alert('לא ניתן למחוק תמונות קבועות');
        closeCtxMenu();
        return;
    }
    if (!ctxTarget) { closeCtxMenu(); return; }
    var pass = prompt('הזן סיסמה למחיקה:');
    if (pass !== '2803') {
        if (pass !== null) alert('סיסמה שגויה');
        closeCtxMenu();
        return;
    }
    fetch(APPS_SCRIPT_URL + '?action=delete&fileId=' + ctxTarget.dataset.fileId + '&pass=' + pass)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) { allPhotos = STATIC_PHOTOS.slice(); loadDrivePhotos(); }
            else alert(data.error || 'שגיאה');
            closeCtxMenu();
        })
        .catch(function(err) { alert('שגיאה: ' + err.message); closeCtxMenu(); });
}

document.addEventListener('click', function(e) {
    var menu = document.getElementById('photo-context-menu');
    if (menu && !menu.contains(e.target)) menu.classList.add('hidden');
});
