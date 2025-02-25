import { getTable, addRecord, saveRecord } from "./database";
import { EditingRows, NewRowValues, TableState } from "./types";

// updating source data of table from database
export async function RefreshTable(
    setIsLoading: (isLoading: boolean) => void,
    name: string,
    setSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    setIsLoading(true);
    try {
        const t = await getTable(name);
        setSource(t || []);
    } catch (error) {
        console.error("Error refreshing table:", error);
    } finally {
        setIsLoading(false)
    }
}

// adding data to database and table source
export async function addNewRow(
    tableState: TableState,
    newRowValues: NewRowValues,
    source: any[],
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    setNewRowValues: React.Dispatch<React.SetStateAction<NewRowValues>>
) {
    const row = tableState.headersEn.reduce((acc, header) => {
        acc[header] = newRowValues[header] || "";
        return acc;
    }, {} as { [key: string]: string });
    let id = await addRecord(tableState.name, row);
    row['id'] = id;
    const newSource = [...source, row];
    console.log(newSource);
    setSource(newSource);
    setNewRowValues({});
}

// changing state of row from edited to saved and vice versa
export async function handleEditingChange(
    id: number,
    editingRows: EditingRows,
    tableState: TableState,
    source: any[],
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    editingSource: any[],
    setEditingRows: React.Dispatch<React.SetStateAction<EditingRows>>
) {
    if (editingRows[id]) {
        await saveRecord(tableState.name, source.find(x => x.id == id))
        setSource(editingSource);
    }
    setEditingRows(prevEditingRows => ({
        ...prevEditingRows,
        [id]: !prevEditingRows[id]
    }));
}

// changing the data new (not yet added) row
export function handleInputChange(
    header: string,
    value: string,
    setNewRowValues: React.Dispatch<React.SetStateAction<NewRowValues>>
) {
    setNewRowValues(prevValues => ({
        ...prevValues,
        [header]: value
    }));
};

// changing the data editable rows
export function handleInputChangeRows(
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    header: string,
    source: any[],
    setEditingSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    let rows = [...source];
    let ind = rows.findIndex(x => x.id == id);
    rows[ind][header] = e.target.value;
    setEditingSource(rows);
}