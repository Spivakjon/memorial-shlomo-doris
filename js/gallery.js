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

var CATEGORIES = ['הכל', 'זוגי', 'משפחה', 'אירועים', 'אישי', 'הועלו וטרם מוינו', 'ללא תיוג'];
var activeFilter = 'הכל';
var activePersonFilter = null;
var allPhotos = [];
var pendingFiles = [];

function initGallery() {
    // Load saved tags for static photos
    try {
        var saved = JSON.parse(localStorage.getItem('photoTags') || '{}');
        STATIC_PHOTOS.forEach(function(p) {
            if (saved[p.src]) p.people = saved[p.src];
        });
    } catch(e) {}

    // Build unified gallery
    allPhotos = STATIC_PHOTOS.slice();

    // Render filter buttons
    renderFilters();
    renderPeopleFilter();

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
        btn.className = 'filter-btn' + (activeFilter === cat && !activePersonFilter ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = function() {
            activeFilter = cat;
            activePersonFilter = null;
            renderFilters();
            renderPeopleFilter();
            renderGallery();
        };
        container.appendChild(btn);
    });
}

function renderPeopleFilter() {
    var container = document.getElementById('people-filter');
    if (!container) return;
    container.innerHTML = '';

    // Collect all tagged people from all photos
    var allPeople = {};
    allPhotos.forEach(function(p) {
        if (p.people) {
            p.people.forEach(function(name) {
                allPeople[name] = (allPeople[name] || 0) + 1;
            });
        }
    });

    var names = Object.keys(allPeople);
    if (names.length === 0) return;

    // "הכל" button
    var allBtn = document.createElement('button');
    allBtn.className = 'people-filter-btn' + (!activePersonFilter ? ' active' : '');
    allBtn.textContent = 'כל האנשים';
    allBtn.onclick = function() {
        activePersonFilter = null;
        renderPeopleFilter();
        renderGallery();
    };
    container.appendChild(allBtn);

    names.sort();
    names.forEach(function(name) {
        var btn = document.createElement('button');
        btn.className = 'people-filter-btn' + (activePersonFilter === name ? ' active' : '');
        btn.textContent = name + ' (' + allPeople[name] + ')';
        btn.onclick = function() {
            activePersonFilter = name;
            activeFilter = 'הכל';
            renderFilters();
            renderPeopleFilter();
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
                    var cat = 'הועלו וטרם מוינו';

                    // Extract category tag from description
                    var catMatch = desc.match(/\[קטגוריה:([^\]]+)\]/);
                    if (catMatch) {
                        cat = catMatch[1];
                        desc = desc.replace(catMatch[0], '').trim();
                    }

                    // Extract people from tags or description
                    var people = [];
                    var peopleMatch = desc.match(/\[אנשים:([^\]]+)\]/);
                    if (peopleMatch) {
                        people = peopleMatch[1].split(',').map(function(s) { return s.trim(); });
                        desc = desc.replace(peopleMatch[0], '').trim();
                    } else {
                        // Fallback: scan description for names
                        var familyNames = ['שלמה', 'דוריס', 'אלי', 'שרית', 'לילך', 'שאולי', 'גילי', 'מיכל',
                            'שגיא', 'נועה', 'יניב', 'יהונתן', 'עדן', 'דין', 'ים', 'אדם', 'עומר', 'נועם', 'ליהיא'];
                        familyNames.forEach(function(name) {
                            if (desc.indexOf(name) !== -1) people.push(name);
                        });
                    }

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
                        driveUrl: f.url,
                        name: f.name || ''
                    });
                });
            }
            renderPeopleFilter();
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
        if (activeFilter === 'ללא תיוג') return !p.people || p.people.length === 0;
        return p.category === activeFilter;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="info-text">אין תמונות בקטגוריה זו</p>';
        return;
    }

    filtered.forEach(function(photo, filteredIdx) {
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
                '<div class="gallery-meta">' +
                (photo.description ? '<p class="gallery-caption">' + photo.description + '</p>' : '') +
                (photo.period ? '<p class="gallery-period">' + photo.period + '</p>' : '') +
                '</div>' +
                peopleTags;
            (function(i) { div.onclick = function() { openMediaByIndex(i); }; })(filteredIdx);
        } else {
            div.innerHTML =
                '<img src="' + imgSrc + '" alt="' + (photo.description || '') + '" loading="lazy">' +
                '<div class="gallery-meta">' +
                (photo.description ? '<p class="gallery-caption">' + photo.description + '</p>' : '') +
                (photo.period ? '<p class="gallery-period">' + photo.period + '</p>' : '') +
                '</div>' +
                peopleTags;
            (function(i) { div.onclick = function() { openMediaByIndex(i); }; })(filteredIdx);
        }

        // AI classify button for uploaded photos without category
        if (!photo.isStatic && photo.fileId && photo.category === 'הועלו וטרם מוינו') {
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

        // Build new description: keep original, just add/replace category tag
        var origDesc = photo.description || '';
        var newDesc = origDesc.replace(/\[קטגוריה:[^\]]+\]/g, '').trim();
        newDesc = newDesc + (newDesc ? ' ' : '') + '[קטגוריה:' + category + ']';

        // Use POST to avoid URL encoding issues with special characters
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateDesc',
                fileId: photo.fileId,
                desc: newDesc,
                pass: '2803'
            })
        })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    btnEl.textContent = category;
                    btnEl.style.background = '#4a8';
                    setTimeout(function() {
                        allPhotos = STATIC_PHOTOS.slice();
                        loadDrivePhotos();
                    }, 800);
                } else {
                    btnEl.textContent = 'נסה שוב';
                    btnEl.classList.remove('loading');
                }
            })
            .catch(function(err) {
                btnEl.textContent = 'נסה שוב';
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
    document.getElementById('file-input').value = '';
}

function submitUpload() {
    if (!pendingFiles.length || !APPS_SCRIPT_URL) return;
    var description = '';
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

// ==================== LIGHTBOX WITH NAVIGATION ====================

var currentLbIndex = -1;
var lbFilteredPhotos = [];
var touchStartX = 0;

function getFilteredPhotos() {
    return allPhotos.filter(function(p) {
        if (activePersonFilter) return p.people && p.people.indexOf(activePersonFilter) !== -1;
        if (activeFilter === 'הכל') return true;
        if (activeFilter === 'ללא תיוג') return !p.people || p.people.length === 0;
        return p.category === activeFilter;
    });
}

function openMediaByIndex(idx) {
    lbFilteredPhotos = getFilteredPhotos();
    if (idx < 0 || idx >= lbFilteredPhotos.length) return;
    currentLbIndex = idx;
    var photo = lbFilteredPhotos[idx];

    if (photo.isVideo) {
        openDriveVideo(photo.fileId, photo.description);
        return;
    }

    var src = photo.fullSrc || photo.src;
    var fileId = photo.fileId || photo.src;
    openMedia(src, 'image', fileId, photo.description);
}

function openMedia(src, type, fileId, currentDesc) {
    closeLightbox();
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.id = 'active-lightbox';

    var descText = currentDesc || '';
    var descHtml = descText ? '<p class="lb-desc">' + descText + '</p>' : '<p class="lb-desc lb-empty">לחצו להוסיף תיאור</p>';
    var editBtn = fileId ? '<button class="lb-edit-btn" onclick="editDescription(\'' + fileId + '\')">ערוך תיאור</button>' : '';
    var tagBtn = fileId ? '<button class="lb-tag-btn" onclick="openTagPanel(\'' + fileId + '\')">תייג אנשים</button>' : '';
    var undoBtn = (fileId && lastDescriptions[fileId] !== undefined) ? '<button class="lb-undo-btn" onclick="undoDescription(\'' + fileId + '\')">החזר קודם</button>' : '';
    var taggedPeople = getTaggedPeople(fileId);
    var tagsHtml = taggedPeople.length > 0 ? '<div class="lb-tags">' + taggedPeople.map(function(p) { return '<span class="lb-person-tag">' + p + '</span>'; }).join('') + '</div>' : '';

    var hasNav = lbFilteredPhotos.length > 1;
    var prevBtn = hasNav ? '<div class="lb-nav lb-prev" onclick="navigateLb(-1)">&#8249;</div>' : '';
    var nextBtn = hasNav ? '<div class="lb-nav lb-next" onclick="navigateLb(1)">&#8250;</div>' : '';
    var counter = hasNav ? '<span class="lb-counter">' + (currentLbIndex + 1) + ' / ' + lbFilteredPhotos.length + '</span>' : '';

    overlay.innerHTML =
        '<div class="lb-close" onclick="closeLightbox()">✕</div>' +
        prevBtn + nextBtn +
        '<div class="lb-content">' +
            '<img src="' + src + '">' +
            '<div class="lb-bottom">' + counter + tagsHtml + descHtml + '<div class="lb-buttons">' + tagBtn + editBtn + undoBtn + '</div></div>' +
            '<div class="tag-panel hidden" id="tag-panel"></div>' +
        '</div>';

    document.body.appendChild(overlay);

    // Close on background click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });

    // Swipe support for mobile
    overlay.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    overlay.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 60) {
            navigateLb(diff > 0 ? 1 : -1);
        }
    });

    // Keyboard navigation
    document.onkeydown = function(e) {
        if (e.key === 'ArrowLeft') navigateLb(1);   // RTL: left = next
        if (e.key === 'ArrowRight') navigateLb(-1);  // RTL: right = prev
        if (e.key === 'Escape') closeLightbox();
    };
}

