// family-tree.js - Family tree with JS-positioned lines

var FAMILY_DATA = {
    name: 'שלמה ודוריס לוי ז"ל',
    info: 'שלמה 28.02.1928 | דוריס 1933',
    level: 'root',
    children: [
        {
            name: 'אלי ושרית לוי',
            info: 'אלי 21.12 | שרית 10.11.1959 | נישואים 28.02.1984',
            level: 'child',
            children: [
                { name: 'שגיא ונועה לוי', info: 'שגיא 03.07.1991 | נועה 10.11.1992 | נישואים 04.09.2024', level: 'gc' },
                { name: 'יניב ואנטוניו לוי', info: 'יניב 20.05.1987 | נישואים 13.06.2025', level: 'gc' }
            ]
        },
        {
            name: 'לילך ושאולי ספיבק',
            info: 'לילך 04.03.1964 | שאולי 06.12.1959 | נישואים 03.06',
            level: 'child',
            children: [
                {
                    name: 'אלי ולילך ספיבק',
                    info: 'אלי 03.11.1987 | לילך 25.10.1991 | נישואים 06.07.2018',
                    level: 'gc',
                    children: [
                        { name: 'עלמה', info: '26.04.2019', level: 'ggc' },
                        { name: 'עידן', info: '22.09.2023', level: 'ggc' }
                    ]
                },
                {
                    name: 'יהונתן ועדן ספיבק',
                    info: 'יהונתן 30.09.1991 | עדן 01.10.1991 | נישואים 19.10.2017',
                    level: 'gc',
                    children: [
                        { name: 'מיה', info: '02.11.2018', level: 'ggc' },
                        { name: 'ליאו', info: '26.08.2021', level: 'ggc' }
                    ]
                },
                { name: 'דין וים ספיבק', info: 'דין 21.11.1996 | ים 25.04.1997 | נישואים 06.11.2024', level: 'gc' },
                { name: 'אדם ספיבק', info: '21.01.2004', level: 'gc' }
            ]
        },
        {
            name: 'גילי ומיכל לוי',
            info: 'גילי 21.07.1971 | מיכל 07.10.1974 | נישואים 31.07.1996',
            level: 'child',
            children: [
                { name: 'עומר לוי', info: '23.01.2001', level: 'gc' },
                { name: 'נועם לוי', info: '06.03.2004', level: 'gc' },
                { name: 'ליהיא לוי', info: '06.09.2009', level: 'gc' }
            ]
        }
    ]
};

function calcAgeFromDate(dateStr) {
    var parts = dateStr.split('.');
    if (parts.length < 3) return null;
    var d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
    if (y < 100) y += (y > 50 ? 1900 : 2000);
    var now = new Date();
    var age = now.getFullYear() - y;
    if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) age--;
    return age;
}

function buildInfoTooltip(info) {
    if (!info) return '';
    return info.split('|').map(function(p) {
        p = p.trim();
        var dateMatch = p.match(/(\d{2}\.\d{2}\.\d{4})/);
        if (dateMatch && p.indexOf('נישואים') === -1) {
            var age = calcAgeFromDate(dateMatch[1]);
            return age !== null ? p + ' (גיל ' + age + ')' : p;
        }
        return p;
    }).join('\n');
}

function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderFamilyTree() {
    var container = document.getElementById('family-tree-container');
    if (!container) return;
    container.innerHTML = '<div class="ft" id="ft-root">' + renderNode(FAMILY_DATA) + '</div>';

    // Position horizontal lines after layout
    setTimeout(positionHLines, 50);
    window.addEventListener('resize', positionHLines);

    // Tooltips
    container.querySelectorAll('.ft-node[data-info]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            showTreeTooltip(this);
        });
        el.addEventListener('mouseenter', function() { showTreeTooltip(this); });
        el.addEventListener('mouseleave', function() { hideTreeTooltip(this); });
    });
}

function renderNode(node) {
    var hasKids = node.children && node.children.length > 0;
    var cls = 'ft-node ft-' + node.level;
    var infoAttr = node.info ? ' data-info="' + escHtml(node.info) + '"' : '';
    var name = node.spouse ? node.name + ' ו' + node.spouse : node.name;

    var h = '<div class="ft-item">';
    h += '<div class="' + cls + '"' + infoAttr + '>' + escHtml(name) + '</div>';

    if (hasKids) {
        h += '<div class="ft-vline"></div>';
        h += '<div class="ft-kids">';
        h += '<div class="ft-hline"></div>'; // positioned by JS
        h += '<div class="ft-kids-row">';
        node.children.forEach(function(kid) {
            h += '<div class="ft-kid-col">';
            h += '<div class="ft-vline-up"></div>';
            h += renderNode(kid);
            h += '</div>';
        });
        h += '</div></div>';
    }
    h += '</div>';
    return h;
}

// Position horizontal lines using actual DOM positions
function positionHLines() {
    document.querySelectorAll('.ft-kids').forEach(function(kids) {
        var hline = kids.querySelector(':scope > .ft-hline');
        var row = kids.querySelector(':scope > .ft-kids-row');
        if (!hline || !row) return;

        var cols = row.querySelectorAll(':scope > .ft-kid-col');
        if (cols.length < 2) { hline.style.display = 'none'; return; }

        var first = cols[0];
        var last = cols[cols.length - 1];
        var rowRect = row.getBoundingClientRect();
        var firstRect = first.getBoundingClientRect();
        var lastRect = last.getBoundingClientRect();

        // Center of first child to center of last child
        var leftPos = firstRect.left + firstRect.width / 2 - rowRect.left;
        var rightPos = lastRect.left + lastRect.width / 2 - rowRect.left;

        // Ensure left < right
        var l = Math.min(leftPos, rightPos);
        var r = Math.max(leftPos, rightPos);

        hline.style.display = 'block';
        hline.style.position = 'absolute';
        hline.style.top = '0';
        hline.style.left = l + 'px';
        hline.style.width = (r - l) + 'px';
        hline.style.height = '2px';
    });
}

// Tooltips
function showTreeTooltip(el) {
    hideAllTooltips();
    var info = el.dataset.info;
    if (!info) return;
    var tip = document.createElement('div');
    tip.className = 'ft-tooltip';
    tip.textContent = buildInfoTooltip(info);
    el.appendChild(tip);
}

function hideTreeTooltip(el) {
    var t = el.querySelector('.ft-tooltip');
    if (t) t.remove();
}

function hideAllTooltips() {
    document.querySelectorAll('.ft-tooltip').forEach(function(t) { t.remove(); });
}

document.addEventListener('click', hideAllTooltips);
