export type Tables = {
    [key: string]: TableState 
}

export type TableState = {
    name: string;
    headersEn: string[];
    types: { column_name: string, data_type: string }[];
    newRowValues: NewRowValues;
    editingRows: EditingRows;
    source: any[];
    editingSource: any[];
    sortConf: SortConfig;
}

export type NewRowValues = { [key: string]: any }

export type EditingRows = {  [key: string]: boolean }

export type TableProps = {
    tableState: TableState;
    saveTableState: (tableName: string, newState: TableState) => void;
}

export type ModalFilterProps = {
    setIsModalOpen: (a: boolean) => void;
    column: string;
    type: string;
    setFilterValues: (a: any[]) => void;
    setFilterType: (a: string) => void;
    setFilterIsCaseSensitive: (a: boolean) => void;
    dropDrown?: any[];
}

export type SortConfig = {
    column: string,
    type: 'asc' | 'desc' | 'none'
}

export type FilterConfig = {
    column: string,
    typeFilter: string,
    typeColumn: string,
    values: any[],
    isCaseSensitive: boolean
}

