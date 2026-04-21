// app.js - Main application logic

const CONFIG = {
    password: '1234',
    people: {
        shlomo: {
            name: 'שלמה לוי',
            fullNameHebrew: 'שלמה לוי',
            gender: 'male',
            deathDateGregorian: '2021-03-28',
            fatherName: 'חיים',
            deathDateHebrew: 'ט"ז ניסן תשפ"א',
            cemetery: 'בית עלמין קדימה צורן',
            lettersForTehillim: ['ש', 'ל', 'מ', 'ה', 'ל', 'ו', 'י'],
            nameGroups: {
                all: [0, 1, 2, 3, 4, 5, 6],
                first: [0, 1, 2, 3],
                last: [4, 5, 6]
            }
        },
        doris: {
            name: 'דוריס (חנה) לוי',
            fullNameHebrew: 'דוריס חנה לוי',
            gender: 'female',
            deathDateGregorian: '2021-04-27',
            fatherName: 'פלורה',
            deathDateHebrew: 'י"ז אייר תשפ"א',
            cemetery: 'בית עלמין קדימה צורן',
            lettersForTehillim: ['ד', 'ו', 'ר', 'י', 'ס', 'ח', 'נ', 'ה', 'ל', 'ו', 'י'],
            nameGroups: {
                all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                doris: [0, 1, 2, 3, 4],
                chana: [5, 6, 7],
                last: [8, 9, 10]
            }
        }
    },
    neshamaLetters: ['נ', 'ש', 'מ', 'ה']
};

// State
let state = {
    currentSection: 'main',
    azkara: loadAzkara(),
    members: loadMembers(),
    selectedLetters: loadSelectedLetters()
};

// ==================== TIME ELAPSED ====================

function calcElapsed(deathDateStr) {
    const death = new Date(deathDateStr + 'T00:00:00');
    const now = new Date();
    let years = now.getFullYear() - death.getFullYear();
    let months = now.getMonth() - death.getMonth();
    let days = now.getDate() - death.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'שנה' : 'שנים'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'חודש' : 'חודשים'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'יום' : 'ימים'}`);
    return parts.join(', ');
}

function updateElapsedTimes() {
    document.getElementById('elapsed-shlomo').textContent = calcElapsed(CONFIG.people.shlomo.deathDateGregorian);
    document.getElementById('elapsed-doris').textContent = calcElapsed(CONFIG.people.doris.deathDateGregorian);
}

// ==================== AZKARA DISPLAY ====================

function getPersonTitle(forPerson) {
    if (forPerson === 'both') return 'שלמה לוי ז"ל ודוריס (חנה) לוי ז"ל';
    if (forPerson === 'shlomo') return CONFIG.people.shlomo.name + ' ז"ל';
    return CONFIG.people.doris.name + ' ז"ל';
}

function formatAzkaraDate(azkara) {
    const dateObj = new Date(azkara.date + 'T00:00:00');
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = days[dateObj.getDay()];
    const dateParts = azkara.date.split('-');
    return `יום ${dayName}, ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
}

function updateMemorialAzkara() {
    const azkara = state.azkara;
    const container = document.getElementById('memorial-azkara');
    const dateObj = new Date(azkara.date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        container.innerHTML = '';
        return;
    }

    let countdownText = '';
    if (diffDays === 0) countdownText = 'היום!';
    else if (diffDays === 1) countdownText = 'מחר!';
    else countdownText = `בעוד ${diffDays} ימים`;

    // Calculate years since death
    var yearsText = azkara.yearLabel;
    if (azkara.forPerson === 'shlomo' || azkara.forPerson === 'both') {
        var deathYear = 2021;
        var azkaraYear = parseInt(azkara.date.split('-')[0]);
        var years = azkaraYear - deathYear;
        yearsText = years + ' שנים';
    }

    container.innerHTML = `
        <div class="azkara-banner">
            <h3>אזכרה - ${yearsText}</h3>
            <p><strong>${getPersonTitle(azkara.forPerson)}</strong></p>
            <p>${formatAzkaraDate(azkara)} בשעה ${azkara.time}</p>
            <p>${azkara.location}</p>
            <p class="countdown">${countdownText}</p>
        </div>
    `;
}

// ==================== AUTH (disabled) ====================

function initAuth() {
    initApp();
}

// ==================== DARK MODE ====================

function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    }
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        toggle.textContent = isDark ? '☀️' : '🌙';
    });
}

// ==================== WHATSAPP SHARE ====================

function shareWhatsApp() {
    var azkara = state.azkara;
    var title = getPersonTitle(azkara.forPerson);
    var dateParts = azkara.date.split('-');
    var formattedDate = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];

    var text = 'אזכרה ' + azkara.yearLabel + '\n' +
        title + '\n' +
        formattedDate + ' בשעה ' + azkara.time + '\n' +
        azkara.location + '\n\n' +
        'לפרטים והורדת סדר האזכרה:\n' +
        window.location.href;

    var waUrl = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.location.href = waUrl;
}

// ==================== STATIC PHOTO MENU ====================

function initStaticPhotoMenu() {
    document.querySelectorAll('.photos-section .photo-item img').forEach(function(img) {
        // Right-click
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showStaticPhotoMenu(e, this);
        });
        // Long press mobile
        var timer;
        img.addEventListener('touchstart', function(e) {
            var el = this;
            timer = setTimeout(function() { showStaticPhotoMenu(e, el); }, 600);
        });
        img.addEventListener('touchend', function() { clearTimeout(timer); });
        img.addEventListener('touchmove', function() { clearTimeout(timer); });
    });
}

function showStaticPhotoMenu(e, imgEl) {
    var menu = document.getElementById('photo-context-menu');
    // Store reference
    menu.dataset.imgSrc = imgEl.src;
    menu.dataset.isStatic = 'true';
    menu.classList.remove('hidden');
    var x = e.clientX || (e.touches && e.touches[0].clientX) || 100;
    var y = e.clientY || (e.touches && e.touches[0].clientY) || 100;
    menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';
}

// ==================== MANAGE PASSWORD ====================

function initManageLock() {
    var btn = document.getElementById('manage-unlock-btn');
    var input = document.getElementById('manage-password');
    var error = document.getElementById('manage-error');

    if (sessionStorage.getItem('manageUnlocked') === 'true') {
        unlockManage();
        return;
    }

    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') tryUnlock();
    });

    function tryUnlock() {
        if (input.value === '2803') {
            sessionStorage.setItem('manageUnlocked', 'true');
            unlockManage();
        } else {
            error.classList.remove('hidden');
            input.value = '';
        }
    }
}

function unlockManage() {
    document.getElementById('manage-lock').classList.add('hidden');
    document.getElementById('manage-content').classList.remove('hidden');
}

// ==================== NAVIGATION ====================

function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });
}

