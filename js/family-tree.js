// family-tree.js - Dynamic family tree with SVG lines

var FAMILY_DATA = {
    name: 'שלמה ודוריס לוי ז"ל',
    info: 'שלמה 1928 | דוריס 1933',
    level: 'root',
    children: [
        {
            name: 'אלי ושרית לוי',
            info: 'שרית 10.11.1959',
            level: 'child',
            children: [
                { name: 'שגיא לוי', info: '03.07.1991', level: 'gc', spouse: 'נועה' },
                { name: 'יניב לוי', info: '', level: 'gc', spouse: 'אנטוניו' }
            ]
        },
        {
            name: 'לילך ושאולי ספיבק',
            info: 'לילך 04.03.1968 | שאולי 06.12.1959 | נישואים 03.06',
            level: 'child',
            children: [
                {
                    name: 'אלי ולילך ספיבק',
                    info: 'אלי 03.11.1987 | לילך 25.10.1991',
                    level: 'gc',
                    children: [
                        { name: 'עלמה', info: '', level: 'ggc' },
                        { name: 'עידן', info: '', level: 'ggc' }
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
                { name: 'דין וים ספיבק', info: 'דין 21.11.1996 | ים 25.04.1997', level: 'gc' },
                { name: 'אדם ספיבק', info: '20.01.2004', level: 'gc' }
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
    var birth = new Date(y, m, d);
    var now = new Date();
    var age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) age--;
    return age;
}

function buildInfoTooltip(info) {
    if (!info) return '';
    var parts = info.split('|');
    var lines = [];
    parts.forEach(function(p) {
        p = p.trim();
        var dateMatch = p.match(/(\d{2}\.\d{2}\.\d{4})/);
        if (dateMatch && p.indexOf('נישואים') === -1) {
            var age = calcAgeFromDate(dateMatch[1]);
            lines.push(age !== null ? p + ' (גיל ' + age + ')' : p);
        } else {
            lines.push(p);
        }
    });
    return lines.join('\n');
}

function renderFamilyTree() {
    var container = document.getElementById('family-tree-container');
    if (!container) return;

    var html = '<div class="ft">';
    html += renderNode(FAMILY_DATA);
    html += '</div>';
    container.innerHTML = html;

    // Add tooltip listeners
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
    var hasChildren = node.children && node.children.length > 0;
    var cls = 'ft-node ft-' + node.level;
    var infoAttr = node.info ? ' data-info="' + escHtml(node.info) + '"' : '';
    var displayName = node.name;
    if (node.spouse) displayName += ' ו' + node.spouse;

    var html = '<div class="ft-item">';
    html += '<div class="' + cls + '"' + infoAttr + '>' + escHtml(displayName) + '</div>';

    if (hasChildren) {
        html += '<div class="ft-down-line"></div>';
        html += '<div class="ft-children">';
        // Horizontal connector
        if (node.children.length > 1) {
            html += '<div class="ft-h-line"></div>';
        }
        html += '<div class="ft-children-row">';
        node.children.forEach(function(child) {
            html += '<div class="ft-child-wrapper">';
            html += '<div class="ft-up-line"></div>';
            html += renderNode(child);
            html += '</div>';
        });
        html += '</div>';
        html += '</div>';
    }

    html += '</div>';
    return html;
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Tooltip
function showTreeTooltip(el) {
    hideAllTooltips();
    var info = el.dataset.info;
    if (!info) return;
    var text = buildInfoTooltip(info);
    var tip = document.createElement('div');
    tip.className = 'ft-tooltip';
    tip.textContent = text;
    tip.style.whiteSpace = 'pre-line';
    el.appendChild(tip);
}

function hideTreeTooltip(el) {
    var tip = el.querySelector('.ft-tooltip');
    if (tip) tip.remove();
}

function hideAllTooltips() {
    document.querySelectorAll('.ft-tooltip').forEach(function(t) { t.remove(); });
}

document.addEventListener('click', hideAllTooltips);