function openDriveVideo(fileId, currentDesc) {
    closeLightbox();
    var overlay = document.createElement('div');
    overlay.className = 'media-lightbox';
    overlay.id = 'active-lightbox';

    var hasNav = lbFilteredPhotos.length > 1;
    var prevBtn = hasNav ? '<div class="lb-nav lb-prev" onclick="navigateLb(-1)">&#8249;</div>' : '';
    var nextBtn = hasNav ? '<div class="lb-nav lb-next" onclick="navigateLb(1)">&#8250;</div>' : '';
    var counter = hasNav ? '<span class="lb-counter">' + (currentLbIndex + 1) + ' / ' + lbFilteredPhotos.length + '</span>' : '';
    var undoBtn2 = lastDescriptions[fileId] !== undefined ? '<button class="lb-undo-btn" onclick="undoDescription(\'' + fileId + '\')">החזר קודם</button>' : '';

    overlay.innerHTML =
        '<div class="lb-close" onclick="closeLightbox()">✕</div>' +
        prevBtn + nextBtn +
        '<div class="lb-content">' +
            '<iframe src="https://drive.google.com/file/d/' + fileId + '/preview" allowfullscreen></iframe>' +
            '<div class="lb-bottom">' + counter +
                (currentDesc ? '<p class="lb-desc">' + currentDesc + '</p>' : '') +
                '<div class="lb-buttons"><button class="lb-edit-btn" onclick="editDescription(\'' + fileId + '\')">ערוך תיאור</button>' + undoBtn2 + '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
    });
}

