// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import {
    f_o_html_from_o_js,
} from "./lib/handyhelpers.js"

let a_s_month_name = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let a_s_day_name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let o_component__calendar = {
    name: 'component-calendar',
    template: (await f_o_html_from_o_js({
        class: "calendar_page",
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
                                'v-for': "o_cell in a_o_cell",
                                ':class': "['calendar_cell', { calendar_cell_empty: !o_cell.n_day, calendar_cell_today: o_cell.b_today }]",
                                a_o: [
                                    {
                                        s_tag: "span",
                                        class: "calendar_day_number",
                                        'v-if': "o_cell.n_day",
                                        innerText: "{{ o_cell.n_day }}",
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
        };
    },
    computed: {
        a_o_cell: function() {
            let n_year = this.n_year;
            let n_month = this.n_month;
            let o_first = new Date(n_year, n_month, 1);
            let n_days_in_month = new Date(n_year, n_month + 1, 0).getDate();
            // Monday=0 ... Sunday=6
            let n_start_day = (o_first.getDay() + 6) % 7;

            let o_today = new Date();
            let b_is_current_month = o_today.getFullYear() === n_year && o_today.getMonth() === n_month;
            let n_today = o_today.getDate();

            let a_o = [];
            // empty cells before first day
            for (let n = 0; n < n_start_day; n++) {
                a_o.push({ n_day: 0, b_today: false });
            }
            for (let n = 1; n <= n_days_in_month; n++) {
                a_o.push({ n_day: n, b_today: b_is_current_month && n === n_today });
            }
            // fill remaining cells to complete the last row
            let n_remainder = a_o.length % 7;
            if (n_remainder > 0) {
                for (let n = 0; n < 7 - n_remainder; n++) {
                    a_o.push({ n_day: 0, b_today: false });
                }
            }
            return a_o;
        },
        n_rows: function() {
            return this.a_o_cell.length / 7;
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
        f_print: function() {
            let o_self = this;
            let s_size = o_self.s_paper_size;
            let o_style = document.createElement('style');
            o_style.textContent = '@page { size: ' + s_size + ' landscape; margin: 10mm; }';
            document.head.appendChild(o_style);
            window.print();
            document.head.removeChild(o_style);
        },
    },
};

export { o_component__calendar };