function switchSection(sectionId) {
    state.currentSection = sectionId;
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(sectionId).classList.remove('hidden');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// ==================== LETTERS (Manage tab - advanced) ====================

function initLetters() {
    renderLetterCheckboxes('letters-shlomo', CONFIG.people.shlomo, 'shlomo');
    renderLetterCheckboxes('letters-doris', CONFIG.people.doris, 'doris');
}

function renderLetterCheckboxes(containerId, person, personKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    person.lettersForTehillim.forEach((letter, index) => {
        const key = `${personKey}_${index}`;
        const isSelected = state.selectedLetters[key] !== false;

        const box = document.createElement('div');
        box.className = 'letter-box' + (isSelected ? ' selected' : '');
        box.dataset.key = key;
        box.innerHTML = `<span class="letter">${letter}</span><span class="letter-check">${isSelected ? '✓' : ''}</span>`;
        box.addEventListener('click', () => toggleLetter(key, box));
        container.appendChild(box);
    });

    // Neshama letters
    const neshamaLabel = document.createElement('div');
    neshamaLabel.className = 'neshama-separator';
    neshamaLabel.textContent = 'אותיות נשמה:';
    container.appendChild(neshamaLabel);

    CONFIG.neshamaLetters.forEach((letter, index) => {
        const key = `${personKey}_neshama_${index}`;
        const isSelected = state.selectedLetters[key] === true;

        const box = document.createElement('div');
        box.className = 'letter-box neshama-letter' + (isSelected ? ' selected' : '');
        box.dataset.key = key;
        box.innerHTML = `<span class="letter">${letter}</span><span class="letter-check">${isSelected ? '✓' : ''}</span>`;
        box.addEventListener('click', () => toggleLetter(key, box));
        container.appendChild(box);
    });
}

function toggleLetter(key, boxElement) {
    const isNeshama = key.includes('_neshama_');
    const currentlySelected = isNeshama ? state.selectedLetters[key] === true : state.selectedLetters[key] !== false;
    state.selectedLetters[key] = !currentlySelected;
    saveSelectedLetters();

    if (!currentlySelected) {
        boxElement.classList.add('selected');
        boxElement.querySelector('.letter-check').textContent = '✓';
    } else {
        boxElement.classList.remove('selected');
        boxElement.querySelector('.letter-check').textContent = '';
    }
}

function quickSelect(personKey, group) {
    const person = CONFIG.people[personKey];

    if (group === 'none') {
        person.lettersForTehillim.forEach((_, i) => { state.selectedLetters[`${personKey}_${i}`] = false; });
        CONFIG.neshamaLetters.forEach((_, i) => { state.selectedLetters[`${personKey}_neshama_${i}`] = false; });
    } else if (group === 'neshama') {
        // Add neshama without clearing others
        CONFIG.neshamaLetters.forEach((_, i) => { state.selectedLetters[`${personKey}_neshama_${i}`] = true; });
    } else {
        // Clear all first
        person.lettersForTehillim.forEach((_, i) => { state.selectedLetters[`${personKey}_${i}`] = false; });
        CONFIG.neshamaLetters.forEach((_, i) => { state.selectedLetters[`${personKey}_neshama_${i}`] = false; });
        // Select group
        const indices = person.nameGroups[group] || [];
        indices.forEach(i => { state.selectedLetters[`${personKey}_${i}`] = true; });
    }

    saveSelectedLetters();
    renderLetterCheckboxes(
        personKey === 'shlomo' ? 'letters-shlomo' : 'letters-doris',
        person, personKey
    );
}

// ==================== AZKARA ADMIN ====================

function initAzkaraAdmin() {
    document.getElementById('save-azkara-btn').addEventListener('click', saveAzkaraFromForm);

    const azkara = state.azkara;
    if (azkara.date) document.getElementById('azkara-date').value = azkara.date;
    if (azkara.time) document.getElementById('azkara-time').value = azkara.time;
    if (azkara.location) document.getElementById('azkara-location').value = azkara.location;
    if (azkara.yearLabel) document.getElementById('azkara-year-label').value = azkara.yearLabel;
    if (azkara.forPerson) document.getElementById('azkara-for').value = azkara.forPerson;
}

function saveAzkaraFromForm() {
    state.azkara = {
        forPerson: document.getElementById('azkara-for').value,
        date: document.getElementById('azkara-date').value,
        time: document.getElementById('azkara-time').value,
        location: document.getElementById('azkara-location').value,
        yearLabel: document.getElementById('azkara-year-label').value
    };
    localStorage.setItem('azkara', JSON.stringify(state.azkara));
    updateMemorialAzkara();

    const msg = document.getElementById('save-success');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

// ==================== MEMBERS ====================

function initMembers() {
    document.getElementById('add-member-btn').addEventListener('click', addMember);
    renderMembers();
}

function addMember() {
    const name = document.getElementById('member-name').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const phone = normalizeIsraeliPhone(document.getElementById('member-phone').value);
    if (!name) { alert('נא להזין שם'); return; }

    state.members.push({ name, email, phone, id: Date.now() });
    localStorage.setItem('members', JSON.stringify(state.members));
    document.getElementById('member-name').value = '';
    document.getElementById('member-email').value = '';
    document.getElementById('member-phone').value = '';
    renderMembers();
}

function removeMember(id) {
    state.members = state.members.filter(m => m.id !== id);
    localStorage.setItem('members', JSON.stringify(state.members));
    renderMembers();
}

function renderMembers() {
    const ul = document.getElementById('members-ul');
    if (state.members.length === 0) {
        ul.innerHTML = '<li>אין משתתפים רשומים</li>';
        return;
    }
    ul.innerHTML = '';
    state.members.forEach(member => {
        const li = document.createElement('li');
        const phoneDisplay = member.phone ? normalizeIsraeliPhone(member.phone) : '';
        const waNumber = phoneDisplay.replace(/[^\d]/g, '');
        const phoneLinks = phoneDisplay ? `
            <a href="tel:${escapeHtml(phoneDisplay)}" class="member-link">חייג</a>
            <a href="https://wa.me/${escapeHtml(waNumber)}" target="_blank" rel="noopener" class="member-link">WhatsApp</a>
        ` : '';
        li.innerHTML = `
            <div class="member-info">
                <strong>${escapeHtml(member.name)}</strong>
                ${member.email ? `<span class="member-meta">${escapeHtml(member.email)}</span>` : ''}
                ${phoneDisplay ? `<span class="member-meta" dir="ltr">${escapeHtml(phoneDisplay)}</span>` : ''}
            </div>
            <div class="member-actions">
                ${phoneLinks}
                <button onclick="removeMember(${member.id})" class="btn-secondary">הסר</button>
            </div>
        `;
        ul.appendChild(li);
    });
}

// ==================== CALENDAR ====================

function downloadCalendarEvent() {
    try {
        const azkara = state.azkara;
        if (!azkara || !azkara.date || !azkara.time) {
            alert('חסר תאריך או שעה לאזכרה');
            return;
        }
        const title = 'אזכרה ' + azkara.yearLabel + ' - ' + getPersonTitle(azkara.forPerson);
        const description = title + ' | ' + azkara.location;

        const dateStr = azkara.date.replace(/-/g, '');
        const timeStr = azkara.time.replace(':', '') + '00';
        const startDate = new Date(azkara.date + 'T' + azkara.time + ':00');
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const endTimeStr = endDate.getHours().toString().padStart(2, '0') +
            endDate.getMinutes().toString().padStart(2, '0') + '00';

        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const stamp = now.getUTCFullYear().toString() +
            pad(now.getUTCMonth() + 1) +
            pad(now.getUTCDate()) + 'T' +
            pad(now.getUTCHours()) +
            pad(now.getUTCMinutes()) +
            pad(now.getUTCSeconds()) + 'Z';

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Memorial//Azkara//HE',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VTIMEZONE',
            'TZID:Asia/Jerusalem',
            'BEGIN:STANDARD',
            'DTSTART:19700101T000000',
            'TZOFFSETFROM:+0300',
            'TZOFFSETTO:+0200',
            'TZNAME:IST',
            'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
            'END:STANDARD',
            'BEGIN:DAYLIGHT',
            'DTSTART:19700101T000000',
            'TZOFFSETFROM:+0200',
            'TZOFFSETTO:+0300',
            'TZNAME:IDT',
            'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1FR',
            'END:DAYLIGHT',
            'END:VTIMEZONE',
            'BEGIN:VEVENT',
            'UID:azkara-' + dateStr + '-' + timeStr + '@memorial-levi',
            'DTSTAMP:' + stamp,
            'DTSTART;TZID=Asia/Jerusalem:' + dateStr + 'T' + timeStr,
            'DTEND;TZID=Asia/Jerusalem:' + dateStr + 'T' + endTimeStr,
            'SUMMARY:' + title,
            'LOCATION:' + azkara.location,
            'DESCRIPTION:' + description,
            'BEGIN:VALARM',
            'TRIGGER:-P7D',
            'ACTION:DISPLAY',
            'DESCRIPTION:בעוד שבוע: ' + title,
            'END:VALARM',
            'BEGIN:VALARM',
            'TRIGGER:-P1D',
            'ACTION:DISPLAY',
            'DESCRIPTION:מחר: ' + title,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ];

        const icsText = lines.join('\r\n');
        const filename = 'azkara-' + dateStr + '.ics';

        const blob = new Blob(['\uFEFF' + icsText], { type: 'text/calendar;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch (e) {
        alert('שגיאה ביצירת אירוע יומן: ' + e.message);
    }
}

// ==================== PDF GENERATION ====================

function getSelectedLettersForPerson(personKey) {
    const person = CONFIG.people[personKey];
    const selected = [];
    person.lettersForTehillim.forEach((letter, index) => {
        if (state.selectedLetters[`${personKey}_${index}`] !== false) selected.push(letter);
    });
    CONFIG.neshamaLetters.forEach((letter, index) => {
        if (state.selectedLetters[`${personKey}_neshama_${index}`] === true) selected.push(letter);
    });
    return selected;
}

function getFirstNameLetters(personKey) {
    const person = CONFIG.people[personKey];
    const indices = personKey === 'shlomo' ? person.nameGroups.first : person.nameGroups.doris;
    return indices.map(i => person.lettersForTehillim[i]);
}

function buildTehillimHtml(letters, title) {
    let html = `<div class="pdf-divider">✦</div>`;
    html += `<h2 class="pdf-section-title">תהילים לפי אותיות השם - ${title}</h2>`;
    const seen = new Set();
    letters.forEach(letter => {
        if (PSALM_119[letter] && !seen.has(letter)) {
            seen.add(letter);
            html += `<h3 class="pdf-letter-title">${PSALM_119[letter].title}</h3>`;
            html += `<p class="pdf-prayer">${PSALM_119[letter].verses}</p>`;
        }
    });
    return html;
}

function buildPrayerSection(prayer) {
    let html = `<h2 class="pdf-section-title">${prayer.title}</h2>`;
    if (prayer.instruction) html += `<p class="pdf-instruction">${prayer.instruction}</p>`;
    html += `<p class="pdf-prayer">${prayer.text}</p>`;
    return html;
}

function formatDate(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function openPdfView(bodyHtml, title) {
    // Create a full-screen overlay with the PDF content for printing
    let overlay = document.getElementById('pdf-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pdf-overlay';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="pdf-toolbar">
            <button onclick="printPdf()">שמור / הדפס PDF</button>
            <button onclick="closePdfView()" class="pdf-close-btn">✕ סגור</button>
        </div>
        <div class="pdf-body" id="pdf-body">
            ${bodyHtml}
        </div>
    `;
    overlay.classList.add('pdf-visible');
    document.body.classList.add('pdf-mode');
}

function printPdf() {
    window.print();
}

function closePdfView() {
    const overlay = document.getElementById('pdf-overlay');
    if (overlay) {
        overlay.classList.remove('pdf-visible');
        overlay.innerHTML = '';
    }
    document.body.classList.remove('pdf-mode');
}

// Quick PDF from main page
function generateQuickPdf() {
    try {
    const azkara = state.azkara;
    const checkedItems = [];
    document.querySelectorAll('#main-seder-checklist input:checked').forEach(cb => checkedItems.push(cb.value));

    const people = [];
    if (azkara.forPerson === 'both' || azkara.forPerson === 'shlomo') people.push({ data: CONFIG.people.shlomo, key: 'shlomo' });
    if (azkara.forPerson === 'both' || azkara.forPerson === 'doris') people.push({ data: CONFIG.people.doris, key: 'doris' });

    let html = `<h1 class="pdf-main-title">סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1 class="pdf-sub-title">${getPersonTitle(azkara.forPerson)}</h1>`;

    people.forEach(p => {
        const prefix = p.data.gender === 'male' ? 'נפטר' : 'נפטרה';
        html += `<p class="pdf-info">${p.data.name} - ${prefix}: ${p.data.deathDateHebrew} | ${formatDate(p.data.deathDateGregorian)}</p>`;
    });

    const dateParts = azkara.date.split('-');
    html += `<p class="pdf-info">${dateParts[2]}/${dateParts[1]}/${dateParts[0]} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="pdf-divider">✦ ✦ ✦</div>`;

    if (checkedItems.includes('candle')) html += buildPrayerSection(PRAYERS.candle);

    if (checkedItems.includes('tehillim')) {
        people.forEach(p => {
            const letters = getFirstNameLetters(p.key);
            const firstName = p.key === 'shlomo' ? 'שלמה' : 'דוריס';
            html += buildTehillimHtml(letters, firstName);
        });
    }

    if (checkedItems.includes('neshama')) {
        const seen = new Set();
        html += `<div class="pdf-divider">✦</div>`;
        html += `<h2 class="pdf-section-title">תהילים - אותיות נשמה</h2>`;
        CONFIG.neshamaLetters.forEach(letter => {
            if (PSALM_119[letter] && !seen.has(letter)) {
                seen.add(letter);
                html += `<h3 class="pdf-letter-title">${PSALM_119[letter].title}</h3>`;
                html += `<p class="pdf-prayer">${PSALM_119[letter].verses}</p>`;
            }
        });
    }

    if (checkedItems.includes('psalm91')) html += buildPrayerSection(PRAYERS.psalm91);
    if (checkedItems.includes('psalm121')) html += buildPrayerSection(PRAYERS.psalm121);

    if (checkedItems.includes('hashkava')) {
        people.forEach(p => {
            html += buildPrayerSection(p.data.gender === 'male' ? PRAYERS.hashkava_male : PRAYERS.hashkava_female);
        });
    }

    if (checkedItems.includes('kaddish')) html += buildPrayerSection(PRAYERS.kaddish);

    html += `<div class="pdf-divider">✦ ✦ ✦</div>`;
    html += `<p class="pdf-footer">ת.נ.צ.ב.ה</p>`;

    openPdfView(html, 'סדר אזכרה');
    } catch (e) { alert('שגיאה ביצירת PDF: ' + e.message); }
}

// Advanced PDF from manage page
function generateAdvancedPdf() {
    try {
    const azkara = state.azkara;
    const checkedItems = [];
    document.querySelectorAll('#adv-seder-checklist input:checked').forEach(cb => checkedItems.push(cb.value));

    let html = `<h1 class="pdf-main-title">סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1 class="pdf-sub-title">${getPersonTitle(azkara.forPerson)}</h1>`;

    const dateParts = azkara.date.split('-');
    html += `<p class="pdf-info">${dateParts[2]}/${dateParts[1]}/${dateParts[0]} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="pdf-divider">✦ ✦ ✦</div>`;

    if (checkedItems.includes('candle')) html += buildPrayerSection(PRAYERS.candle);

    if (checkedItems.includes('tehillim_shlomo')) {
        const letters = getSelectedLettersForPerson('shlomo');
        if (letters.length > 0) html += buildTehillimHtml(letters, CONFIG.people.shlomo.fullNameHebrew);
    }

    if (checkedItems.includes('tehillim_doris')) {
        const letters = getSelectedLettersForPerson('doris');
        if (letters.length > 0) html += buildTehillimHtml(letters, CONFIG.people.doris.fullNameHebrew);
    }

    if (checkedItems.includes('psalm91')) html += buildPrayerSection(PRAYERS.psalm91);
    if (checkedItems.includes('psalm121')) html += buildPrayerSection(PRAYERS.psalm121);
    if (checkedItems.includes('hashkava_shlomo')) html += buildPrayerSection(PRAYERS.hashkava_male);
    if (checkedItems.includes('hashkava_doris')) html += buildPrayerSection(PRAYERS.hashkava_female);
    if (checkedItems.includes('kaddish')) html += buildPrayerSection(PRAYERS.kaddish);

    html += `<div class="pdf-divider">✦ ✦ ✦</div>`;
    html += `<p class="pdf-footer">ת.נ.צ.ב.ה</p>`;

    openPdfView(html, 'סדר אזכרה מותאם');
    } catch (e) { alert('שגיאה ביצירת PDF: ' + e.message); }
}

// ==================== LOCAL STORAGE ====================

function loadAzkara() {
    const saved = localStorage.getItem('azkara');
    if (saved) return JSON.parse(saved);
    return {
        forPerson: 'shlomo',
        date: '2026-04-10',
        time: '09:30',
        location: 'בית עלמין קדימה צורן',
        yearLabel: 'חמישית'
    };
}

function loadMembers() {
    const saved = localStorage.getItem('members');
    if (saved) return JSON.parse(saved);
    return [];
}

function loadSelectedLetters() {
    const saved = localStorage.getItem('selectedLetters');
    if (saved) return JSON.parse(saved);
    return {};
}

function saveSelectedLetters() {
    localStorage.setItem('selectedLetters', JSON.stringify(state.selectedLetters));
}

// ==================== LIFE STORY EDITOR ====================

var LIFE_SECTIONS = ['shlomo', 'doris', 'aliya'];

function initLifeEditor() {
    // Load saved content into display
    LIFE_SECTIONS.forEach(function(key) {
        var saved = localStorage.getItem('life-' + key);
        if (saved) {
            var el = document.getElementById('life-' + key);
            if (el) el.innerHTML = textToHtml(saved);
        }
    });

    // Fill textareas with current content
    LIFE_SECTIONS.forEach(function(key) {
        var el = document.getElementById('life-' + key);
        var textarea = document.getElementById('edit-life-' + key);
        if (el && textarea) {
            var saved = localStorage.getItem('life-' + key);
            textarea.value = saved || htmlToText(el);
        }
    });

    document.getElementById('save-life-btn').addEventListener('click', saveLifeStory);
    document.getElementById('reset-life-btn').addEventListener('click', resetLifeStory);
}

function htmlToText(el) {
    var paragraphs = el.querySelectorAll('p');
    var lines = [];
    paragraphs.forEach(function(p) { lines.push(p.textContent); });
    return lines.join('\n');
}

function textToHtml(text) {
    return text.split('\n').filter(function(line) { return line.trim(); }).map(function(line) {
        return '<p>' + escapeHtml(line.trim()) + '</p>';
    }).join('');
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function saveLifeStory() {
    LIFE_SECTIONS.forEach(function(key) {
        var textarea = document.getElementById('edit-life-' + key);
        var display = document.getElementById('life-' + key);
        if (textarea && display) {
            localStorage.setItem('life-' + key, textarea.value);
            display.innerHTML = textToHtml(textarea.value);
        }
    });
    var msg = document.getElementById('life-save-success');
    msg.classList.remove('hidden');
    setTimeout(function() { msg.classList.add('hidden'); }, 2000);
}

function resetLifeStory() {
    if (!confirm('לאפס את סיפור החיים לטקסט המקורי?')) return;
    LIFE_SECTIONS.forEach(function(key) {
        localStorage.removeItem('life-' + key);
    });
    location.reload();
}

// ==================== QUOTES ====================

function loadQuotes() {
    try {
        const raw = localStorage.getItem('quotes');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function saveQuotes(quotes) {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function quoteAuthorLabel(key) {
    if (key === 'shlomo') return 'סבא שלמה';
    if (key === 'doris') return 'סבתא דוריס';
    return 'סבא וסבתא';
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderQuotes() {
    const quotes = loadQuotes();
    const section = document.getElementById('section-quotes');
    const list = document.getElementById('quotes-list');
    const tocChip = document.querySelector('.toc-quotes');
    if (!section || !list) return;

    if (!quotes.length) {
        section.classList.add('hidden');
        if (tocChip) tocChip.classList.add('hidden');
        return;
    }
    section.classList.remove('hidden');
    section.classList.add('is-visible');
    if (tocChip) tocChip.classList.remove('hidden');

    list.innerHTML = quotes.map(q =>
        `<blockquote class="quote-card">"${escapeHtml(q.text)}"<span class="quote-author">${escapeHtml(quoteAuthorLabel(q.author))}</span></blockquote>`
    ).join('');
}

function renderQuotesAdmin() {
    const quotes = loadQuotes();
    const ul = document.getElementById('quotes-admin-list');
    if (!ul) return;
    if (!quotes.length) {
        ul.innerHTML = '<li class="info-text" style="border:none;background:transparent">אין ציטוטים שמורים</li>';
        return;
    }
    ul.innerHTML = quotes.map((q, i) =>
        `<li><div class="qa-text">${escapeHtml(q.text)}<div class="qa-meta">${escapeHtml(quoteAuthorLabel(q.author))}</div></div>
         <button type="button" class="btn-secondary" data-del="${i}">מחק</button></li>`
    ).join('');
    ul.querySelectorAll('button[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-del'), 10);
            const list = loadQuotes();
            list.splice(idx, 1);
            saveQuotes(list);
            renderQuotesAdmin();
            renderQuotes();
        });
    });
}

function initQuotesAdmin() {
    const addBtn = document.getElementById('quote-add-btn');
    if (!addBtn) return;
    addBtn.addEventListener('click', () => {
        const textEl = document.getElementById('quote-text');
        const authorEl = document.getElementById('quote-author');
        const text = (textEl.value || '').trim();
        if (!text) return;
        const quotes = loadQuotes();
        quotes.push({ text, author: authorEl.value });
        saveQuotes(quotes);
        textEl.value = '';
        renderQuotesAdmin();
        renderQuotes();
    });
    renderQuotesAdmin();
}

// ==================== AUDIO RECORDINGS ====================

function loadAudio() {
    try {
        const raw = localStorage.getItem('audio');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function saveAudio(items) {
    localStorage.setItem('audio', JSON.stringify(items));
}

function audioAuthorLabel(key) {
    if (key === 'shlomo') return 'סבא שלמה';
    if (key === 'doris') return 'סבתא דוריס';
    if (key === 'family') return 'משפחה';
    return 'סבא וסבתא';
}

function normalizeAudioUrl(raw) {
    const v = (raw || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) {
        const m = v.match(/drive\.google\.com\/file\/d\/([^/]+)/);
        if (m) return 'https://drive.google.com/uc?export=download&id=' + m[1];
        return v;
    }
    if (/^[A-Za-z0-9_-]{15,}$/.test(v)) {
        return 'https://drive.google.com/uc?export=download&id=' + v;
    }
    return v;
}

function renderAudio() {
    const items = loadAudio();
    const section = document.getElementById('section-audio');
    const list = document.getElementById('audio-list');
    const tocChip = document.querySelector('.toc-audio');
    if (!section || !list) return;

    if (!items.length) {
        section.classList.add('hidden');
        if (tocChip) tocChip.classList.add('hidden');
        return;
    }
    section.classList.remove('hidden');
    section.classList.add('is-visible');
    if (tocChip) tocChip.classList.remove('hidden');

    list.innerHTML = items.map(a => `
        <div class="audio-card">
            <div class="audio-head">
                <h3>${escapeHtml(a.title)}</h3>
                <span class="audio-meta">${escapeHtml(audioAuthorLabel(a.author))}</span>
            </div>
            ${a.description ? `<p class="audio-desc">${escapeHtml(a.description)}</p>` : ''}
            <audio controls preload="none" src="${escapeHtml(a.url)}"></audio>
        </div>
    `).join('');
}

function renderAudioAdmin() {
    const items = loadAudio();
    const ul = document.getElementById('audio-admin-list');
    if (!ul) return;
    if (!items.length) {
        ul.innerHTML = '<li class="info-text" style="border:none;background:transparent">אין הקלטות</li>';
        return;
    }
    ul.innerHTML = items.map((a, i) => `
        <li>
            <div class="qa-text">
                <strong>${escapeHtml(a.title)}</strong>
                <div class="qa-meta">${escapeHtml(audioAuthorLabel(a.author))}${a.description ? ' · ' + escapeHtml(a.description) : ''}</div>
            </div>
            <button type="button" class="btn-secondary" data-del="${i}">מחק</button>
        </li>`).join('');
    ul.querySelectorAll('button[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-del'), 10);
            const list = loadAudio();
            list.splice(idx, 1);
            saveAudio(list);
            renderAudioAdmin();
            renderAudio();
        });
    });
}

function initAudioAdmin() {
    const addBtn = document.getElementById('audio-add-btn');
    if (!addBtn) return;
    addBtn.addEventListener('click', () => {
        const title = (document.getElementById('audio-title').value || '').trim();
        const rawUrl = document.getElementById('audio-url').value;
        const url = normalizeAudioUrl(rawUrl);
        const author = document.getElementById('audio-author').value;
        const description = (document.getElementById('audio-description').value || '').trim();
        if (!title || !url) { alert('צריך לפחות כותרת וקישור'); return; }
        const items = loadAudio();
        items.push({ title, url, author, description });
        saveAudio(items);
        document.getElementById('audio-title').value = '';
        document.getElementById('audio-url').value = '';
        document.getElementById('audio-description').value = '';
        renderAudioAdmin();
        renderAudio();
    });
    renderAudioAdmin();
}

// ==================== RECIPES ====================

function loadRecipes() {
    try {
        const raw = localStorage.getItem('recipes');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function saveRecipes(items) {
    localStorage.setItem('recipes', JSON.stringify(items));
}

function recipeTypeLabel(type) {
    return type === 'loved' ? 'מאכל אהוב' : 'מתכון';
}

function recipeAuthorLabel(key) {
    if (key === 'shlomo') return 'סבא שלמה';
    if (key === 'doris') return 'סבתא דוריס';
    return 'סבא וסבתא';
}

function ingredientsToHtml(raw) {
    const lines = (raw || '').split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return '';
    return `<ul class="recipe-ingredients">${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

function instructionsToHtml(raw) {
    const paragraphs = (raw || '').split('\n').map(l => l.trim()).filter(Boolean);
    if (!paragraphs.length) return '';
    return paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
}

function renderRecipes() {
    const items = loadRecipes();
    const section = document.getElementById('section-recipes');
    const list = document.getElementById('recipes-list');
    const tocChip = document.querySelector('.toc-recipes');
    if (!section || !list) return;

    if (!items.length) {
        section.classList.add('hidden');
        if (tocChip) tocChip.classList.add('hidden');
        return;
    }
    section.classList.remove('hidden');
    section.classList.add('is-visible');
    if (tocChip) tocChip.classList.remove('hidden');

    list.innerHTML = items.map(r => `
        <article class="recipe-card">
            <header>
                <span class="recipe-badge">${escapeHtml(recipeTypeLabel(r.type))}</span>
                <h3>${escapeHtml(r.name)}</h3>
                <span class="recipe-meta">${escapeHtml(recipeAuthorLabel(r.author))}</span>
            </header>
            ${ingredientsToHtml(r.ingredients)}
            ${instructionsToHtml(r.instructions)}
        </article>
    `).join('');
}

function renderRecipesAdmin() {
    const items = loadRecipes();
    const ul = document.getElementById('recipes-admin-list');
    if (!ul) return;
    if (!items.length) {
        ul.innerHTML = '<li class="info-text" style="border:none;background:transparent">אין מתכונים</li>';
        return;
    }
    ul.innerHTML = items.map((r, i) => `
        <li>
            <div class="qa-text">
                <strong>${escapeHtml(r.name)}</strong>
                <div class="qa-meta">${escapeHtml(recipeTypeLabel(r.type))} · ${escapeHtml(recipeAuthorLabel(r.author))}</div>
            </div>
            <button type="button" class="btn-secondary" data-del="${i}">מחק</button>
        </li>`).join('');
    ul.querySelectorAll('button[data-del]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-del'), 10);
            const list = loadRecipes();
            list.splice(idx, 1);
            saveRecipes(list);
            renderRecipesAdmin();
            renderRecipes();
        });
    });
}

function initRecipesAdmin() {
    const addBtn = document.getElementById('recipe-add-btn');
    if (!addBtn) return;
    addBtn.addEventListener('click', () => {
        const name = (document.getElementById('recipe-name').value || '').trim();
        const type = document.getElementById('recipe-type').value;
        const author = document.getElementById('recipe-author').value;
        const ingredients = (document.getElementById('recipe-ingredients').value || '').trim();
        const instructions = (document.getElementById('recipe-instructions').value || '').trim();
        if (!name) { alert('צריך שם למנה'); return; }
        const items = loadRecipes();
        items.push({ name, type, author, ingredients, instructions });
        saveRecipes(items);
        document.getElementById('recipe-name').value = '';
        document.getElementById('recipe-ingredients').value = '';
        document.getElementById('recipe-instructions').value = '';
        renderRecipesAdmin();
        renderRecipes();
    });
    renderRecipesAdmin();
}

// ==================== TELEGRAM BOT REMINDERS ====================

function normalizeIsraeliPhone(raw) {
    let v = (raw || '').replace(/[^\d+]/g, '');
    if (!v) return '';
    if (v.startsWith('+')) return v;
    if (v.startsWith('00')) return '+' + v.slice(2);
    if (v.startsWith('972')) return '+' + v;
    if (v.startsWith('0')) return '+972' + v.slice(1);
    return v;
}

function loadTelegramConfig() {
    try {
        const raw = localStorage.getItem('telegram');
        return raw ? JSON.parse(raw) : { token: '', chat: '' };
    } catch (e) { return { token: '', chat: '' }; }
}

function saveTelegramConfig(cfg) {
    localStorage.setItem('telegram', JSON.stringify(cfg));
}

function buildReminderText() {
    const a = state.azkara;
    const title = 'אזכרה ' + a.yearLabel + ' - ' + getPersonTitle(a.forPerson);
    const parts = a.date.split('-');
    const dateFmt = parts[2] + '/' + parts[1] + '/' + parts[0];
    const siteUrl = window.location.origin + window.location.pathname;
    return `🕯️ *תזכורת אזכרה*\n\n${title}\n📅 ${dateFmt} בשעה ${a.time}\n📍 ${a.location}\n\nפרטים נוספים וסדר אזכרה להדפסה:\n${siteUrl}`;
}

function initTelegramAdmin() {
    const tokenEl = document.getElementById('tg-token');
    const chatEl = document.getElementById('tg-chat');
    const saveBtn = document.getElementById('tg-save-btn');
    const sendBtn = document.getElementById('tg-send-btn');
    const statusEl = document.getElementById('tg-status');
    const msgEl = document.getElementById('tg-message');
    if (!saveBtn) return;

    const cfg = loadTelegramConfig();
    tokenEl.value = cfg.token || '';
    chatEl.value = cfg.chat || '';

    saveBtn.addEventListener('click', () => {
        saveTelegramConfig({ token: tokenEl.value.trim(), chat: chatEl.value.trim() });
        statusEl.textContent = 'הגדרות נשמרו';
        statusEl.className = 'success';
        setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'info-text'; }, 2000);
    });

    sendBtn.addEventListener('click', async () => {
        const cfg = loadTelegramConfig();
        if (!cfg.token || !cfg.chat) { alert('צריך להגדיר Token ו-Chat ID קודם'); return; }
        const text = msgEl.value.trim() || buildReminderText();
        statusEl.textContent = 'שולח...';
        statusEl.className = 'info-text';
        try {
            const resp = await fetch(`https://api.telegram.org/bot${encodeURIComponent(cfg.token)}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: cfg.chat, text, parse_mode: 'Markdown', disable_web_page_preview: false })
            });
            const data = await resp.json();
            if (data.ok) {
                statusEl.textContent = '✓ נשלח בהצלחה';
                statusEl.className = 'success';
            } else {
                statusEl.textContent = 'שגיאה: ' + (data.description || 'לא ידוע');
                statusEl.className = 'error';
            }
        } catch (e) {
            statusEl.textContent = 'שגיאת רשת: ' + e.message;
            statusEl.className = 'error';
        }
    });
}

// ==================== HEBCAL YAHRZEIT ====================

function formatYahrzeitEvent(ev) {
    const parts = ev.date.split('-');
    const dateFmt = parts[2] + '/' + parts[1] + '/' + parts[0];
    return { iso: ev.date, display: dateFmt, hebrew: ev.hdate || '', title: ev.title || '' };
}

async function fetchYahrzeitFor(personKey) {
    const p = CONFIG.people[personKey];
    if (!p) return [];
    const parts = p.deathDateGregorian.split('-').map(Number);
    const params = new URLSearchParams({
        cfg: 'json', v: 'yahrzeit', years: '10',
        y1: String(parts[0]), m1: String(parts[1]), d1: String(parts[2]),
        t1: 'Yahrzeit', n1: p.fullNameHebrew || p.name, hebdate: 'on'
    });
    const resp = await fetch('https://www.hebcal.com/yahrzeit?' + params.toString());
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const today = new Date().toISOString().slice(0, 10);
    return items.filter(ev => ev.date >= today).slice(0, 6).map(formatYahrzeitEvent);
}

function initYahrzeitAdmin() {
    const resultsEl = document.getElementById('yahrzeit-results');
    if (!resultsEl) return;

    async function showFor(personKey) {
        resultsEl.innerHTML = '<p class="info-text">טוען מ-Hebcal...</p>';
        try {
            const events = await fetchYahrzeitFor(personKey);
            if (!events.length) { resultsEl.innerHTML = '<p class="info-text">לא נמצאו תאריכים עתידיים</p>'; return; }
            resultsEl.innerHTML = `
                <p class="info-text">לחץ על תאריך כדי להעתיק לשדה התאריך של האזכרה:</p>
                <ul class="yahrzeit-list">
                    ${events.map(ev => `
                        <li>
                            <button type="button" data-date="${ev.iso}" class="yahrzeit-pick">
                                <span class="yz-greg">${ev.display}</span>
                                <span class="yz-heb">${escapeHtml(ev.hebrew)}</span>
                            </button>
                        </li>
                    `).join('')}
                </ul>`;
            resultsEl.querySelectorAll('.yahrzeit-pick').forEach(btn => {
                btn.addEventListener('click', () => {
                    const iso = btn.getAttribute('data-date');
                    const dateInput = document.getElementById('azkara-date');
                    if (dateInput) {
                        dateInput.value = iso;
                        dateInput.dispatchEvent(new Event('change'));
                        alert('התאריך הועתק לשדה. אל תשכח ללחוץ "שמור אזכרה".');
                    }
                });
            });
        } catch (e) {
            resultsEl.innerHTML = `<p class="error">שגיאה: ${escapeHtml(e.message)}</p>`;
        }
    }

    document.getElementById('yahrzeit-shlomo-btn').addEventListener('click', () => showFor('shlomo'));
    document.getElementById('yahrzeit-doris-btn').addEventListener('click', () => showFor('doris'));
}

// ==================== MEMORY BOOK PDF ====================

function buildMemoryBookHtml(opts) {
    const azkara = state.azkara;
    const parts = [];
    const siteUrl = window.location.origin + window.location.pathname;

    if (opts.cover) {
        parts.push(`
            <section class="book-cover">
                <h1 class="book-title">לזכרם האהוב של</h1>
                <h2 class="book-names">שלמה ודוריס לוי ז"ל</h2>
                <div class="book-divider">✦</div>
                <p class="book-dates">שלמה: 1928–2021 · ט"ז ניסן תשפ"א</p>
                <p class="book-dates">דוריס: 1933–2021 · י"ז אייר תשפ"א</p>
                <p class="book-subtitle">בית עלמין קדימה צורן</p>
                <p class="book-credit">ספר זיכרון משפחתי</p>
            </section>`);
    }

    if (opts.life) {
        parts.push('<section class="book-chapter"><h2>סיפור חייהם</h2>');
        [['shlomo', 'סבא שלמה'], ['doris', 'סבתא דוריס'], ['aliya', 'העלייה ארצה']].forEach(([k, t]) => {
            const el = document.getElementById('life-' + k);
            if (el) parts.push(`<h3>${t}</h3>${el.innerHTML}`);
        });
        parts.push('</section>');
    }

    if (opts.quotes) {
        const quotes = loadQuotes();
        if (quotes.length) {
            parts.push('<section class="book-chapter"><h2>ציטוטים ואמרות</h2>');
            quotes.forEach(q => {
                parts.push(`<blockquote class="book-quote">"${escapeHtml(q.text)}"<footer>— ${escapeHtml(quoteAuthorLabel(q.author))}</footer></blockquote>`);
            });
            parts.push('</section>');
        }
    }

    if (opts.recipes) {
        const recipes = loadRecipes();
        if (recipes.length) {
            parts.push('<section class="book-chapter"><h2>מתכונים ומאכלים אהובים</h2>');
            recipes.forEach(r => {
                parts.push(`<article class="book-recipe">
                    <h3>${escapeHtml(r.name)}</h3>
                    <p class="book-recipe-meta">${escapeHtml(recipeTypeLabel(r.type))} · ${escapeHtml(recipeAuthorLabel(r.author))}</p>
                    ${ingredientsToHtml(r.ingredients)}
                    ${instructionsToHtml(r.instructions)}
                </article>`);
            });
            parts.push('</section>');
        }
    }

    if (opts.audio) {
        const audios = loadAudio();
        if (audios.length) {
            parts.push('<section class="book-chapter"><h2>הקלטות קוליות</h2><p class="info-text">לשמיעה: סרקו את ה-QR בסוף הספר או גשו לאתר.</p><ul class="book-audio-list">');
            audios.forEach(a => {
                parts.push(`<li><strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(audioAuthorLabel(a.author))}${a.description ? '<br><span>' + escapeHtml(a.description) + '</span>' : ''}</li>`);
            });
            parts.push('</ul></section>');
        }
    }

    if (opts.qr) {
        parts.push(`
            <section class="book-chapter book-qr-page">
                <h2>לצפייה מלאה וגלריית תמונות</h2>
                <p>סרקו את הקוד או גשו לכתובת:</p>
                <div id="book-qr-holder" class="book-qr-holder"></div>
                <p class="book-url" dir="ltr">${siteUrl}</p>
            </section>`);
    }

    return parts.join('\n');
}

function generateMemoryBook() {
    const opts = {};
    document.querySelectorAll('#book-checklist input').forEach(cb => { opts[cb.value] = cb.checked; });
    const html = buildMemoryBookHtml(opts);
    openPdfView(html, 'ספר זיכרון');

    if (opts.qr && typeof QRCode !== 'undefined') {
        const holder = document.getElementById('book-qr-holder');
        if (holder) {
            new QRCode(holder, {
                text: window.location.origin + window.location.pathname,
                width: 300, height: 300,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}

function initMemoryBookAdmin() {
    const btn = document.getElementById('memory-book-btn');
    if (!btn) return;
    btn.addEventListener('click', generateMemoryBook);
}

// ==================== BACK TO TOP ====================

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const threshold = 400;
    let ticking = false;

    function update() {
        ticking = false;
        if (window.scrollY > threshold) btn.classList.add('visible');
        else btn.classList.remove('visible');
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
}

// ==================== REVEAL ON SCROLL ====================

function initRevealOnScroll() {
    const targets = document.querySelectorAll('.page-section');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach(t => t.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(t => observer.observe(t));
}

// ==================== TOC SCROLLSPY ====================

function initTocScrollspy() {
    const chips = document.querySelectorAll('.page-toc .toc-chip');
    if (!chips.length) return;
    const sections = Array.from(chips)
        .map(c => document.querySelector(c.getAttribute('href')))
        .filter(Boolean);
    if (!sections.length) return;

    // Smooth scroll is handled natively by CSS scroll-behavior; we just highlight.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = '#' + entry.target.id;
                chips.forEach(c => c.classList.toggle('active', c.getAttribute('href') === id));
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
}

// ==================== QR CODE ====================

var qrInstance = null;

function initQrAdmin() {
    const urlInput = document.getElementById('qr-url');
    const sizeInput = document.getElementById('qr-size');
    const forSelect = document.getElementById('qr-for');
    const preview = document.getElementById('qr-preview');
    if (!urlInput || !preview) return;

    if (!urlInput.value) {
        urlInput.value = window.location.origin + window.location.pathname;
    }

    renderQr();

    document.getElementById('qr-refresh-btn').addEventListener('click', renderQr);
    document.getElementById('qr-download-btn').addEventListener('click', downloadQrPng);
    document.getElementById('qr-print-btn').addEventListener('click', printQrPlaque);
    [urlInput, sizeInput, forSelect].forEach(el => el.addEventListener('change', renderQr));
}

function renderQr() {
    if (typeof QRCode === 'undefined') return;
    const preview = document.getElementById('qr-preview');
    const url = document.getElementById('qr-url').value.trim();
    const size = parseInt(document.getElementById('qr-size').value, 10) || 512;
    if (!url) { preview.innerHTML = '<p class="info-text">הזן כתובת</p>'; return; }
    preview.innerHTML = '';
    qrInstance = new QRCode(preview, {
        text: url,
        width: Math.min(size, 512),
        height: Math.min(size, 512),
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function getQrDataUrl() {
    const preview = document.getElementById('qr-preview');
    const canvas = preview.querySelector('canvas');
    if (canvas) return canvas.toDataURL('image/png');
    const img = preview.querySelector('img');
    if (img && img.src) return img.src;
    return null;
}

function downloadQrPng() {
    const dataUrl = getQrDataUrl();
    if (!dataUrl) { alert('לא הצלחתי ליצור את הקובץ. נסה לרענן.'); return; }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'memorial-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function qrPlaqueTitle(forKey) {
    if (forKey === 'shlomo') return 'שלמה לוי ז"ל';
    if (forKey === 'doris') return 'דוריס (חנה) לוי ז"ל';
    return 'שלמה ודוריס לוי ז"ל';
}

function qrPlaqueSubtitle(forKey) {
    if (forKey === 'shlomo') return '1928 – 2021 · ט"ז ניסן תשפ"א';
    if (forKey === 'doris') return '1933 – 2021 · י"ז אייר תשפ"א';
    return 'בית עלמין קדימה צורן';
}

function printQrPlaque() {
    const dataUrl = getQrDataUrl();
    if (!dataUrl) { alert('לא הצלחתי ליצור את הקובץ. נסה לרענן.'); return; }
    const forKey = document.getElementById('qr-for').value;
    const url = document.getElementById('qr-url').value.trim();
    const title = qrPlaqueTitle(forKey);
    const subtitle = qrPlaqueSubtitle(forKey);

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title} – לוחית QR</title>
<style>
  @page { size: A6; margin: 8mm; }
  html, body { margin: 0; padding: 0; background: #fff; color: #111; font-family: 'David', 'Frank Ruehl', 'Times New Roman', serif; }
  .plaque { box-sizing: border-box; width: 100%; min-height: 100vh; padding: 14mm 10mm; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid #111; border-radius: 6mm; }
  .plaque h1 { font-size: 20pt; margin: 0 0 4mm; font-weight: 700; letter-spacing: 0.5pt; }
  .plaque .sub { font-size: 11pt; margin: 0 0 8mm; color: #333; }
  .plaque img { width: 60mm; height: 60mm; display: block; margin: 0 auto 6mm; }
  .plaque .hint { font-size: 9pt; color: #444; margin: 0; }
  .plaque .url { font-size: 8pt; color: #555; direction: ltr; margin-top: 3mm; word-break: break-all; }
  @media print { .noprint { display: none; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  .noprint { position: fixed; top: 10px; left: 10px; }
  .noprint button { padding: 8px 14px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="noprint"><button onclick="window.print()">הדפס</button></div>
<div class="plaque">
  <h1>לזכרם של<br>${title}</h1>
  <p class="sub">${subtitle}</p>
  <img src="${dataUrl}" alt="QR">
  <p class="hint">סרקו לצפייה בדף הנצחה</p>
  <p class="url">${url}</p>
</div>
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 400); });<\/script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) { alert('חלון הדפדפן חסום. אפשר חלונות קופצים ונסה שוב.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
}

// ==================== INIT ====================

function initApp() {
    try { initDarkMode(); } catch(e) { console.error('darkMode:', e); }
    try { initManageLock(); } catch(e) { console.error('manageLock:', e); }
    try { initNav(); } catch(e) { console.error('nav:', e); }
    try { initLetters(); } catch(e) { console.error('letters:', e); }
    try { initAzkaraAdmin(); } catch(e) { console.error('azkaraAdmin:', e); }
    try { initMembers(); } catch(e) { console.error('members:', e); }
    try { updateElapsedTimes(); } catch(e) { console.error('elapsed:', e); }
    try { updateMemorialAzkara(); } catch(e) { console.error('memAzkara:', e); }

    // Main page buttons
    try {
        document.getElementById('quick-pdf-btn').addEventListener('click', generateQuickPdf);
        document.getElementById('download-pdf-btn').addEventListener('click', generateAdvancedPdf);
    } catch(e) { console.error('buttons:', e); }

    // Family tree
    try { renderFamilyTree(); } catch(e) { console.error('tree:', e); }

    // Gallery
    try { initGallery(); } catch(e) { console.error('gallery:', e); }

    // Life story editor
    try { initLifeEditor(); } catch(e) { console.error('lifeEditor:', e); }

    // Duplicate scanner (manage tab)
    try { initDuplicateScanner(); } catch(e) { console.error('dupScanner:', e); }

    // QR code for gravestone / print
    try { initQrAdmin(); } catch(e) { console.error('qrAdmin:', e); }

    // Quotes (main page + admin)
    try { renderQuotes(); } catch(e) { console.error('quotes:', e); }
    try { initQuotesAdmin(); } catch(e) { console.error('quotesAdmin:', e); }

    // Audio recordings
    try { renderAudio(); } catch(e) { console.error('audio:', e); }
    try { initAudioAdmin(); } catch(e) { console.error('audioAdmin:', e); }

    // Recipes
    try { renderRecipes(); } catch(e) { console.error('recipes:', e); }
    try { initRecipesAdmin(); } catch(e) { console.error('recipesAdmin:', e); }

    // Telegram reminders
    try { initTelegramAdmin(); } catch(e) { console.error('telegram:', e); }

    // Hebcal yahrzeit helper
    try { initYahrzeitAdmin(); } catch(e) { console.error('yahrzeit:', e); }

    // Memory Book PDF
    try { initMemoryBookAdmin(); } catch(e) { console.error('memoryBook:', e); }

    // Table-of-contents scrollspy
    try { initTocScrollspy(); } catch(e) { console.error('tocSpy:', e); }

    // Floating back-to-top button
    try { initBackToTop(); } catch(e) { console.error('backTop:', e); }

    // Reveal sections on scroll
    try { initRevealOnScroll(); } catch(e) { console.error('reveal:', e); }

    // File input change listener (label handles click natively)
    try {
        document.getElementById('file-input').addEventListener('change', handleFileSelect);
        document.getElementById('upload-submit-btn').addEventListener('click', submitUpload);
        document.getElementById('upload-cancel-btn').addEventListener('click', cancelUpload);
    } catch(e) { console.error('uploadBtns:', e); }
}

document.addEventListener('DOMContentLoaded', initAuth);
