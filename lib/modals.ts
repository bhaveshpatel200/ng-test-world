export interface colDef {
    isUnique: boolean;
    field: string;
    title: string;
    value: any;
    condition: any;
    type: string; // string|date|number|bool
    width: [number, string];
    minWidth: [number, string] | undefined;
    maxWidth: [number, string] | undefined;
    hide: boolean;
    filter: boolean; // column filter
    search: boolean; // global search
    sort: boolean;
    html?: boolean;
    // cellRenderer?: [Function, string];
    cellRenderer?: any;
    headerClass: string;
    cellClass: string;
}
