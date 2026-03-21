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

    container.innerHTML = `
        <div class="azkara-banner">
            <h3>אזכרה ${azkara.yearLabel} קרובה</h3>
            <p><strong>${getPersonTitle(azkara.forPerson)}</strong></p>
            <p>${formatAzkaraDate(azkara)} בשעה ${azkara.time}</p>
            <p>${azkara.location}</p>
            <p class="countdown">${countdownText}</p>
        </div>
    `;
}

// ==================== AUTH ====================

function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');

    if (sessionStorage.getItem('authenticated') === 'true') {
        showApp();
        return;
    }

    function attemptLogin() {
        if (passwordInput.value === CONFIG.password) {
            sessionStorage.setItem('authenticated', 'true');
            showApp();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
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

// ==================== CALENDAR (.ics) ====================

function downloadCalendarEvent() {
    const azkara = state.azkara;
    const title = `אזכרה ${azkara.yearLabel} - ${getPersonTitle(azkara.forPerson)}`;
    const dateStr = azkara.date.replace(/-/g, '');
    const timeStr = azkara.time.replace(':', '') + '00';
    const dtStart = dateStr + 'T' + timeStr;
    const startDate = new Date(azkara.date + 'T' + azkara.time + ':00');
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const dtEnd = dateStr + 'T' + endDate.getHours().toString().padStart(2, '0') +
        endDate.getMinutes().toString().padStart(2, '0') + '00';

    const icsContent = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Memorial//Azkara//HE',
        'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
        `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
        `SUMMARY:${title}`, `LOCATION:${azkara.location}`,
        `DESCRIPTION:${title}\\n${azkara.location}`,
        'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY',
        `DESCRIPTION:תזכורת: ${title} בעוד שבוע`, 'END:VALARM',
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY',
        `DESCRIPTION:תזכורת: ${title} מחר`, 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azkara_${azkara.forPerson}.ics`;
    a.click();
    URL.revokeObjectURL(url);
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

function getNameLetters(personKey) {
    return CONFIG.people[personKey].lettersForTehillim;
}

function buildTehillimHtml(letters, title) {
    let html = `<div class="separator">✦</div>`;
    html += `<h2>תהילים לפי אותיות השם - ${title}</h2>`;
    const seen = new Set();
    letters.forEach(letter => {
        if (PSALM_119[letter] && !seen.has(letter)) {
            seen.add(letter);
            html += `<h2>${PSALM_119[letter].title}</h2>`;
            html += `<div class="prayer-text">${PSALM_119[letter].verses}</div>`;
        }
    });
    return html;
}

function buildPrayerSection(prayer) {
    let html = `<h2>${prayer.title}</h2>`;
    if (prayer.instruction) html += `<p class="instruction">${prayer.instruction}</p>`;
    html += `<div class="prayer-text">${prayer.text}</div>`;
    return html;
}

function formatDate(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Quick PDF from main page - generates based on current azkara
function generateQuickPdf() {
    const azkara = state.azkara;
    const checkedItems = [];
    document.querySelectorAll('#main-seder-checklist input:checked').forEach(cb => checkedItems.push(cb.value));

    // Determine which people are in this azkara
    const people = [];
    if (azkara.forPerson === 'both' || azkara.forPerson === 'shlomo') people.push({ data: CONFIG.people.shlomo, key: 'shlomo' });
    if (azkara.forPerson === 'both' || azkara.forPerson === 'doris') people.push({ data: CONFIG.people.doris, key: 'doris' });

    const pdfDiv = document.getElementById('pdf-content');
    pdfDiv.classList.remove('hidden');

    let html = `<div class="pdf-page">`;
    html += `<h1>סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1>${getPersonTitle(azkara.forPerson)}</h1>`;

    people.forEach(p => {
        const prefix = p.data.gender === 'male' ? 'נפטר' : 'נפטרה';
        html += `<p style="text-align:center;">${p.data.name} - ${prefix}: ${p.data.deathDateHebrew} | ${formatDate(p.data.deathDateGregorian)}</p>`;
    });

    const dateParts = azkara.date.split('-');
    html += `<p style="text-align:center;">${dateParts[2]}/${dateParts[1]}/${dateParts[0]} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="separator">✦ ✦ ✦</div>`;

    if (checkedItems.includes('candle')) html += buildPrayerSection(PRAYERS.candle);

    // Tehillim - name letters for each person
    if (checkedItems.includes('tehillim')) {
        people.forEach(p => {
            const letters = getNameLetters(p.key);
            html += buildTehillimHtml(letters, p.data.fullNameHebrew);
        });
    }

    // Tehillim - neshama letters
    if (checkedItems.includes('neshama')) {
        const seen = new Set();
        html += `<div class="separator">✦</div>`;
        html += `<h2>תהילים - אותיות נשמה</h2>`;
        CONFIG.neshamaLetters.forEach(letter => {
            if (PSALM_119[letter] && !seen.has(letter)) {
                seen.add(letter);
                html += `<h2>${PSALM_119[letter].title}</h2>`;
                html += `<div class="prayer-text">${PSALM_119[letter].verses}</div>`;
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

    html += `<div class="separator">✦ ✦ ✦</div>`;
    html += `<p style="text-align:center; font-size:1.3rem;">ת.נ.צ.ב.ה</p>`;
    html += `</div>`;

    pdfDiv.innerHTML = html;

    html2pdf().set({
        margin: 10,
        filename: `seder_azkara_${azkara.forPerson}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(pdfDiv).save().then(() => pdfDiv.classList.add('hidden'));
}

// Advanced PDF from manage page - uses manually selected letters
function generateAdvancedPdf() {
    const azkara = state.azkara;
    const checkedItems = [];
    document.querySelectorAll('#adv-seder-checklist input:checked').forEach(cb => checkedItems.push(cb.value));

    const pdfDiv = document.getElementById('pdf-content');
    pdfDiv.classList.remove('hidden');

    let html = `<div class="pdf-page">`;
    html += `<h1>סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1>${getPersonTitle(azkara.forPerson)}</h1>`;

    const dateParts = azkara.date.split('-');
    html += `<p style="text-align:center;">${dateParts[2]}/${dateParts[1]}/${dateParts[0]} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="separator">✦ ✦ ✦</div>`;

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

    html += `<div class="separator">✦ ✦ ✦</div>`;
    html += `<p style="text-align:center; font-size:1.3rem;">ת.נ.צ.ב.ה</p>`;
    html += `</div>`;

    pdfDiv.innerHTML = html;

    html2pdf().set({
        margin: 10,
        filename: `seder_azkara_custom.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(pdfDiv).save().then(() => pdfDiv.classList.add('hidden'));
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
    initNav();
    initLetters();
    initAzkaraAdmin();
    initMembers();
    updateElapsedTimes();
    updateMemorialAzkara();

    // Main page buttons
    document.getElementById('quick-pdf-btn').addEventListener('click', generateQuickPdf);
    document.getElementById('quick-calendar-btn').addEventListener('click', downloadCalendarEvent);

    // Manage page button
    document.getElementById('download-pdf-btn').addEventListener('click', generateAdvancedPdf);
}

document.addEventListener('DOMContentLoaded', initAuth);
