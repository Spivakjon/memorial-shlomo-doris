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
            lettersForTehillim: ['ש', 'ל', 'מ', 'ה', 'ל', 'ו', 'י']
        },
        doris: {
            name: 'דוריס (חנה) לוי',
            fullNameHebrew: 'דוריס חנה לוי',
            gender: 'female',
            deathDateGregorian: '2021-04-27',
            fatherName: 'פלורה',
            deathDateHebrew: 'י"ז אייר תשפ"א',
            cemetery: 'בית עלמין קדימה צורן',
            lettersForTehillim: ['ד', 'ו', 'ר', 'י', 'ס', 'ח', 'נ', 'ה', 'ל', 'ו', 'י']
        }
    }
};

// State
let state = {
    currentSection: 'memorial',
    azkara: loadAzkara(),
    members: loadMembers(),
    letterAssignments: loadLetterAssignments()
};

// --- Auth ---
function initAuth() {
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');

    // Check if already authenticated
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

// --- Letters ---
function initLetters() {
    renderLetters('letters-shlomo', CONFIG.people.shlomo, 'shlomo');
    renderLetters('letters-doris', CONFIG.people.doris, 'doris');
}

function renderLetters(containerId, person, personKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    person.lettersForTehillim.forEach((letter, index) => {
        const key = `${personKey}_${index}`;
        const assignee = state.letterAssignments[key] || '';

        const box = document.createElement('div');
        box.className = 'letter-box' + (assignee ? ' selected' : '');
        box.innerHTML = `
            <span class="letter">${letter}</span>
            <span class="assignee">${assignee || 'פנוי'}</span>
        `;
        box.addEventListener('click', () => assignLetter(key, letter, box));
        container.appendChild(box);
    });
}

function assignLetter(key, letter, boxElement) {
    const current = state.letterAssignments[key];
    let name;

    if (current) {
        const action = prompt(`האות "${letter}" משויכת ל-${current}.\nלהסיר? (הקלד "הסר") או הזן שם חדש:`);
        if (action === null) return;
        if (action === 'הסר' || action === '') {
            delete state.letterAssignments[key];
            saveLetterAssignments();
            refreshLetters();
            return;
        }
        name = action;
    } else {
        name = prompt(`הזן את שם המשתתף שייקח את האות "${letter}":`);
        if (!name) return;
    }

    state.letterAssignments[key] = name;
    saveLetterAssignments();
    refreshLetters();
}

function refreshLetters() {
    initLetters();
}

// --- Azkara Management ---
function initAzkaraAdmin() {
    const saveBtn = document.getElementById('save-azkara-btn');
    saveBtn.addEventListener('click', saveAzkaraFromForm);

    // Load current values
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

    // Clear form
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

    // End time: 1 hour later
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

function generatePdf() {
    const azkara = state.azkara;
    const people = [];
    if (azkara.forPerson === 'both' || azkara.forPerson === 'shlomo') people.push({ data: CONFIG.people.shlomo, key: 'shlomo' });
    if (azkara.forPerson === 'both' || azkara.forPerson === 'doris') people.push({ data: CONFIG.people.doris, key: 'doris' });

    // Get checked items
    const checkedItems = [];
    document.querySelectorAll('#seder-checklist input[type="checkbox"]:checked').forEach(cb => {
        checkedItems.push(cb.value);
    });

    // Build PDF content
    const pdfDiv = document.getElementById('pdf-content');
    pdfDiv.classList.remove('hidden');

    let html = `<div class="pdf-page">`;
    html += `<h1>סדר אזכרה ${azkara.yearLabel}</h1>`;
    html += `<h1>${getPersonTitle(azkara.forPerson)}</h1>`;

    people.forEach(p => {
        const genderPrefix = p.data.gender === 'male' ? 'נפטר' : 'נפטרה';
        html += `<p style="text-align:center;">${p.data.name} - ${genderPrefix}: ${p.data.deathDateHebrew} | ${formatDate(p.data.deathDateGregorian)}</p>`;
    });

    const dateParts = azkara.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    html += `<p style="text-align:center;">${formattedDate} | ${azkara.time} | ${azkara.location}</p>`;
    html += `<div class="separator">✦ ✦ ✦</div>`;

    // Candle
    if (checkedItems.includes('candle')) {
        html += buildPrayerSection(PRAYERS.candle);
    }

    // Tehillim by letters - for each person
    if (checkedItems.includes('tehillim')) {
        people.forEach(p => {
            html += `<div class="separator">✦</div>`;
            html += `<h2>תהילים לפי אותיות השם - ${p.data.fullNameHebrew}</h2>`;

            p.data.lettersForTehillim.forEach((letter, index) => {
                const key = `${p.key}_${index}`;
                const assignee = state.letterAssignments[key] || '';

                if (PSALM_119[letter]) {
                    const assigneeText = assignee ? ` (${assignee})` : '';
                    html += `<h2>${PSALM_119[letter].title}${assigneeText}</h2>`;
                    html += `<div class="prayer-text">${PSALM_119[letter].verses}</div>`;
                }
            });
        });
    }

    // Psalm 91
    if (checkedItems.includes('psalm91')) {
        html += buildPrayerSection(PRAYERS.psalm91);
    }

    // Psalm 121
    if (checkedItems.includes('psalm121')) {
        html += buildPrayerSection(PRAYERS.psalm121);
    }

    // Hashkava - for each person
    if (checkedItems.includes('hashkava')) {
        people.forEach(p => {
            const hashkava = p.data.gender === 'male' ? PRAYERS.hashkava_male : PRAYERS.hashkava_female;
            html += buildPrayerSection(hashkava);
        });
    }

    // Kaddish
    if (checkedItems.includes('kaddish')) {
        html += buildPrayerSection(PRAYERS.kaddish);
    }

    html += `<div class="separator">✦ ✦ ✦</div>`;
    html += `<p style="text-align:center; font-size:1.3rem;">ת.נ.צ.ב.ה</p>`;
    html += `</div>`;

    pdfDiv.innerHTML = html;

    // Generate PDF
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

// --- Local Storage Helpers ---
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

function loadLetterAssignments() {
    const saved = localStorage.getItem('letterAssignments');
    if (saved) return JSON.parse(saved);
    return {};
}

function saveLetterAssignments() {
    localStorage.setItem('letterAssignments', JSON.stringify(state.letterAssignments));
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
}

// Start
document.addEventListener('DOMContentLoaded', initAuth);
