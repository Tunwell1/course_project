export type Tables = {
    [key: string]: TableState 
}

export type TableState = {
    name: string;
    headersEn: string[];
    newRowValues: NewRowValues;
    editingRows: EditingRows;
    source: any[];
}

export type NewRowValues = { [key: string]: any }

export type EditingRows = { id: number, isEditing: boolean }[]

export type TableProps = {
    tableState: TableState;
    saveTableState: (tableName: string, newState: any) => void;
}