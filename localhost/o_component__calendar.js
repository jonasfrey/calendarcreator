// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import {
    f_o_html_from_o_js,
} from "./lib/handyhelpers.js"

let a_s_month_name = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let a_s_day_name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let a_s_month_short = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Seasonal artwork follows the month in both previews and printed calendars.
let a_a_s_month_emoji = [
    ['❄️', '⛄', '🧤'],
    ['💕', '💌', '🌹'],
    ['🌱', '🍀', '🌦️'],
    ['🌷', '🐰', '🦋'],
    ['🌸', '🐝', '🌼'],
    ['☀️', '🍒', '🌻'],
    ['🏖️', '🌊', '🐚'],
    ['🌻', '🍉', '🍦'],
    ['🍎', '🌾', '🍇'],
    ['🎃', '👻', '🦇', '🍁'],
    ['🍂', '🍁', '🎃', '🍄'],
    ['🎄', '🎁', '❄️'],
];

let f_s_month_icons = function(n_month) {
    return a_a_s_month_emoji[n_month].join(' ');
};

let f_append_month_icons = function(o_element, n_month) {
    let o_icons = document.createElement('span');
    o_icons.className = 'seasonal_month_icons';
    o_icons.setAttribute('aria-hidden', 'true');
    o_icons.textContent = f_s_month_icons(n_month);
    o_element.appendChild(o_icons);
};

let f_build_cells_mini = function(n_year, n_month) {
    let o_first = new Date(n_year, n_month, 1);
    let n_days_in_month = new Date(n_year, n_month + 1, 0).getDate();
    let n_start_day = (o_first.getDay() + 6) % 7;
    let a_o = [];
    for (let n = 0; n < n_start_day; n++) {
        a_o.push({ n_day: 0 });
    }
    for (let n = 1; n <= n_days_in_month; n++) {
        a_o.push({ n_day: n });
    }
    let n_remainder = a_o.length % 7;
    if (n_remainder > 0) {
        for (let n = 0; n < 7 - n_remainder; n++) {
            a_o.push({ n_day: 0 });
        }
    }
    return a_o;
};

let f_build_cells_full = function(n_year, n_month) {
    let o_first = new Date(n_year, n_month, 1);
    let n_days_in_month = new Date(n_year, n_month + 1, 0).getDate();
    let n_start_day = (o_first.getDay() + 6) % 7;

    let o_today = new Date();
    let b_is_current_month = o_today.getFullYear() === n_year && o_today.getMonth() === n_month;
    let n_today = o_today.getDate();

    // previous month info
    let n_prev_month = n_month === 0 ? 11 : n_month - 1;
    let n_days_prev = new Date(n_year, n_month, 0).getDate();
    let s_prev_short = a_s_month_short[n_prev_month];

    // next month info
    let n_next_month = n_month === 11 ? 0 : n_month + 1;
    let s_next_short = a_s_month_short[n_next_month];

    let a_o = [];
    // empty cells before first day — fill with previous month days
    for (let n = 0; n < n_start_day; n++) {
        let n_d = n_days_prev - n_start_day + 1 + n;
        a_o.push({ n_day: 0, b_today: false, s_label: s_prev_short + ' ' + n_d });
    }
    for (let n = 1; n <= n_days_in_month; n++) {
        a_o.push({ n_day: n, b_today: b_is_current_month && n === n_today, s_label: '' });
    }
    // fill remaining cells — next month days
    let n_remainder = a_o.length % 7;
    if (n_remainder > 0) {
        for (let n = 0; n < 7 - n_remainder; n++) {
            a_o.push({ n_day: 0, b_today: false, s_label: s_next_short + ' ' + (n + 1) });
        }
    }
    return a_o;
};

