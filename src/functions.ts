import { getTable, addRecord, saveRecord } from "./database";
import { EditingRows, NewRowValues, SortConfig, TableState } from "./types";

// updating source data of table from database
export async function RefreshTable(
    setIsLoading: (isLoading: boolean) => void,
    name: string,
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>,
) {
    setIsLoading(true);
    try {
        const t = await getTable(name);
        setSource(t || []);
        setOriginalSource(t || []);
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
    setNewRowValues: React.Dispatch<React.SetStateAction<NewRowValues>>,
    originalSource: any[],
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    const row = tableState.headersEn.reduce((acc, header) => {
        acc[header] = newRowValues[header] || "";
        return acc;
    }, {} as { [key: string]: string });
    let id = await addRecord(tableState.name, row);
    row['id'] = id;
    const newSource = [...source, row];
    setSource(newSource);
    setNewRowValues({});
    const newOrigSource = [...originalSource, row];
    setOriginalSource(newOrigSource);
}

// changing state of row from edited to saved and vice versa
export async function handleEditingChange(
    id: number,
    editingRows: EditingRows,
    tableState: TableState,
    source: any[],
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    editingSource: any[],
    setEditingRows: React.Dispatch<React.SetStateAction<EditingRows>>,
    originalSource: any[],
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    if (editingRows[id]) {
        await saveRecord(tableState.name, source.find(x => x.id == id))
        setSource(editingSource);
        let newOrigSource = [...originalSource];
        let ind = newOrigSource.findIndex(x => x.id == id)
        newOrigSource[ind] = source.find(x => x.id == id);
        setOriginalSource(newOrigSource);
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

//sorting
export async function sort(
    col: string,
    setSortConf: React.Dispatch<React.SetStateAction<SortConfig>>,
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    source: any[],
    originalSource: any[],
    isRepetion: boolean, // is used to re-sort when adding or changing data (but not when pressing the sort button)
) {
    setSortConf((prevSortConf) => {
        if (isRepetion) {
            switch (prevSortConf.type) {
                case "asc":
                    setSource([...source].sort((a, b) => a[col] > b[col] ? 1 : -1))
                    return prevSortConf;
                case "desc":
                    setSource([...source].sort((a, b) => a[col] < b[col] ? 1 : -1))
                    return prevSortConf;
                default:
                    return prevSortConf;
            }
        }
        else {
            if (prevSortConf?.column === col) {
                switch (prevSortConf.type) {
                    case "asc":
                        setSource([...source].sort((a, b) => a[col] < b[col] ? 1 : -1))
                        return { ...prevSortConf, type: "desc" };
                    case "desc":
                        setSource([...originalSource]);
                        return { ...prevSortConf, type: "none" };
                    case "none":
                        setSource([...source].sort((a, b) => a[col] > b[col] ? 1 : -1))
                        return { ...prevSortConf, type: "asc" };
                    default:
                        return prevSortConf;
                }
            } else {
                setSource([...source].sort((a, b) => a[col] > b[col] ? 1 : -1))
                return { column: col, type: "asc" };
            }
        }
    });
}