function navigateLb(dir) {
    var newIdx = currentLbIndex + dir;
    if (newIdx < 0) newIdx = lbFilteredPhotos.length - 1;
    if (newIdx >= lbFilteredPhotos.length) newIdx = 0;
    openMediaByIndex(newIdx);
}

function closeLightbox() {
    var lb = document.getElementById('active-lightbox');
    if (lb) lb.remove();
    document.onkeydown = null;
}

// ==================== PEOPLE TAGGING ====================

var FAMILY_GROUPS = [
    {
        label: 'סבא וסבתא',
        members: ['שלמה', 'דוריס']
    },
    {
        label: 'משפחת אלי לוי',
        members: ['אלי לוי', 'שרית', 'שגיא', 'נועה לוי', 'יניב', 'אנטוניו']
    },
    {
        label: 'משפחת לילך ושאולי ספיבק',
        members: ['לילך ספיבק', 'שאולי', 'אלי ספיבק', 'לילך ספיבק-אשת אלי', 'יהונתן', 'עדן', 'דין', 'ים', 'אדם']
    },
    {
        label: 'נינים - ספיבק',
        members: ['עלמה', 'עידן', 'מיה', 'ליאו']
    },
    {
        label: 'משפחת גילי לוי',
        members: ['גילי', 'מיכל', 'עומר', 'נועם', 'ליהיא']
    }
];

