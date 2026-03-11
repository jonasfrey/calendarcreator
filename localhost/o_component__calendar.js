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
                        a_o: [
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
                a_o: [
                    {
                        s_tag: "div",
                        class: "calendar_title",
                        innerText: "{{ a_s_month_name[n_month] }} {{ n_year }}",
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
                                        class: "butterfly",
                                        'v-for': "o_b in a_a_o_butterfly[n_idx]",
                                        'v-if': "s_visual_theme === 'butterflies' && o_cell.n_day",
                                        ':style': "o_b.s_style",
                                        innerText: "\uD83E\uDD8B",
                                    },
                                ]
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
            s_visual_theme: 'none',
        };
    },
    computed: {
        a_o_cell: function() {
            return f_build_cells_full(this.n_year, this.n_month);
        },
        n_rows: function() {
            return this.a_o_cell.length / 7;
        },
        a_a_o_butterfly: function() {
            let a_raw = f_a_o_butterfly(this.n_year, this.n_month, this.a_o_cell.length);
            return a_raw.map(function(a_b) {
                return a_b.map(function(o_b) {
                    return { s_style: f_s_butterfly_style(o_b) };
                });
            });
        },
    },
    methods: {
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
            let s_size = o_self.s_paper_size;
            let s_theme_class = 'theme_' + o_self.s_theme;
            let s_visual_class = 'visual_' + o_self.s_visual_theme;
            let b_butterflies = o_self.s_visual_theme === 'butterflies';

            let o_container = document.createElement('div');
            o_container.className = 'print_container ' + s_theme_class + ' ' + s_visual_class;

            for (let n_m = 0; n_m < 12; n_m++) {
                let a_cells = o_self.f_build_cells(o_self.n_year, n_m);
                let n_rows = a_cells.length / 7;
                let a_a_b = b_butterflies ? f_a_o_butterfly(o_self.n_year, n_m, a_cells.length) : [];

                let o_page = document.createElement('div');
                o_page.className = 'print_page';

                let o_title = document.createElement('div');
                o_title.className = 'calendar_title';
                o_title.textContent = a_s_month_name[n_m] + ' ' + o_self.n_year;
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
                        if (b_butterflies && a_a_b[i]) {
                            for (let j = 0; j < a_a_b[i].length; j++) {
                                let o_bf = document.createElement('span');
                                o_bf.className = 'butterfly';
                                o_bf.textContent = '\uD83E\uDD8B';
                                o_bf.style.cssText = f_s_butterfly_style(a_a_b[i][j]);
                                o_cell.appendChild(o_bf);
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
