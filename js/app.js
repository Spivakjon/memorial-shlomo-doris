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
    const phone = document.getElementById('member-phone').value.trim();
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
        li.innerHTML = `
            <span>${member.name} ${member.email ? '(' + member.email + ')' : ''} ${member.phone ? '| ' + member.phone : ''}</span>
            <button onclick="removeMember(${member.id})">הסר</button>
        `;
        ul.appendChild(li);
    });
}

// ==================== CALENDAR ====================

function downloadCalendarEvent() {
    try {
        const azkara = state.azkara;
        const title = 'אזכרה ' + azkara.yearLabel + ' - ' + getPersonTitle(azkara.forPerson);
        const description = title + ' | ' + azkara.location;

        const dateStr = azkara.date.replace(/-/g, '');
        const timeStr = azkara.time.replace(':', '') + '00';
        const startDate = new Date(azkara.date + 'T' + azkara.time + ':00');
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const endTimeStr = endDate.getHours().toString().padStart(2, '0') +
            endDate.getMinutes().toString().padStart(2, '0') + '00';

        const now = new Date();
        const stamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') + 'T' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Memorial//Azkara//HE',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:azkara-' + dateStr + '@memorial-levi',
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
        // Add UTF-8 BOM for Hebrew support
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const encoder = new TextEncoder();
        const body = encoder.encode(icsText);
        const combined = new Uint8Array(bom.length + body.length);
        combined.set(bom);
        combined.set(body, bom.length);

        // Use data URI - works on iOS Safari (opens "Add to Calendar" directly)
        const dataUrl = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsText);
        window.location.href = dataUrl;
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

    // File input change listener (label handles click natively)
    try {
        document.getElementById('file-input').addEventListener('change', handleFileSelect);
        document.getElementById('upload-submit-btn').addEventListener('click', submitUpload);
        document.getElementById('upload-cancel-btn').addEventListener('click', cancelUpload);
    } catch(e) { console.error('uploadBtns:', e); }
}

document.addEventListener('DOMContentLoaded', initAuth);