var currentTagFileId = null;
var currentTagged = [];

function getTaggedPeople(fileId) {
    // Check allPhotos first
    var people = [];
    allPhotos.forEach(function(p) {
        if ((p.fileId === fileId || p.src === fileId) && p.people) people = p.people;
    });
    // Also check localStorage for static photo tags
    if (people.length === 0) {
        try {
            var saved = JSON.parse(localStorage.getItem('photoTags') || '{}');
            if (saved[fileId]) people = saved[fileId];
        } catch(e) {}
    }
    return people;
}

function openTagPanel(fileId) {
    currentTagFileId = fileId;
    currentTagged = getTaggedPeople(fileId).slice();

    var panel = document.getElementById('tag-panel');
    panel.classList.remove('hidden');

    var html = '<div class="tag-header"><h4>תייגו מי בתמונה</h4></div>';
    html += '<div class="tag-groups">';

    FAMILY_GROUPS.forEach(function(group) {
        html += '<div class="tag-group">';
        html += '<p class="tag-group-label">' + group.label + '</p>';
        html += '<div class="tag-group-members">';
        group.members.forEach(function(name) {
            var isTagged = currentTagged.indexOf(name) !== -1;
            html += '<button class="tag-member-btn' + (isTagged ? ' tagged' : '') + '" onclick="toggleTag(this, \'' + name.replace(/'/g, "\\'") + '\')">' + name + '</button>';
        });
        html += '</div></div>';
    });

    html += '</div>';
    html += '<div class="tag-actions">';
    html += '<button class="tag-save-btn" onclick="saveTagging()">שמור</button>';
    html += '<button class="tag-cancel-btn" onclick="closeTagPanel()">ביטול</button>';
    html += '</div>';

    panel.innerHTML = html;
}

function toggleTag(btn, name) {
    var idx = currentTagged.indexOf(name);
    if (idx !== -1) {
        currentTagged.splice(idx, 1);
        btn.classList.remove('tagged');
    } else {
        currentTagged.push(name);
        btn.classList.add('tagged');
    }
}

function closeTagPanel() {
    var panel = document.getElementById('tag-panel');
    if (panel) panel.classList.add('hidden');
    currentTagFileId = null;
    currentTagged = [];
}

function saveTagging() {
    if (!currentTagFileId) return;

    var btn = document.querySelector('.tag-save-btn');
    if (btn) { btn.textContent = 'שומר...'; btn.disabled = true; }

    // Check if this is a Drive photo or static
    var isDrive = false;
    allPhotos.forEach(function(p) {
        if (p.fileId === currentTagFileId && !p.isStatic) isDrive = true;
    });

    if (isDrive) {
        // Save to Google Drive
        var desc = '';
        allPhotos.forEach(function(p) {
            if (p.fileId === currentTagFileId) desc = p.description || '';
        });
        desc = desc.replace(/\[אנשים:[^\]]*\]/g, '').trim();
        if (currentTagged.length > 0) {
            desc = desc + (desc ? ' ' : '') + '[אנשים:' + currentTagged.join(',') + ']';
        }

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateDesc', fileId: currentTagFileId, desc: desc, pass: '2803' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                finishTagSave();
            } else {
                alert(data.error || 'שגיאה');
                if (btn) { btn.textContent = 'שמור'; btn.disabled = false; }
            }
        })
        .catch(function(err) {
            alert('שגיאה: ' + err.message);
            if (btn) { btn.textContent = 'שמור'; btn.disabled = false; }
        });
    } else {
        // Save to localStorage for static photos
        try {
            var saved = JSON.parse(localStorage.getItem('photoTags') || '{}');
            saved[currentTagFileId] = currentTagged.slice();
            localStorage.setItem('photoTags', JSON.stringify(saved));
        } catch(e) {}

        // Update the static photo in allPhotos
        allPhotos.forEach(function(p) {
            if (p.src === currentTagFileId) p.people = currentTagged.slice();
        });
        // Also update STATIC_PHOTOS
        STATIC_PHOTOS.forEach(function(p) {
            if (p.src === currentTagFileId) p.people = currentTagged.slice();
        });

        finishTagSave();
    }
}

