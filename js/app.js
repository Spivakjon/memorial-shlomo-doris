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
            // Letter groupings for quick-select
            nameGroups: {
                all: [0, 1, 2, 3, 4, 5, 6],      // שלמה לוי
                first: [0, 1, 2, 3],               // שלמה
                last: [4, 5, 6],                   // לוי
                neshama: []                        // נשמה letters added dynamically
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
                all: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // דוריס חנה לוי
                doris: [0, 1, 2, 3, 4],                     // דוריס
                chana: [5, 6, 7],                            // חנה
                last: [8, 9, 10],                            // לוי
                neshama: []                                  // added dynamically
            }
        }
    },
    neshamaLetters: ['נ', 'ש', 'מ', 'ה']
};

// State
let state = {
    currentSection: 'memorial',
    azkara: loadAzkara(),
    members: loadMembers(),
    // Track which letters are selected (checked) per person
    selectedLetters: loadSelectedLetters()
};

// --- Time Elapsed ---
function calcElapsed(deathDateStr) {
    const death = new Date(deathDateStr + 'T00:00:00');
    const now = new Date();

    let years = now.getFullYear() - death.getFullYear();
    let months = now.getMonth() - death.getMonth();
    let days = now.getDate() - death.getDate();

    if (days < 0) {
        months--;
        // Days in previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'שנה' : (years < 11 ? 'שנים' : 'שנה')}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'חודש' : 'חודשים'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'יום' : 'ימים'}`);

    return parts.join(', ');
}

function updateElapsedTimes() {
    document.getElementById('elapsed-shlomo').textContent = calcElapsed(CONFIG.people.shlomo.deathDateGregorian);
    document.getElementById('elapsed-doris').textContent = calcElapsed(CONFIG.people.doris.deathDateGregorian);
}

// --- Memorial Page Azkara Display ---
function updateMemorialAzkara() {
    const azkara = state.azkara;
    const container = document.getElementById('memorial-azkara');

    const dateObj = new Date(azkara.date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = days[dateObj.getDay()];
    const dateParts = azkara.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    let countdownText = '';
    if (diffDays > 0) {
        countdownText = `בעוד ${diffDays} ימים`;
    } else if (diffDays === 0) {
        countdownText = 'היום!';
    } else {
        countdownText = '';
    }

    if (diffDays < 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="azkara-banner">
            <h3>אזכרה ${azkara.yearLabel} קרובה</h3>
            <p><strong>${getPersonTitle(azkara.forPerson)}</strong></p>
            <p>יום ${dayName}, ${formattedDate} בשעה ${azkara.time}</p>
            <p>${azkara.location}</p>
            ${countdownText ? `<p class="countdown">${countdownText}</p>` : ''}
        </div>
    `;
}

// --- Auth ---
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

// --- Navigation ---
function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
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

// --- Letters (checkbox-based selection) ---
function initLetters() {
    renderLetterCheckboxes('letters-shlomo', CONFIG.people.shlomo, 'shlomo');
    renderLetterCheckboxes('letters-doris', CONFIG.people.doris, 'doris');
}

function renderLetterCheckboxes(containerId, person, personKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    person.lettersForTehillim.forEach((letter, index) => {
        const key = `${personKey}_${index}`;
        const isSelected = state.selectedLetters[key] !== false; // default true

        const box = document.createElement('div');
        box.className = 'letter-box' + (isSelected ? ' selected' : '');
        box.dataset.key = key;
        box.innerHTML = `
            <span class="letter">${letter}</span>
            <span class="letter-check">${isSelected ? '✓' : ''}</span>
        `;
        box.addEventListener('click', () => toggleLetter(key, box));
        container.appendChild(box);
    });

    // Also render neshama letters
    renderNeshamaLetters(containerId, personKey);
}

function renderNeshamaLetters(containerId, personKey) {
    const container = document.getElementById(containerId);

    // Add a small separator + label for neshama
    const neshamaLabel = document.createElement('div');
    neshamaLabel.className = 'neshama-separator';
    neshamaLabel.textContent = 'אותיות נשמה:';
    container.appendChild(neshamaLabel);

    CONFIG.neshamaLetters.forEach((letter, index) => {
        const key = `${personKey}_neshama_${index}`;
        const isSelected = state.selectedLetters[key] === true; // default false

        const box = document.createElement('div');
        box.className = 'letter-box neshama-letter' + (isSelected ? ' selected' : '');
        box.dataset.key = key;
        box.innerHTML = `
            <span class="letter">${letter}</span>
            <span class="letter-check">${isSelected ? '✓' : ''}</span>
        `;
        box.addEventListener('click', () => toggleLetter(key, box));
        container.appendChild(box);
    });
}

function toggleLetter(key, boxElement) {
    const isNeshama = key.includes('_neshama_');
    const currentlySelected = isNeshama
        ? state.selectedLetters[key] === true
        : state.selectedLetters[key] !== false;

    state.selectedLetters[key] = !currentlySelected;
    saveSelectedLetters();

    // Update visuals
    if (!currentlySelected) {
        boxElement.classList.add('selected');
        boxElement.querySelector('.letter-check').textContent = '✓';
    } else {
        boxElement.classList.remove('selected');
        boxElement.querySelector('.letter-check').textContent = '';
    }
}

// Quick select buttons
function quickSelect(personKey, group) {
    const person = CONFIG.people[personKey];

    if (group === 'none') {
        // Uncheck all name letters
        person.lettersForTehillim.forEach((_, i) => {
            state.selectedLetters[`${personKey}_${i}`] = false;
        });
        // Also uncheck neshama
        CONFIG.neshamaLetters.forEach((_, i) => {
            state.selectedLetters[`${personKey}_neshama_${i}`] = false;
        });
    } else if (group === 'neshama') {
        // Toggle neshama letters (select them, don't touch others)
        CONFIG.neshamaLetters.forEach((_, i) => {
            state.selectedLetters[`${personKey}_neshama_${i}`] = true;
        });
    } else {
        // First uncheck all
        person.lettersForTehillim.forEach((_, i) => {
            state.selectedLetters[`${personKey}_${i}`] = false;
        });
        CONFIG.neshamaLetters.forEach((_, i) => {
            state.selectedLetters[`${personKey}_neshama_${i}`] = false;
        });

        // Then check the group
        const indices = person.nameGroups[group] || [];
        indices.forEach(i => {
            state.selectedLetters[`${personKey}_${i}`] = true;
        });
    }

    saveSelectedLetters();
    renderLetterCheckboxes(
        personKey === 'shlomo' ? 'letters-shlomo' : 'letters-doris',
        person,
        personKey
    );
}

// --- Azkara Management ---
function initAzkaraAdmin() {
    const saveBtn = document.getElementById('save-azkara-btn');
    saveBtn.addEventListener('click', saveAzkaraFromForm);

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
    updateAzkaraDisplay();
    updateMemorialAzkara();

    const msg = document.getElementById('save-success');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2000);
}

function getPersonTitle(forPerson) {
    if (forPerson === 'both') return 'שלמה לוי ז"ל ודוריס (חנה) לוי ז"ל';
    if (forPerson === 'shlomo') return CONFIG.people.shlomo.name + ' ז"ל';
    return CONFIG.people.doris.name + ' ז"ל';
}

function updateAzkaraDisplay() {
    const azkara = state.azkara;
    const info = document.querySelector('.azkara-details');

    const dateObj = new Date(azkara.date + 'T00:00:00');
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayName = days[dateObj.getDay()];

    const dateParts = azkara.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    info.innerHTML = `
        <p><strong>אזכרה ${azkara.yearLabel}</strong></p>
        <p><strong>${getPersonTitle(azkara.forPerson)}</strong></p>
        <p>יום ${dayName}, ${formattedDate} בשעה ${azkara.time}</p>
        <p>${azkara.location}</p>
    `;
}

// --- Members Management ---
function initMembers() {
    const addBtn = document.getElementById('add-member-btn');
    addBtn.addEventListener('click', addMember);
    renderMembers();
}

function addMember() {
    const name = document.getElementById('member-name').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const phone = document.getElementById('member-phone').value.trim();

    if (!name) {
        alert('נא להזין שם');
        return;
    }

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
    ul.innerHTML = '';

    if (state.members.length === 0) {
        ul.innerHTML = '<li>אין משתתפים רשומים</li>';
        return;
    }

    state.members.forEach(member => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${member.name} ${member.email ? '(' + member.email + ')' : ''} ${member.phone ? '| ' + member.phone : ''}</span>
            <button onclick="removeMember(${member.id})">הסר</button>
        `;
        ul.appendChild(li);
    });
}

// --- Calendar (.ics) ---
function initCalendar() {
    document.getElementById('download-calendar-btn').addEventListener('click', downloadCalendarEvent);
}

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
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Memorial Site//Azkara//HE',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${title}`,
        `LOCATION:${azkara.location}`,
        `DESCRIPTION:${title}\\n${azkara.location}`,
        'BEGIN:VALARM',
        'TRIGGER:-P7D',
        'ACTION:DISPLAY',
        `DESCRIPTION:תזכורת: ${title} בעוד שבוע`,
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:תזכורת: ${title} מחר`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azkara_${azkara.forPerson}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- PDF Generation ---
function initPdf() {
    document.getElementById('download-pdf-btn').addEventListener('click', generatePdf);
}

function getSelectedLettersForPerson(personKey) {
    const person = CONFIG.people[personKey];
    const selected = [];

    // Name letters
    person.lettersForTehillim.forEach((letter, index) => {
        const key = `${personKey}_${index}`;
        if (state.selectedLetters[key] !== false) {
            selected.push(letter);
        }
    });

    // Neshama letters
    CONFIG.neshamaLetters.forEach((letter, index) => {
        const key = `${personKey}_neshama_${index}`;
        if (state.selectedLetters[key] === true) {
            selected.push(letter);
        }
    });

    return selected;
}

function generatePdf() {
    const azkara = state.azkara;

    // Get checked seder items
    const checkedItems = [];
    document.querySelectorAll('#seder-checklist input[type="checkbox"]:checked').forEach(cb => {
        checkedItems.push(cb.value);
    });

    const pdfDiv = document.getElementById('pdf-content');
    pdfDiv.classList.remove('hidden');

    let html = `<div class="pdf-page">`;
    html += `<h1>סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1>${getPersonTitle(azkara.forPerson)}</h1>`;

    // Show death info for relevant people
    const showPeople = [];
    if (azkara.forPerson === 'both' || azkara.forPerson === 'shlomo') showPeople.push(CONFIG.people.shlomo);
    if (azkara.forPerson === 'both' || azkara.forPerson === 'doris') showPeople.push(CONFIG.people.doris);

    showPeople.forEach(p => {
        const genderPrefix = p.gender === 'male' ? 'נפטר' : 'נפטרה';
        html += `<p style="text-align:center;">${p.name} - ${genderPrefix}: ${p.deathDateHebrew} | ${formatDate(p.deathDateGregorian)}</p>`;
    });

    const dateParts = azkara.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    html += `<p style="text-align:center;">${formattedDate} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="separator">✦ ✦ ✦</div>`;

    // Candle
    if (checkedItems.includes('candle')) {
        html += buildPrayerSection(PRAYERS.candle);
    }

    // Tehillim for Shlomo
    if (checkedItems.includes('tehillim_shlomo')) {
        const letters = getSelectedLettersForPerson('shlomo');
        if (letters.length > 0) {
            html += `<div class="separator">✦</div>`;
            html += `<h2>תהילים לפי אותיות השם - ${CONFIG.people.shlomo.fullNameHebrew}</h2>`;
            const seen = new Set();
            letters.forEach(letter => {
                if (PSALM_119[letter] && !seen.has(letter)) {
                    seen.add(letter);
                    html += `<h2>${PSALM_119[letter].title}</h2>`;
                    html += `<div class="prayer-text">${PSALM_119[letter].verses}</div>`;
                }
            });
        }
    }

    // Tehillim for Doris
    if (checkedItems.includes('tehillim_doris')) {
        const letters = getSelectedLettersForPerson('doris');
        if (letters.length > 0) {
            html += `<div class="separator">✦</div>`;
            html += `<h2>תהילים לפי אותיות השם - ${CONFIG.people.doris.fullNameHebrew}</h2>`;
            const seen = new Set();
            letters.forEach(letter => {
                if (PSALM_119[letter] && !seen.has(letter)) {
                    seen.add(letter);
                    html += `<h2>${PSALM_119[letter].title}</h2>`;
                    html += `<div class="prayer-text">${PSALM_119[letter].verses}</div>`;
                }
            });
        }
    }

    // Psalm 91
    if (checkedItems.includes('psalm91')) {
        html += buildPrayerSection(PRAYERS.psalm91);
    }

    // Psalm 121
    if (checkedItems.includes('psalm121')) {
        html += buildPrayerSection(PRAYERS.psalm121);
    }

    // Hashkava Shlomo
    if (checkedItems.includes('hashkava_shlomo')) {
        html += buildPrayerSection(PRAYERS.hashkava_male);
    }

    // Hashkava Doris
    if (checkedItems.includes('hashkava_doris')) {
        html += buildPrayerSection(PRAYERS.hashkava_female);
    }

    // Kaddish
    if (checkedItems.includes('kaddish')) {
        html += buildPrayerSection(PRAYERS.kaddish);
    }

    html += `<div class="separator">✦ ✦ ✦</div>`;
    html += `<p style="text-align:center; font-size:1.3rem;">ת.נ.צ.ב.ה</p>`;
    html += `</div>`;

    pdfDiv.innerHTML = html;

    const opt = {
        margin: 10,
        filename: `seder_azkara_${azkara.forPerson}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfDiv).save().then(() => {
        pdfDiv.classList.add('hidden');
    });
}

function buildPrayerSection(prayer) {
    let html = `<h2>${prayer.title}</h2>`;
    if (prayer.instruction) {
        html += `<p class="instruction">${prayer.instruction}</p>`;
    }
    html += `<div class="prayer-text">${prayer.text}</div>`;
    return html;
}

function formatDate(dateStr) {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// --- Local Storage ---
function loadAzkara() {
    const saved = localStorage.getItem('azkara');
    if (saved) return JSON.parse(saved);
    return {
        forPerson: 'both',
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
    return {}; // empty = all name letters default to true, neshama default to false
}

function saveSelectedLetters() {
    localStorage.setItem('selectedLetters', JSON.stringify(state.selectedLetters));
}

// --- Init ---
function initApp() {
    initNav();
    initLetters();
    initCalendar();
    initPdf();
    initAzkaraAdmin();
    initMembers();
    updateAzkaraDisplay();
    updateElapsedTimes();
    updateMemorialAzkara();
}

// Start
document.addEventListener('DOMContentLoaded', initAuth);
