import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { colDef } from './modals';
import { SlotDirective } from './slot.directive';

@Component({
    selector: 'ng-datatable',
    templateUrl: './custom-table.html',
    styleUrls: ['./style.css'],
    encapsulation: ViewEncapsulation.None,
})
export class CustomTableComponent implements OnInit {
    // props
    @Input() loading: boolean = false;
    @Input() isStatic: boolean = false;
    @Input() skin: string = 'bh-table-striped bh-table-hover';
    @Input() totalRows: number = 0;
    @Input() rows: Array<any> = [];
    @Input() columns: Array<colDef> = [];
    @Input() hasCheckbox: boolean = false;
    @Input() search: string = '';
    @Input() columnChooser: boolean = false;
    @Input() page: number = 1;
    @Input() pageSize: number = 10;
    @Input() pageSizeOptions: Array<number> = [10, 20, 30, 50, 100];
    @Input() showPageSize: boolean = true;
    @Input() rowClass: any = '';
    @Input() cellClass: any = '';
    @Input() sortable: boolean = false;
    @Input() sortColumn: string = 'id';
    @Input() sortDirection: string = 'asc';
    @Input() columnFilter: boolean = false;
    @Input() pagination: boolean = true;
    @Input() showNumbers: boolean = true;
    @Input() showNumbersCount: number = 5;
    @Input() showFirstPage: boolean = true;
    @Input() showLastPage: boolean = true;
    @Input() firstArrow: string = '';
    @Input() lastArrow: string = '';
    @Input() nextArrow: string = '';
    @Input() previousArrow: string = '';
    @Input() paginationInfo: string = 'Showing {0} to {1} of {2} entries';
    @Input() noDataContent: string = 'No data available';
    @Input() stickyHeader: boolean = false;
    @Input() height: string = '500px';
    @Input() stickyFirstColumn: boolean = false;
    @Input() cloneHeaderInFooter: boolean = false;
    @Input() selectRowOnClick: boolean = false;

    @Output() sortChange = new EventEmitter<any>();
    @Output() searchChange = new EventEmitter<any>();
    @Output() pageChange = new EventEmitter<any>();
    @Output() pageSizeChange = new EventEmitter<any>();
    @Output() rowSelect = new EventEmitter<any>();
    @Output() filterChange = new EventEmitter<any>();
    @Output() rowClick = new EventEmitter<any>();
    @Output() rowDBClick = new EventEmitter<any>();

    // variables
    filterItems: Array<any> = [];
    currentPage = this.page;
    curentPageSize = this.pagination ? this.pageSize : this.rows.length;
    currentSortColumn = this.sortColumn;
    currentSortDirection = this.sortDirection;
    filterRowCount = this.totalRows;
    // selected: any = [];
    selectedAll: any = null;
    curentLoader = this.loading;
    curentSearch = this.search;
    oldColumns = this.columns;

    isOpenFilter: any = null;

    // row click
    timer: any = null;
    clickCount: number = 0;
    delay: number = 230;

    constructor() {}
    ngOnInit() {
        this.initDeafultValues();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['loading']) {
            this.curentLoader = this.loading;
        }

        if (changes['currentPage']) {
            this.changePage();
        }

        if (changes['rows']) {
            this.changeRows();
        }

        if (changes['curentPageSize']) {
            this.changePageSize();
        }