function finishTagSave() {
    closeTagPanel();
    closeLightbox();
    allPhotos = STATIC_PHOTOS.slice();
    if (APPS_SCRIPT_URL) loadDrivePhotos();
    else renderGallery();
}

// ==================== DESCRIPTION EDITING ====================

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

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateDesc', fileId: fileId, desc: newDesc, pass: '2803' })
    })
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

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateDesc', fileId: fileId, desc: prevDesc, pass: '2803' })
    })
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

// ==================== DUPLICATE DETECTION ====================

function initDuplicateScanner() {
    var btn = document.getElementById('scan-duplicates-btn');
    if (btn) btn.addEventListener('click', scanForDuplicates);
}

function scanForDuplicates() {
    var btn = document.getElementById('scan-duplicates-btn');
    var status = document.getElementById('dup-status');
    var results = document.getElementById('duplicates-results');

    // Only scan Drive photos (static photos are curated)
    var drivePhotos = allPhotos.filter(function(p) { return !p.isStatic && p.fileId && !p.isVideo; });

    if (drivePhotos.length < 2) {
        status.textContent = 'צריך לפחות 2 תמונות מ-Drive כדי לסרוק';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'סורק...';
    status.textContent = 'טוען תמונות להשוואה... 0/' + drivePhotos.length;
    results.innerHTML = '';

    // Load all thumbnails and compute fingerprints
    var fingerprints = [];
    var loaded = 0;

    drivePhotos.forEach(function(photo, idx) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var fp = getImageFingerprint(img);
            fingerprints.push({ photo: photo, fingerprint: fp, index: idx });
            loaded++;
            status.textContent = 'טוען תמונות להשוואה... ' + loaded + '/' + drivePhotos.length;
            if (loaded === drivePhotos.length) {
                findDuplicates(fingerprints, results, status, btn);
            }
        };
        img.onerror = function() {
            loaded++;
            status.textContent = 'טוען תמונות להשוואה... ' + loaded + '/' + drivePhotos.length;
            if (loaded === drivePhotos.length) {
                findDuplicates(fingerprints, results, status, btn);
            }
        };
        img.src = photo.src;
    });
}

function getImageFingerprint(img) {
    var canvas = document.createElement('canvas');
    var size = 16;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    try {
        var data = ctx.getImageData(0, 0, size, size).data;
        // Convert to grayscale values
        var grays = [];
        for (var i = 0; i < data.length; i += 4) {
            grays.push(Math.round(data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114));
        }
        return grays;
    } catch(e) {
        return null;
    }
}

function compareFingerprints(fp1, fp2) {
    if (!fp1 || !fp2 || fp1.length !== fp2.length) return 0;
    var totalDiff = 0;
    for (var i = 0; i < fp1.length; i++) {
        totalDiff += Math.abs(fp1[i] - fp2[i]);
    }
    var maxDiff = 255 * fp1.length;
    return 1 - (totalDiff / maxDiff);
}

