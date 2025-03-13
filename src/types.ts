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
    originalSource: any[];
    editingSource: any[];
    selectingRows: SelectingRows;
    sortConf: SortConfig;
    filterConfig: FilterConfig[];
    searchedRows: SearchedSource;
    searchValue: string;
    dopFilters?: DopFilterConfig[];
}

export type NewRowValues = { [key: string]: any }

export type EditingRows = { [key: string]: boolean }

export type SelectingRows = { [key: string]: boolean }

export type SearchedSource = { [key: string]: boolean }

export type TableProps = {
    tableState: TableState;
    saveTableState: (tableName: string, newState: TableState) => void;
    changeCurrentTable: (tableName: string) => void;
    states: Tables;
    setStates: (a: Tables) => void;
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

export type SelectRowProps = {
    fkTableName: string;
    tableName: string;
    column: string;
    id?: any;
    isSelect?: boolean;
    close: (id?: any, osnNameTable?: string, values?: string[]) => void;
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

export type DopFilterConfig = {
    column: string,
    values: string[],
    selected: string
}