// simple seeded PRNG (mulberry32)
let f_make_rng = function(n_seed) {
    return function() {
        n_seed |= 0; n_seed = n_seed + 0x6D2B79F5 | 0;
        let t = Math.imul(n_seed ^ n_seed >>> 15, 1 | n_seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
};

let f_a_o_butterfly = function(n_year, n_month, n_cell_count) {
    let f_rng = f_make_rng(n_year * 13 + n_month * 397);
    let a_o = [];
    for (let i = 0; i < n_cell_count; i++) {
        let a = [];
        // ~60% chance of a butterfly, up to 2 per cell
        if (f_rng() < 0.6) {
            a.push({
                n_size: 1.8 + f_rng() * 1.6,
                n_rot: (f_rng() - 0.5) * 50,
                n_hue: Math.floor(f_rng() * 360),
                n_opacity: 0.18 + f_rng() * 0.18,
                b_flip: f_rng() > 0.5,
                b_top: f_rng() > 0.5,
                b_left: f_rng() > 0.5,
            });
        }
        if (f_rng() < 0.35) {
            a.push({
                n_size: 1.6 + f_rng() * 1.4,
                n_rot: (f_rng() - 0.5) * 50,
                n_hue: Math.floor(f_rng() * 360),
                n_opacity: 0.15 + f_rng() * 0.15,
                b_flip: f_rng() > 0.5,
                b_top: f_rng() < 0.5,
                b_left: f_rng() < 0.5,
            });
        }
        a_o.push(a);
    }
    return a_o;
};

let a_s_bug_emoji = ['\uD83D\uDC1E', '\uD83D\uDC1B', '\uD83D\uDC1C', '\uD83E\uDEB2', '\uD83E\uDD97'];

let f_a_o_icon = function(n_year, n_month, n_cell_count, a_s_emoji) {
    let f_rng = f_make_rng(n_year * 17 + n_month * 523);
    let a_o = [];
    for (let i = 0; i < n_cell_count; i++) {
        let a = [];
        if (f_rng() < 0.55) {
            a.push({
                s_emoji: a_s_emoji[Math.floor(f_rng() * a_s_emoji.length)],
                n_size: 1.6 + f_rng() * 1.4,
                n_rot: (f_rng() - 0.5) * 60,
                n_opacity: 0.22 + f_rng() * 0.18,
                b_flip: f_rng() > 0.5,
                b_top: f_rng() > 0.5,
                b_left: f_rng() > 0.5,
            });
        }
        if (f_rng() < 0.3) {
            a.push({
                s_emoji: a_s_emoji[Math.floor(f_rng() * a_s_emoji.length)],
                n_size: 1.4 + f_rng() * 1.2,
                n_rot: (f_rng() - 0.5) * 60,
                n_opacity: 0.18 + f_rng() * 0.14,
                b_flip: f_rng() > 0.5,
                b_top: f_rng() < 0.5,
                b_left: f_rng() < 0.5,
            });
        }
        a_o.push(a);
    }
    return a_o;
};

let f_a_o_bug = function(n_year, n_month, n_cell_count) {
    return f_a_o_icon(n_year, n_month, n_cell_count, a_s_bug_emoji);
};

let f_a_o_seasonal = function(n_year, n_month, n_cell_count) {
    return f_a_o_icon(n_year, n_month, n_cell_count, a_a_s_month_emoji[n_month]).map(function(a_icons) {
        return a_icons.map(function(o_icon) {
            // Keep the upper-left day number clear in the monthly calendar.
            o_icon.b_top = false;
            return { s_emoji: o_icon.s_emoji, s_style: f_s_icon_style(o_icon) };
        });
    });
};

let f_append_seasonal_icons = function(o_element, a_icons, b_mini = false) {
    for (let o_icon of a_icons) {
        let o_span = document.createElement('span');
        o_span.className = 'seasonal_deco' + (b_mini ? ' year_overview_deco' : '');
        o_span.setAttribute('aria-hidden', 'true');
        o_span.textContent = o_icon.s_emoji;
        o_span.style.cssText = o_icon.s_style;
        o_element.appendChild(o_span);
    }
};

let f_s_icon_style = function(o_b) {
    let s = 'position:absolute;pointer-events:none;font-size:' + o_b.n_size.toFixed(1) + 'rem;';
    s += 'opacity:' + o_b.n_opacity.toFixed(2) + ';';
    let s_transform = 'rotate(' + o_b.n_rot.toFixed(0) + 'deg)';
    if (o_b.b_flip) s_transform += ' scaleX(-1)';
    s += 'transform:' + s_transform + ';';
    s += o_b.b_top ? 'top:0;' : 'bottom:0;';
    s += o_b.b_left ? 'left:0;' : 'right:0;';
    return s;
};

let f_s_butterfly_style = function(o_b) {
    let s = 'position:absolute;pointer-events:none;font-size:' + o_b.n_size.toFixed(1) + 'rem;';
    s += 'opacity:' + o_b.n_opacity.toFixed(2) + ';';
    s += 'filter:hue-rotate(' + o_b.n_hue + 'deg);';
    let s_transform = 'rotate(' + o_b.n_rot.toFixed(0) + 'deg)';
    if (o_b.b_flip) s_transform += ' scaleX(-1)';
    s += 'transform:' + s_transform + ';';
    s += o_b.b_top ? 'top:0;' : 'bottom:0;';
    s += o_b.b_left ? 'left:0;' : 'right:0;';
    return s;
};

let o_component__calendar = {
    name: 'component-calendar',
    template: (await f_o_html_from_o_js({
        ':class': "'calendar_page theme_' + s_theme + ' visual_' + s_visual_theme",
        a_o: [
            {
                class: "calendar_controls no_print",
                a_o: [
                    {
                        s_tag: "div",
                        class: "interactable calendar_btn",
                        'v-on:click': "f_prev_month",
                        innerText: "\u25C0",
                    },
                    {
                        s_tag: "select",
                        class: "calendar_select",
                        'v-model.number': "n_month",
                        a_o: [
                            {
                                s_tag: "option",
                                'v-for': "(s_name, n_idx) in a_s_month_name",
                                ':value': "n_idx",
                                innerText: "{{ s_name }}",
                            }
                        ]
                    },
                    {
                        s_tag: "input",
                        class: "calendar_input_year",
                        type: "number",
                        'v-model.number': "n_year",
                        min: "1900",
                        max: "2100",
                    },
                    {
                        s_tag: "div",
                        class: "interactable calendar_btn",
                        'v-on:click': "f_next_month",
                        innerText: "\u25B6",
                    },
                    {
                        s_tag: "select",
                        class: "calendar_select",
                        'v-model': "s_paper_size",
                        a_o: [
                            {
                                s_tag: "option",
                                value: "A3",
                                innerText: "A3",
                            },
                            {
                                s_tag: "option",
                                value: "A4",
                                innerText: "A4",
                            },
                            {
                                s_tag: "option",
                                value: "A5",
                                innerText: "A5",
                            },
                            {
                                s_tag: "option",
                                value: "Letter",
                                innerText: "Letter",
                            },
                        ]
                    },
                    {
                        s_tag: "select",
                        class: "calendar_select",
                        'v-model': "s_theme",
                        a_o: [
                            {
                                s_tag: "option",
                                value: "dark",
                                innerText: "Dark",
                            },
                            {
                                s_tag: "option",
                                value: "light",
                                innerText: "Light",
                            },
                        ]
                    },
                    {
                        s_tag: "select",
                        class: "calendar_select",
                        'v-model': "s_visual_theme",
                        'aria-label': "Calendar decorations",
                        a_o: [
                            {
                                s_tag: "option",
                                value: "seasonal",
                                innerText: "Seasonal (by month)",
                            },
                            {
                                s_tag: "option",
                                value: "none",
                                innerText: "No decoration",
                            },
                            {
                                s_tag: "option",
                                value: "butterflies",
                                innerText: "Butterflies",
                            },
                            {
                                s_tag: "option",
                                value: "bugs",
                                innerText: "Bugs",
                            },
                        ]
                    },
                    {
                        s_tag: "select",
                        class: "calendar_select",
                        'v-model': "s_year_layout",
                        a_o: [
                            {
                                s_tag: "option",
                                value: "none",
                                innerText: "Monthly view",
                            },
                            {
                                s_tag: "option",
                                value: "grid",
                                innerText: "Year grid",
                            },
                            {
                                s_tag: "option",
                                value: "columns",
                                innerText: "Year columns",
                            },
                            {
                                s_tag: "option",
                                value: "rows",
                                innerText: "Year rows",
                            },
                        ]
                    },
                    {
                        s_tag: "div",
                        class: "interactable calendar_btn calendar_btn_print",
                        'v-on:click': "f_print",
                        innerText: "Print",
                    },
                ]
            },
            {
                class: "calendar_grid_wrapper",
                ':class': "'paper_' + s_paper_size",
                'v-if': "s_year_layout === 'none'",
                a_o: [
                    {
                        s_tag: "div",
                        class: "calendar_title",
                        a_o: [
                            { s_tag: "span", innerText: "{{ a_s_month_name[n_month] }} {{ n_year }}" },
                            {
                                s_tag: "span",
                                class: "seasonal_month_icons",
                                'v-if': "s_visual_theme === 'seasonal'",
                                'aria-hidden': "true",
                                innerText: "{{ f_s_month_icons(n_month) }}",
                            },
                        ],
                    },
                    {
                        class: "calendar_grid",
                        ':style': "'--n-rows:' + n_rows",
                        a_o: [
                            {
                                s_tag: "div",
                                class: "calendar_day_header",
                                'v-for': "s_day in a_s_day_name",
                                innerText: "{{ s_day }}",
                            },
                            {
                                s_tag: "div",
                                'v-for': "(o_cell, n_idx) in a_o_cell",
                                ':class': "['calendar_cell', { calendar_cell_empty: !o_cell.n_day, calendar_cell_today: o_cell.b_today }]",
                                a_o: [
                                    {
                                        s_tag: "span",
                                        class: "calendar_day_number",
                                        'v-if': "o_cell.n_day",
                                        innerText: "{{ o_cell.n_day }}",
                                    },
                                    {
                                        s_tag: "span",
                                        class: "calendar_empty_label",
                                        'v-if': "!o_cell.n_day && o_cell.s_label",
                                        innerText: "{{ o_cell.s_label }}",
                                    },
                                    {
                                        s_tag: "span",
                                        class: "seasonal_deco",
                                        'v-for': "o_icon in a_a_o_seasonal[n_idx]",
                                        'v-if': "s_visual_theme === 'seasonal' && o_cell.n_day",
                                        ':style': "o_icon.s_style",
                                        'aria-hidden': "true",
                                        innerText: "{{ o_icon.s_emoji }}",
                                    },
                                    {
                                        s_tag: "span",
                                        class: "butterfly",
                                        'v-for': "o_b in a_a_o_butterfly[n_idx]",
                                        'v-if': "s_visual_theme === 'butterflies' && o_cell.n_day",
                                        ':style': "o_b.s_style",
                                        innerText: "\uD83E\uDD8B",
                                    },
                                    {
                                        s_tag: "span",
                                        class: "bug_deco",
                                        'v-for': "o_b in a_a_o_bug[n_idx]",
                                        'v-if': "s_visual_theme === 'bugs' && o_cell.n_day",
                                        ':style': "o_b.s_style",
                                        innerText: "{{ o_b.s_emoji }}",
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                class: "year_overview_wrapper paper_A3",
                'v-if': "s_year_layout === 'grid'",
                a_o: [
                    {
                        s_tag: "div",
                        class: "year_overview_title",
                        innerText: "{{ n_year }}",
                    },
                    {
                        class: "year_overview_grid",
                        a_o: [
                            {
                                class: "year_overview_month",
                                'v-for': "(o_mo, n_idx) in a_o_year_overview",
                                a_o: [
                                    {
                                        s_tag: "div",
                                        class: "year_overview_month_name",
                                        a_o: [
                                            { s_tag: "span", innerText: "{{ o_mo.s_name }}" },
                                            {
                                                s_tag: "span",
                                                class: "seasonal_month_icons",
                                                'v-if': "s_visual_theme === 'seasonal'",
                                                'aria-hidden': "true",
                                                innerText: "{{ f_s_month_icons(n_idx) }}",
                                            },
                                        ],
                                    },
                                    {
                                        class: "year_overview_mini_grid",
                                        a_o: [
                                            {
                                                s_tag: "div",
                                                class: "year_overview_day_header",
                                                'v-for': "s_d in a_s_day_short",
                                                innerText: "{{ s_d }}",
                                            },
                                            {
                                                s_tag: "div",
                                                'v-for': "(o_cell, n_ci) in o_mo.a_o_cell",
                                                ':class': "['year_overview_cell', { year_overview_cell_empty: !o_cell.n_day }]",
                                                a_o: [
                                                    {
                                                        s_tag: "span",
                                                        class: "year_overview_day_num",
                                                        'v-if': "o_cell.n_day",
                                                        innerText: "{{ o_cell.n_day }}",
                                                    },
                                                    {
                                                        s_tag: "span",
                                                        class: "seasonal_deco year_overview_deco",
                                                        'v-for': "o_icon in o_mo.a_a_o_seasonal[n_ci]",
                                                        'v-if': "s_visual_theme === 'seasonal' && o_cell.n_day",
                                                        ':style': "o_icon.s_style",
                                                        'aria-hidden': "true",
                                                        innerText: "{{ o_icon.s_emoji }}",
                                                    },
                                                    {
                                                        s_tag: "span",
                                                        class: "butterfly year_overview_deco",
                                                        'v-for': "o_b in o_mo.a_a_o_bf[n_ci]",
                                                        'v-if': "s_visual_theme === 'butterflies' && o_cell.n_day",
                                                        ':style': "o_b.s_style",
                                                        innerText: "\uD83E\uDD8B",
                                                    },
                                                    {
                                                        s_tag: "span",
                                                        class: "bug_deco year_overview_deco",
                                                        'v-for': "o_b in o_mo.a_a_o_bug[n_ci]",
                                                        'v-if': "s_visual_theme === 'bugs' && o_cell.n_day",
                                                        ':style': "o_b.s_style",
                                                        innerText: "{{ o_b.s_emoji }}",
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                class: "year_columns_wrapper paper_A3",
                'v-if': "s_year_layout === 'columns'",
                a_o: [
                    {
                        s_tag: "div",
                        class: "year_overview_title",
                        innerText: "{{ n_year }}",
                    },
                    {
                        class: "year_columns_grid",
                        a_o: [
                            {
                                s_tag: "div",
                                'v-for': "o_c in a_o_year_columns_flat",
                                ':class': "o_c.s_cls",
                                a_o: [
                                    { s_tag: "span", innerText: "{{ o_c.s_text }}" },
                                    {
                                        s_tag: "span",
                                        class: "seasonal_month_icons",
                                        'v-if': "s_visual_theme === 'seasonal' && o_c.n_month != null",
                                        'aria-hidden': "true",
                                        innerText: "{{ f_s_month_icons(o_c.n_month) }}",
                                    },
                                ],
                            },
                        ]
                    },
                ]
            },
            {
                class: "year_rows_wrapper paper_A3",
                'v-if': "s_year_layout === 'rows'",
                a_o: [
                    {
                        s_tag: "div",
                        class: "year_overview_title",
                        innerText: "{{ n_year }}",
                    },
                    {
                        class: "year_rows_grid",
                        a_o: [
                            {
                                s_tag: "div",
                                'v-for': "o_c in a_o_year_rows_flat",
                                ':class': "o_c.s_cls",
                                a_o: [
                                    { s_tag: "span", innerText: "{{ o_c.s_text }}" },
                                    {
                                        s_tag: "span",
                                        class: "seasonal_month_icons",
                                        'v-if': "s_visual_theme === 'seasonal' && o_c.n_month != null",
                                        'aria-hidden': "true",
                                        innerText: "{{ f_s_month_icons(o_c.n_month) }}",
                                    },
                                ],
                            },
                        ]
                    },
                ]
            },
        ]
    })).outerHTML,
    data: function() {
        let o_now = new Date();
        return {
            n_month: o_now.getMonth(),
            n_year: o_now.getFullYear(),
            a_s_month_name,
            a_s_day_name,
            s_paper_size: 'A3',
            s_theme: 'dark',
            s_visual_theme: 'seasonal',
            s_year_layout: 'none',
            a_s_day_short: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        };
    },
    computed: {
        a_o_cell: function() {
            return f_build_cells_full(this.n_year, this.n_month);
        },
        n_rows: function() {
            return this.a_o_cell.length / 7;
        },
        a_a_o_seasonal: function() {
            if (this.s_visual_theme !== 'seasonal') return [];
            return f_a_o_seasonal(this.n_year, this.n_month, this.a_o_cell.length);
        },
        a_a_o_butterfly: function() {
            let a_raw = f_a_o_butterfly(this.n_year, this.n_month, this.a_o_cell.length);
            return a_raw.map(function(a_b) {
                return a_b.map(function(o_b) {
                    return { s_style: f_s_butterfly_style(o_b) };
                });
            });
        },
        a_o_year_overview: function() {
            let n_y = this.n_year;
            let s_vt = this.s_visual_theme;
            let a = [];
            for (let m = 0; m < 12; m++) {
                let a_cells = f_build_cells_mini(n_y, m);
                let a_a_bf = [];
                let a_a_bg = [];
                if (s_vt === 'butterflies') {
                    let a_raw = f_a_o_butterfly(n_y, m, a_cells.length);
                    a_a_bf = a_raw.map(function(a_b) {
                        return a_b.map(function(o_b) {
                            return { s_style: f_s_butterfly_style(o_b) };
                        });
                    });
                } else if (s_vt === 'bugs') {
                    let a_raw = f_a_o_bug(n_y, m, a_cells.length);
                    a_a_bg = a_raw.map(function(a_b) {
                        return a_b.map(function(o_b) {
                            return { s_style: f_s_icon_style(o_b), s_emoji: o_b.s_emoji };
                        });
                    });
                }
                a.push({
                    s_name: a_s_month_name[m],
                    a_o_cell: a_cells,
                    a_a_o_bf: a_a_bf,
                    a_a_o_bug: a_a_bg,
                    a_a_o_seasonal: s_vt === 'seasonal' ? f_a_o_seasonal(n_y, m, a_cells.length) : [],
                });
            }
            return a;
        },
        a_o_year_columns_flat: function() {
            let n_y = this.n_year;
            let a = [];
            // header row: corner + 12 month headers
            a.push({ s_cls: 'year_columns_corner', s_text: '' });
            for (let m = 0; m < 12; m++) {
                a.push({ s_cls: 'year_columns_month_header' + (m % 2 === 1 ? ' year_columns_header_alt' : ''), s_text: a_s_month_short[m], n_month: m });
            }
            // 31 day rows
            for (let d = 1; d <= 31; d++) {
                a.push({ s_cls: 'year_columns_day_label', s_text: '' + d });
                for (let m = 0; m < 12; m++) {
                    let n_days = new Date(n_y, m + 1, 0).getDate();
                    let s_cls = 'year_columns_cell';
                    let s_text = '';
                    if (d > n_days) {
                        s_cls += ' year_columns_cell_empty';
                    } else {
                        let n_dow = new Date(n_y, m, d).getDay();
                        if (n_dow === 0 || n_dow === 6) s_cls += ' year_columns_cell_weekend';
                        s_text = '' + d;
                    }
                    if (m % 2 === 1) s_cls += ' year_columns_cell_alt';
                    a.push({ s_cls: s_cls, s_text: s_text });
                }
            }
            return a;
        },
        a_o_year_rows_flat: function() {
            let n_y = this.n_year;
            let a = [];
            // header row: corner + 31 day headers
            a.push({ s_cls: 'year_rows_corner', s_text: '' });
            for (let d = 1; d <= 31; d++) {
                a.push({ s_cls: 'year_rows_day_header', s_text: '' + d });
            }
            // 12 month rows
            for (let m = 0; m < 12; m++) {
                let n_days = new Date(n_y, m + 1, 0).getDate();
                let b_alt = m % 2 === 1;
                a.push({ s_cls: 'year_rows_month_label' + (b_alt ? ' year_rows_month_label_alt' : ''), s_text: a_s_month_short[m], n_month: m });
                for (let d = 1; d <= 31; d++) {
                    let s_cls = 'year_rows_cell';
                    let s_text = '';
                    if (d > n_days) {
                        s_cls += ' year_rows_cell_empty';
                    } else {
                        let n_dow = new Date(n_y, m, d).getDay();
                        if (n_dow === 0 || n_dow === 6) s_cls += ' year_rows_cell_weekend';
                        s_text = '' + d;
                    }
                    if (b_alt) s_cls += ' year_rows_cell_alt';
                    a.push({ s_cls: s_cls, s_text: s_text });
                }
            }
            return a;
        },
        a_a_o_bug: function() {
            let a_raw = f_a_o_bug(this.n_year, this.n_month, this.a_o_cell.length);
            return a_raw.map(function(a_b) {
                return a_b.map(function(o_b) {
                    return { s_style: f_s_icon_style(o_b), s_emoji: o_b.s_emoji };
                });
            });
        },
    },
    methods: {
        f_s_month_icons,
        f_prev_month: function() {
            if (this.n_month === 0) {
                this.n_month = 11;
                this.n_year--;
            } else {
                this.n_month--;
            }
        },
        f_next_month: function() {
            if (this.n_month === 11) {
                this.n_month = 0;
                this.n_year++;
            } else {
                this.n_month++;
            }
        },
        f_build_cells: function(n_year, n_month) {
            return f_build_cells_full(n_year, n_month);
        },
        f_print: function() {
            let o_self = this;
            let s_size = o_self.s_year_layout !== 'none' ? 'A3' : o_self.s_paper_size;
            let s_theme_class = 'theme_' + o_self.s_theme;
            let s_visual_class = 'visual_' + o_self.s_visual_theme;
            let b_butterflies = o_self.s_visual_theme === 'butterflies';
            let b_bugs = o_self.s_visual_theme === 'bugs';
            let b_seasonal = o_self.s_visual_theme === 'seasonal';

            let o_container = document.createElement('div');
            o_container.className = 'print_container ' + s_theme_class + ' ' + s_visual_class;

            if (o_self.s_year_layout !== 'none') {
                let o_page = document.createElement('div');
                let s_page_class = 'print_page';

                if (o_self.s_year_layout === 'grid') {
                    s_page_class += ' print_page_year_overview';
                } else if (o_self.s_year_layout === 'columns') {
                    s_page_class += ' print_page_year_columns';
                } else if (o_self.s_year_layout === 'rows') {
                    s_page_class += ' print_page_year_rows';
                }
                o_page.className = s_page_class;

                let o_title = document.createElement('div');
                o_title.className = 'year_overview_title';
                o_title.textContent = o_self.n_year;
                o_page.appendChild(o_title);

                if (o_self.s_year_layout === 'grid') {
                    let o_grid = document.createElement('div');
                    o_grid.className = 'year_overview_grid';

                    for (let n_m = 0; n_m < 12; n_m++) {
                        let a_cells = f_build_cells_mini(o_self.n_year, n_m);
                        let a_a_b = b_butterflies ? f_a_o_butterfly(o_self.n_year, n_m, a_cells.length) : [];
                        let a_a_bug = b_bugs ? f_a_o_bug(o_self.n_year, n_m, a_cells.length) : [];
                        let a_a_seasonal = b_seasonal ? f_a_o_seasonal(o_self.n_year, n_m, a_cells.length) : [];

                        let o_mo = document.createElement('div');
                        o_mo.className = 'year_overview_month';

                        let o_name = document.createElement('div');
                        o_name.className = 'year_overview_month_name';
                        o_name.textContent = a_s_month_name[n_m];
                        if (b_seasonal) f_append_month_icons(o_name, n_m);
                        o_mo.appendChild(o_name);

                        let o_mini = document.createElement('div');
                        o_mini.className = 'year_overview_mini_grid';

                        let a_hdr = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                        for (let h = 0; h < 7; h++) {
                            let o_h = document.createElement('div');
                            o_h.className = 'year_overview_day_header';
                            o_h.textContent = a_hdr[h];
                            o_mini.appendChild(o_h);
                        }

                        for (let i = 0; i < a_cells.length; i++) {
                            let o_c = document.createElement('div');
                            o_c.className = 'year_overview_cell' + (a_cells[i].n_day ? '' : ' year_overview_cell_empty');
                            if (a_cells[i].n_day) {
                                let o_num = document.createElement('span');
                                o_num.className = 'year_overview_day_num';
                                o_num.textContent = a_cells[i].n_day;
                                o_c.appendChild(o_num);
                                if (b_seasonal) f_append_seasonal_icons(o_c, a_a_seasonal[i], true);
                                if (b_butterflies && a_a_b[i]) {
                                    for (let j = 0; j < a_a_b[i].length; j++) {
                                        let o_bf = document.createElement('span');
                                        o_bf.className = 'butterfly year_overview_deco';
                                        o_bf.textContent = '\uD83E\uDD8B';
                                        o_bf.style.cssText = f_s_butterfly_style(a_a_b[i][j]);
                                        o_c.appendChild(o_bf);
                                    }
                                }
                                if (b_bugs && a_a_bug[i]) {
                                    for (let j = 0; j < a_a_bug[i].length; j++) {
                                        let o_bg = document.createElement('span');
                                        o_bg.className = 'bug_deco year_overview_deco';
                                        o_bg.textContent = a_a_bug[i][j].s_emoji;
                                        o_bg.style.cssText = f_s_icon_style(a_a_bug[i][j]);
                                        o_c.appendChild(o_bg);
                                    }
                                }
                            }
                            o_mini.appendChild(o_c);
                        }

                        o_mo.appendChild(o_mini);
                        o_grid.appendChild(o_mo);
                    }

                    o_page.appendChild(o_grid);
                } else if (o_self.s_year_layout === 'columns') {
                    let o_grid = document.createElement('div');
                    o_grid.className = 'year_columns_grid';

                    let o_corner = document.createElement('div');
                    o_corner.className = 'year_columns_corner';
                    o_grid.appendChild(o_corner);

                    let a_linear = [];
                    for (let m = 0; m < 12; m++) {
                        let n_days = new Date(o_self.n_year, m + 1, 0).getDate();
                        let a_days = [];
                        for (let d = 1; d <= 31; d++) {
                            if (d <= n_days) {
                                let n_dow = new Date(o_self.n_year, m, d).getDay();
                                a_days.push({ n_day: d, b_weekend: n_dow === 0 || n_dow === 6 });
                            } else {
                                a_days.push({ n_day: 0, b_weekend: false });
                            }
                        }
                        a_linear.push(a_days);

                        let o_hdr = document.createElement('div');
                        o_hdr.className = 'year_columns_month_header' + (m % 2 === 1 ? ' year_columns_header_alt' : '');
                        o_hdr.textContent = a_s_month_short[m];
                        if (b_seasonal) f_append_month_icons(o_hdr, m);
                        o_grid.appendChild(o_hdr);
                    }

                    for (let d = 0; d < 31; d++) {
                        let o_label = document.createElement('div');
                        o_label.className = 'year_columns_day_label';
                        o_label.textContent = d + 1;
                        o_grid.appendChild(o_label);

                        for (let m = 0; m < 12; m++) {
                            let o_day = a_linear[m][d];
                            let o_c = document.createElement('div');
                            let s_cls = 'year_columns_cell';
                            if (!o_day.n_day) s_cls += ' year_columns_cell_empty';
                            if (o_day.b_weekend) s_cls += ' year_columns_cell_weekend';
                            if (m % 2 === 1) s_cls += ' year_columns_cell_alt';
                            o_c.className = s_cls;
                            o_c.textContent = o_day.n_day || '';
                            o_grid.appendChild(o_c);
                        }
                    }

                    o_page.appendChild(o_grid);
                } else if (o_self.s_year_layout === 'rows') {
                    let o_grid = document.createElement('div');
                    o_grid.className = 'year_rows_grid';

                    let o_corner = document.createElement('div');
                    o_corner.className = 'year_rows_corner';
                    o_grid.appendChild(o_corner);

                    for (let d = 1; d <= 31; d++) {
                        let o_hdr = document.createElement('div');
                        o_hdr.className = 'year_rows_day_header';
                        o_hdr.textContent = d;
                        o_grid.appendChild(o_hdr);
                    }

                    for (let m = 0; m < 12; m++) {
                        let n_days = new Date(o_self.n_year, m + 1, 0).getDate();

                        let o_label = document.createElement('div');
                        o_label.className = 'year_rows_month_label' + (m % 2 === 1 ? ' year_rows_month_label_alt' : '');
                        o_label.textContent = a_s_month_short[m];
                        if (b_seasonal) f_append_month_icons(o_label, m);
                        o_grid.appendChild(o_label);

                        for (let d = 1; d <= 31; d++) {
                            let o_c = document.createElement('div');
                            let s_cls = 'year_rows_cell';
                            if (d > n_days) {
                                s_cls += ' year_rows_cell_empty';
                            } else {
                                let n_dow = new Date(o_self.n_year, m, d).getDay();
                                if (n_dow === 0 || n_dow === 6) s_cls += ' year_rows_cell_weekend';
                            }
                            if (m % 2 === 1) s_cls += ' year_rows_cell_alt';
                            o_c.className = s_cls;
                            o_c.textContent = d <= n_days ? d : '';
                            o_grid.appendChild(o_c);
                        }
                    }

                    o_page.appendChild(o_grid);
                }

                o_container.appendChild(o_page);

                document.body.appendChild(o_container);
                let o_style = document.createElement('style');
                o_style.textContent = '@page { size: A3 landscape; margin: 10mm; }';
                document.head.appendChild(o_style);
                window.print();
                document.head.removeChild(o_style);
                document.body.removeChild(o_container);
                return;
            }

            for (let n_m = 0; n_m < 12; n_m++) {
                let a_cells = o_self.f_build_cells(o_self.n_year, n_m);
                let n_rows = a_cells.length / 7;
                let a_a_b = b_butterflies ? f_a_o_butterfly(o_self.n_year, n_m, a_cells.length) : [];
                let a_a_bug = b_bugs ? f_a_o_bug(o_self.n_year, n_m, a_cells.length) : [];
                let a_a_seasonal = b_seasonal ? f_a_o_seasonal(o_self.n_year, n_m, a_cells.length) : [];

                let o_page = document.createElement('div');
                o_page.className = 'print_page';

                let o_title = document.createElement('div');
                o_title.className = 'calendar_title';
                o_title.textContent = a_s_month_name[n_m] + ' ' + o_self.n_year;
                if (b_seasonal) f_append_month_icons(o_title, n_m);
                o_page.appendChild(o_title);

                let o_grid = document.createElement('div');
                o_grid.className = 'calendar_grid';
                o_grid.style.setProperty('--n-rows', n_rows);

                for (let i = 0; i < a_s_day_name.length; i++) {
                    let o_hdr = document.createElement('div');
                    o_hdr.className = 'calendar_day_header';
                    o_hdr.textContent = a_s_day_name[i];
                    o_grid.appendChild(o_hdr);
                }

                for (let i = 0; i < a_cells.length; i++) {
                    let o_cell_data = a_cells[i];
                    let o_cell = document.createElement('div');
                    let s_cls = 'calendar_cell';
                    if (!o_cell_data.n_day) s_cls += ' calendar_cell_empty';
                    if (o_cell_data.b_today) s_cls += ' calendar_cell_today';
                    o_cell.className = s_cls;
                    if (o_cell_data.n_day) {
                        let o_span = document.createElement('span');
                        o_span.className = 'calendar_day_number';
                        o_span.textContent = o_cell_data.n_day;
                        o_cell.appendChild(o_span);
                        if (b_seasonal) f_append_seasonal_icons(o_cell, a_a_seasonal[i]);
                        if (b_butterflies && a_a_b[i]) {
                            for (let j = 0; j < a_a_b[i].length; j++) {
                                let o_bf = document.createElement('span');
                                o_bf.className = 'butterfly';
                                o_bf.textContent = '\uD83E\uDD8B';
                                o_bf.style.cssText = f_s_butterfly_style(a_a_b[i][j]);
                                o_cell.appendChild(o_bf);
                            }
                        }
                        if (b_bugs && a_a_bug[i]) {
                            for (let j = 0; j < a_a_bug[i].length; j++) {
                                let o_bg = document.createElement('span');
                                o_bg.className = 'bug_deco';
                                o_bg.textContent = a_a_bug[i][j].s_emoji;
                                o_bg.style.cssText = f_s_icon_style(a_a_bug[i][j]);
                                o_cell.appendChild(o_bg);
                            }
                        }
                    } else if (o_cell_data.s_label) {
                        let o_lbl = document.createElement('span');
                        o_lbl.className = 'calendar_empty_label';
                        o_lbl.textContent = o_cell_data.s_label;
                        o_cell.appendChild(o_lbl);
                    }
                    o_grid.appendChild(o_cell);
                }

                o_page.appendChild(o_grid);
                o_container.appendChild(o_page);
            }

            document.body.appendChild(o_container);

            let o_style = document.createElement('style');
            o_style.textContent = '@page { size: ' + s_size + ' landscape; margin: 10mm; }';
            document.head.appendChild(o_style);

            window.print();

            document.head.removeChild(o_style);
            document.body.removeChild(o_container);
        },
    },
};

export { o_component__calendar };