function findDuplicates(fingerprints, resultsEl, statusEl, btn) {
    var pairs = [];
    var threshold = 0.92; // 92% similarity

    // Also check name similarity
    for (var i = 0; i < fingerprints.length; i++) {
        for (var j = i + 1; j < fingerprints.length; j++) {
            var similarity = compareFingerprints(fingerprints[i].fingerprint, fingerprints[j].fingerprint);
            var nameSim = fileNameSimilarity(fingerprints[i].photo, fingerprints[j].photo);

            if (similarity >= threshold || nameSim >= 0.85) {
                pairs.push({
                    a: fingerprints[i].photo,
                    b: fingerprints[j].photo,
                    similarity: Math.max(similarity, nameSim),
                    type: similarity >= threshold ? 'visual' : 'name'
                });
            }
        }
    }

    btn.disabled = false;
    btn.textContent = 'סרוק כפולות';

    if (pairs.length === 0) {
        statusEl.textContent = 'לא נמצאו תמונות כפולות!';
        resultsEl.innerHTML = '<p class="info-text">נסרקו ' + fingerprints.length + ' תמונות - הכל נקי</p>';
        return;
    }

    // Sort by similarity descending
    pairs.sort(function(a, b) { return b.similarity - a.similarity; });

    statusEl.textContent = 'נמצאו ' + pairs.length + ' זוגות חשודים';
    resultsEl.innerHTML = '';

    pairs.forEach(function(pair, idx) {
        var pct = Math.round(pair.similarity * 100);
        var div = document.createElement('div');
        div.className = 'dup-pair';
        div.innerHTML =
            '<div class="dup-pair-header">' +
                '<span class="dup-similarity">' + pct + '% דמיון' + (pair.type === 'name' ? ' (שם קובץ)' : '') + '</span>' +
            '</div>' +
            '<div class="dup-pair-photos">' +
                '<div class="dup-photo" id="dup-a-' + idx + '">' +
                    '<img src="' + pair.a.src + '" alt="">' +
                    '<p class="dup-desc">' + (pair.a.description || 'ללא תיאור') + '</p>' +
                    '<button class="dup-delete-btn" onclick="deleteDuplicate(\'' + pair.a.fileId + '\', this)">מחק תמונה זו</button>' +
                '</div>' +
                '<div class="dup-photo" id="dup-b-' + idx + '">' +
                    '<img src="' + pair.b.src + '" alt="">' +
                    '<p class="dup-desc">' + (pair.b.description || 'ללא תיאור') + '</p>' +
                    '<button class="dup-delete-btn" onclick="deleteDuplicate(\'' + pair.b.fileId + '\', this)">מחק תמונה זו</button>' +
                '</div>' +
            '</div>';
        resultsEl.appendChild(div);
    });
}

function fileNameSimilarity(photoA, photoB) {
    // Compare original file names from Drive (extracted from description or src)
    var nameA = extractFileName(photoA);
    var nameB = extractFileName(photoB);
    if (!nameA || !nameB) return 0;

    // Strip extension and normalize
    nameA = nameA.replace(/\.[^.]+$/, '').replace(/[\s_-]+/g, '').toLowerCase();
    nameB = nameB.replace(/\.[^.]+$/, '').replace(/[\s_-]+/g, '').toLowerCase();

    if (nameA === nameB) return 1;

    // Check if one contains the other (e.g. "photo" vs "photo(1)")
    var cleanA = nameA.replace(/\(\d+\)$/, '');
    var cleanB = nameB.replace(/\(\d+\)$/, '');
    if (cleanA === cleanB) return 0.95;

    return 0;
}

function extractFileName(photo) {
    // Try to get file name from the src URL or description
    if (photo.name) return photo.name;
    return '';
}

function deleteDuplicate(fileId, btnEl) {
    if (!confirm('למחוק את התמונה הזו?')) return;

    btnEl.disabled = true;
    btnEl.textContent = 'מוחק...';

    fetch(APPS_SCRIPT_URL + '?action=delete&fileId=' + fileId + '&pass=2803')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success) {
                // Mark as deleted visually
                var photoDiv = btnEl.parentElement;
                photoDiv.classList.add('dup-deleted');
                btnEl.textContent = 'נמחקה';
                btnEl.disabled = true;

                // Refresh gallery data
                allPhotos = STATIC_PHOTOS.slice();
                loadDrivePhotos();
            } else {
                alert(data.error || 'שגיאה במחיקה');
                btnEl.disabled = false;
                btnEl.textContent = 'מחק תמונה זו';
            }
        })
        .catch(function(err) {
            alert('שגיאה: ' + err.message);
            btnEl.disabled = false;
            btnEl.textContent = 'מחק תמונה זו';
        });
}