        if (changes['search']) {
            this.curentSearch = this.search;
            this.changeSearch();
        }
    }

    initDeafultValues() {
        // set default columns values
        for (const item of this.columns || []) {
            const type = item.type?.toLowerCase() || 'string';
            item.type = type;
            item.isUnique = item.isUnique !== undefined ? item.isUnique : false;
            item.hide = item.hide !== undefined ? item.hide : false;
            item.filter = item.filter !== undefined ? item.filter : true;
            item.search = item.search !== undefined ? item.search : true;
            item.sort = item.sort !== undefined ? item.sort : true;
            item.html = item.html !== undefined ? item.html : false;
            item.condition = !type || type === 'string' ? 'contain' : 'equal';
        }
        console.log('this.columns:: ', this.columns);
    }
    get props() {
        return {
            loading: this.loading,
            isStatic: this.isStatic,
            skin: this.skin,
            totalRows: this.totalRows,
            rows: this.rows,
            columns: this.columns,
            hasCheckbox: this.hasCheckbox,
            search: this.search,
            columnChooser: this.columnChooser,
            page: this.page,
            pageSize: this.pageSize,
            pageSizeOptions: this.pageSizeOptions,
            showPageSize: this.showPageSize,
            rowClass: this.rowClass,
            cellClass: this.cellClass,
            sortable: this.sortable,
            sortColumn: this.sortColumn,
            sortDirection: this.sortDirection,
            columnFilter: this.columnFilter,
            pagination: this.pagination,
            showNumbers: this.showNumbers,
            showNumbersCount: this.showNumbersCount,
            showFirstPage: this.showFirstPage,
            showLastPage: this.showLastPage,
            firstArrow: this.firstArrow,
            lastArrow: this.lastArrow,
            nextArrow: this.nextArrow,
            previousArrow: this.previousArrow,
            paginationInfo: this.paginationInfo,
            noDataContent: this.noDataContent,
            stickyHeader: this.stickyHeader,
            height: this.height,
            stickyFirstColumn: this.stickyFirstColumn,
            cloneHeaderInFooter: this.cloneHeaderInFooter,
            selectRowOnClick: this.selectRowOnClick,
        };
    }

    // stringFormat = (template: string, ...args: any[]) => {
    //     return template.replace(/{(\d+)}/g, (match, number) => {
    //         return typeof args[number] != 'undefined' ? args[number] : match;
    //     });
    // };
    get stringFormat() {
        const args: any[] = [this.filterRowCount ? this.offset : 0, this.limit, this.filterRowCount];
        return this.paginationInfo.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }
    get uniqueKey() {
        const col = this.columns.find((d) => d.isUnique);
        return col?.field || '';
    }

    // Maximum number of pages
    get maxPage() {
        const totalPages = this.curentPageSize < 1 ? 1 : Math.ceil(this.filterRowCount / this.curentPageSize);
        return Math.max(totalPages || 0, 1);
    }
    // The starting value of the page number
    get offset() {
        return (this.currentPage - 1) * this.curentPageSize + 1;
    }
    // Maximum number of pages
    get limit() {
        const limit = this.currentPage * this.curentPageSize;
        return this.filterRowCount >= limit ? limit : this.filterRowCount;
    }
    // Paging array
    get paging() {
        let startPage: number, endPage: number;
        let isMaxSized = typeof this.showNumbersCount !== 'undefined' && this.showNumbersCount < this.maxPage;
        // recompute if maxSize
        if (isMaxSized) {
            // Current page is displayed in the middle of the visible ones
            startPage = Math.max(this.currentPage - Math.floor(this.showNumbersCount / 2), 1);
            endPage = startPage + this.showNumbersCount - 1;

            // Adjust if limit is exceeded
            if (endPage > this.maxPage) {
                endPage = this.maxPage;
                startPage = endPage - this.showNumbersCount + 1;
            }
        } else {
            startPage = 1;
            endPage = this.maxPage;
        }

        const pages = Array.from(Array(endPage + 1 - startPage).keys()).map((i) => startPage + i);

        return pages;
    }

    filterRows() {
        this.curentLoader = true;
        let rows = this.rows || [];

        this.columns?.forEach((d) => {
            if (d.filter && ((d.value !== undefined && d.value !== null && d.value !== '') || d.condition === 'is_null' || d.condition === 'is_not_null')) {
                // string filters
                if (d.type === 'string') {
                    if (d.condition === 'contain') {
                        rows = rows.filter((item) => {
                            return item[d.field]?.toString().toLowerCase().includes(d.value.toLowerCase());
                        });
                    } else if (d.condition === 'not_contain') {
                        rows = rows.filter((item) => {
                            return !item[d.field]?.toString().toLowerCase().includes(d.value.toLowerCase());
                        });
                    } else if (d.condition === 'equal') {
                        rows = rows.filter((item) => {
                            return item[d.field]?.toString().toLowerCase() === d.value.toLowerCase();
                        });
                    } else if (d.condition === 'not_equal') {
                        rows = rows.filter((item) => {
                            return item[d.field]?.toString().toLowerCase() !== d.value.toLowerCase();
                        });
                    } else if (d.condition === 'start_with') {
                        rows = rows.filter((item) => {
                            return item[d.field]?.toString().toLowerCase().indexOf(d.value.toLowerCase()) === 0;
                        });
                    } else if (d.condition === 'end_with') {
                        rows = rows.filter((item) => {
                            return (
                                item[d.field]
                                    ?.toString()
                                    .toLowerCase()
                                    .substr(d.value.length * -1) === d.value.toLowerCase()
                            );
                        });
                    }
                }

                // number filters
                else if (d.type === 'number') {
                    if (d.condition === 'equal') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) === parseFloat(d.value);
                        });
                    } else if (d.condition === 'not_equal') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) !== parseFloat(d.value);
                        });
                    } else if (d.condition === 'greater_than') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) > parseFloat(d.value);
                        });
                    } else if (d.condition === 'greater_than_equal') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) >= parseFloat(d.value);
                        });
                    } else if (d.condition === 'less_than') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) < parseFloat(d.value);
                        });
                    } else if (d.condition === 'less_than_equal') {
                        rows = rows.filter((item) => {
                            return item[d.field] && parseFloat(item[d.field]) <= parseFloat(d.value);
                        });
                    }
                }

                // date filters
                if (d.type === 'date') {
                    if (d.condition === 'equal') {
                        this.rows = this.rows.filter((item: any) => {
                            return item[d.field] && this.dateFormat(item[d.field]) === d.value;
                        });
                    } else if (d.condition === 'not_equal') {
                        this.rows = this.rows.filter((item: any) => {
                            return item[d.field] && this.dateFormat(item[d.field]) !== d.value;
                        });
                    } else if (d.condition === 'greater_than') {
                        this.rows = this.rows.filter((item: any) => {
                            return item[d.field] && this.dateFormat(item[d.field]) > d.value;
                        });
                    } else if (d.condition === 'less_than') {
                        this.rows = this.rows.filter((item: any) => {
                            return item[d.field] && this.dateFormat(item[d.field]) < d.value;
                        });
                    }
                }

                // boolean filters
                else if (d.type === 'bool') {
                    this.rows = this.rows.filter((item: any) => {
                        return item[d.field] === d.value;
                    });
                }

                if (d.condition === 'is_null') {
                    this.rows = this.rows.filter((item: any) => {
                        return item[d.field] == null || item[d.field] === '';
                    });
                    d.value = '';
                } else if (d.condition === 'is_not_null') {
                    d.value = '';
                    this.rows = this.rows.filter((item: any) => {
                        return item[d.field];
                    });
                }
            }
        });

        if (this.curentSearch && this.rows.length) {
            let final: Array<any> = [];

            const keys = (this.columns || [])
                .filter((d: any) => d.search && !d.hide)
                .map((d: any) => {
                    return d.field;
                });

            for (let j = 0; j < this.rows.length; j++) {
                for (let i = 0; i < keys.length; i++) {
                    if (this.cellValue(this.rows[j], keys[i])?.toString().toLowerCase().includes(this.curentSearch.toLowerCase())) {
                        final.push(this.rows[j]);
                        break;
                    }
                }
            }

            this.rows = final;
        }

        // sort rows
        const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: 'base',
        });
        const sortOrder = this.currentSortDirection === 'desc' ? -1 : 1;
        const arr = this.currentSortColumn?.split('.');

        this.rows.sort((a: any, b: any): number => {
            if (arr && arr.length === 2) {
                return collator.compare(a[arr[0]]?.[arr[1]], b[arr[0]]?.[arr[1]]) * sortOrder;
            } else if (arr && arr.length === 3) {
                return collator.compare(a[arr[0]]?.[arr[1]]?.[arr[2]], b[arr[0]]?.[arr[1]]?.[arr[2]]) * sortOrder;
            } else if (arr && arr.length === 4) {
                return collator.compare(a[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]], b[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]]) * sortOrder;
            } else if (arr && arr.length === 5) {
                return collator.compare(a[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]]?.[arr[4]], b[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]]?.[arr[4]]) * sortOrder;
            } else {
                return collator.compare(a[this.currentSortColumn], b[this.currentSortColumn]) * sortOrder;
            }
        });

        this.filterRowCount = rows.length || 0;
        const result = rows.slice(this.offset - 1, <number>this.limit);
        this.filterItems = result || [];
        this.curentLoader = false;
    }

    toggleFilterMenu(col: any) {
        if (col) {
            if (this.isOpenFilter === col.field) {
                this.isOpenFilter = null;
            } else {
                this.isOpenFilter = col.field;
            }
        } else {
            this.isOpenFilter = null;
        }
    }

    // previous page
    previousPage() {
        if (this.currentPage === 1) {
            return;
        }
        this.currentPage--;
        // filterRows();
    }

    // page change
    movePage(page: number) {
        this.currentPage = page;
        // filterRows();
    }

    // next page
    nextPage() {
        if (this.currentPage >= this.maxPage) {
            return;
        }
        this.currentPage++;
        // filterRows();
    }

    // page changed
    changePage() {
        this.selectAll(false);

        this.filterRows();
        this.pageChange.emit(this.currentPage);
    }

    // row update
    changeRows() {
        this.currentPage = 1;
        this.selectAll(false);

        this.filterRows();
    }

    // pagesize changed
    changePageSize() {
        this.currentPage = 1;
        this.selectAll(false);

        this.filterRows();
        this.pageSizeChange.emit(this.curentPageSize);
    }

    // sorting
    sortChangeMethod(field: string) {
        let direction = 'asc';
        if (field === this.currentSortColumn) {
            if (this.currentSortDirection === 'asc') {
                direction = 'desc';
            }
        }
        const offset = (this.currentPage - 1) * this.curentPageSize;
        const limit = this.curentPageSize;
        this.currentSortColumn = field;
        this.currentSortDirection = direction;

        this.selectAll(false);
        this.filterRows();
        this.sortChange.emit({ offset, limit, field, direction });
    }

    // checkboax
    checkboxChange(value: any = null) {
        // this.selectedAll = value?.length && this.filterItems.length && value?.length === this.filterItems.length;
        // const rows = this.filterItems.filter((d, i) => this.selected.includes(this.uniqueKey ? d[this.uniqueKey] : i));
        // this.rowSelect.emit(rows);
        this.checkIfAllSelected();
        const rows = this.getSelectedRows();
        this.rowSelect.emit(rows);
    }

    selectAll(checked: any) {
        console.log('hi....selectAll');

        this.filterItems.map((d: any) => (d.selected = checked));
        // if (checked) {
        //     this.selected = this.filterItems.map((d, i) => (this.uniqueKey ? d[this.uniqueKey] : i));
        // } else {
        //     this.selected = [];
        // }
    }
    checkIfAllSelected() {
        this.selectedAll = this.filterItems.every((item: any) => {
            return item.selected == true;
        });
    }

    // columns filter
    filterChangeMethod() {
        this.currentPage = 1;
        this.selectAll(false);
        this.filterRows();

        this.filterChange.emit(this.columns);
    }

    // search
    changeSearch() {
        this.currentPage = 1;
        this.selectAll(false);
        this.filterRows();
        this.searchChange.emit(this.curentSearch);
    }

    cellValue(item: any, field: string) {
        if (field.includes('.')) {
            const arr = field.split('.');
            if (arr.length === 5) {
                return item[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]]?.[arr[4]];
            } else if (arr.length === 4) {
                return item[arr[0]]?.[arr[1]]?.[arr[2]]?.[arr[3]];
            } else if (arr.length === 3) {
                return item[arr[0]]?.[arr[1]]?.[arr[2]];
            }
            return item[arr[0]]?.[arr[1]];
        }
        return item?.[field];
    }

    dateFormat(date: any) {
        try {
            if (!date) {
                return '';
            }
            const dt = new Date(date);
            const day = dt.getDate();
            const month = dt.getMonth() + 1;
            const year = dt.getFullYear();

            return year + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);
        } catch {}
        return '';
    }

    //row click
    rowClickMethod(item: any, index: number) {
        this.clickCount++;

        if (this.clickCount === 1) {
            this.timer = setTimeout(() => {
                this.clickCount = 0;

                if (this.selectRowOnClick) {
                    if (this.isRowSelected(index)) {
                        this.unselectRow(index);
                    } else {
                        this.selectRow(index);
                    }

                    // this.checkboxChange(this.selected);
                    this.checkboxChange();
                }
                this.rowClick.emit(item);
            }, this.delay);
        } else if (this.clickCount === 2) {
            clearTimeout(this.timer);
            this.clickCount = 0;
            this.rowDBClick.emit(item);
        }
    }

    // methods
    reset() {
        this.columns?.forEach((d: any, i: number) => {
            d = this.oldColumns[i];
        });
        this.curentSearch = '';
        this.currentPage = 1;
        this.currentSortColumn = 'id';
        this.currentSortDirection = 'asc';
        this.selectAll(false);
        this.filterRows();
    }
    getSelectedRows() {
        // const rows = this.filterItems.filter((d: any, i: number) => this.selected.includes(this.uniqueKey ? d[this.uniqueKey] : i));
        return this.filterItems.filter((d) => d.selected);
    }
    getColumnFilters() {
        return this.columns;
    }
    clearSelectedRows() {
        // this.selected = [];
        if (this.filterItems) {
            this.selectedAll = false;
            this.selectAll(false);
        }
    }
    selectRow(index: number) {
        if (!this.isRowSelected(index)) {
            const rows = this.filterItems.find((d: any, i: number) => i === index);
            // this.selected.push(this.uniqueKey ? rows[this.uniqueKey] : index);
            rows.selected = true;
        }
    }
    unselectRow(index: number) {
        if (this.isRowSelected(index)) {
            const rows = this.filterItems.find((d: any, i: number) => i === index);
            // this.selected = this.selected.filter((d: any) => d !== (this.uniqueKey ? rows[this.uniqueKey] : index));
            rows.selected = false;
        }
    }
    isRowSelected(index: number): boolean {
        const rows = this.filterItems.find((d: any, i: number) => i === index);
        if (rows) {
            // return this.selected.includes(this.uniqueKey ? rows[this.uniqueKey] : index);
            return rows.selected;
        }
        return false;
    }

    // slots
    @ContentChildren(SlotDirective) slotTemplates: QueryList<SlotDirective>;
    @ViewChild('defaultTemplate', { static: true }) defaultTemplate: TemplateRef<any>;
    slotTemplateMap: Map<string, TemplateRef<any>> = new Map<string, TemplateRef<any>>();

    ngAfterContentInit() {
        this.slotTemplates.forEach((template) => {
            const fieldName = template.fieldName;
            if (fieldName) {
                this.slotTemplateMap.set(fieldName, template.templateRef);
            }
        });
        console.log(this.slotTemplateMap);
    }
    hasSlot(fieldName: string): boolean {
        return this.slotTemplateMap.has(fieldName);
    }
    getSlotTemplate(fieldName: string): TemplateRef<any> {
        return this.slotTemplateMap.get(fieldName) || this.defaultTemplate;
    }
}
