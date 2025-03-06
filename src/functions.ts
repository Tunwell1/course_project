import { getTable, addRecord, saveRecord } from "./database";
import { EditingRows, FilterConfig, NewRowValues, SortConfig, TableState } from "./types";

// updating source data of table from database
export async function RefreshTable(
    setIsLoading: (isLoading: boolean) => void,
    name: string,
    setSource: React.Dispatch<React.SetStateAction<any[]>>,
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>,
    setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig[]>>
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
    setFilterConfig([]);
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

// normalizing date to YYYY-MM-DD format
export function normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// filtering data
export function filterData(
    source: any[],
    filterTypeColumn: string,
    filterType: string,
    filterColumnEn: string,
    filterValues: any[],
    filterIsCaseSensitive: boolean
): any[] {
    if (!filterType || filterType === 'none' || !filterValues.length) {
        return source;
    }

    if (filterTypeColumn === 'text') {
        if (filterIsCaseSensitive) {
            switch (filterType) {
                case 'contains':
                    return source.filter(x => x[filterColumnEn].includes(filterValues[0]));
                case 'equals':
                    return source.filter(x => x[filterColumnEn] == filterValues[0]);
                case 'startsWith':
                    return source.filter(x => x[filterColumnEn].startsWith(filterValues[0]));
                case 'endsWith':
                    return source.filter(x => x[filterColumnEn].endsWith(filterValues[0]));
                default:
                    return source;
            }
        } else {
            switch (filterType) {
                case 'contains':
                    return source.filter(x => x[filterColumnEn].toLowerCase().includes(filterValues[0].toLowerCase()));
                case 'equals':
                    return source.filter(x => x[filterColumnEn].toLowerCase() == filterValues[0].toLowerCase());
                case 'startsWith':
                    return source.filter(x => x[filterColumnEn].toLowerCase().startsWith(filterValues[0].toLowerCase()));
                case 'endsWith':
                    return source.filter(x => x[filterColumnEn].toLowerCase().endsWith(filterValues[0].toLowerCase()));
                default:
                    return source;
            }
        }
    }
    else if (filterTypeColumn === 'integer' || filterTypeColumn === 'bigint') {
        switch (filterType) {
            case 'equals':
                return source.filter(x => x[filterColumnEn] == filterValues[0]);
            case 'notEquals':
                return source.filter(x => x[filterColumnEn] != filterValues[0]);
            case 'greater':
                return source.filter(x => x[filterColumnEn] > filterValues[0]);
            case 'greaterOrEqual':
                return source.filter(x => x[filterColumnEn] >= filterValues[0]);
            case 'lessOrEqual':
                return source.filter(x => x[filterColumnEn] <= filterValues[0]);
            case 'inRange':
                return source.filter(x => x[filterColumnEn] >= filterValues[0] && x[filterColumnEn] <= filterValues[1]);
            case 'notInRange':
                return source.filter(x => x[filterColumnEn] < filterValues[0] || x[filterColumnEn] > filterValues[1]);
            default:
                return source;
        }
    }
    else if (filterTypeColumn === 'date') {
        switch (filterType) {
            case 'equals':
                return source.filter(x => 
                    normalizeDate(x[filterColumnEn]).getTime() === normalizeDate(filterValues[0]).getTime()
                );
            case 'notEquals':
                return source.filter(x => 
                    normalizeDate(x[filterColumnEn]).getTime() !== normalizeDate(filterValues[0]).getTime()
                );
            case 'greater':
                return source.filter(x => 
                    normalizeDate(x[filterColumnEn]).getTime() > normalizeDate(filterValues[0]).getTime()
                );
            case 'lessOrEqual':
                return source.filter(x => 
                    normalizeDate(x[filterColumnEn]).getTime() <= normalizeDate(filterValues[0]).getTime()
                );
            case 'inRange':
                return source.filter(x => {
                    const date = normalizeDate(x[filterColumnEn]).getTime();
                    const start = normalizeDate(filterValues[0]).getTime();
                    const end = normalizeDate(filterValues[1]).getTime();
                    return date >= start && date <= end;
                });
            case 'notInRange':
                return source.filter(x => {
                    const date = normalizeDate(x[filterColumnEn]).getTime();
                    const start = normalizeDate(filterValues[0]).getTime();
                    const end = normalizeDate(filterValues[1]).getTime();
                    return date < start || date > end;
                });
            default:
                return source;
        }
    }
    return source;
}

// getTypeFilter in Russian 
export function getTypeFilter(type: string): string {
    switch (type) {
        case 'contains':
            return 'содержит';
        case 'equals':
            return 'равняется';
        case 'startsWith':
            return 'начинается с';
        case 'endsWith':
            return 'заканчивается на';
        case 'notEquals':
            return 'не равняется';
        case 'greater':
            return 'больше';
        case 'greaterOrEqual':
            return 'больше или равно';
        case 'lessOrEqual':
            return 'меньше или равно';
        case 'inRange':
            return 'в диапазоне';
        case 'notInRange':
            return 'не в диапазоне';
        default:
            return type;
    }
}

export function applyAllFilters(filters: FilterConfig[], sourceData: any[]) {
    return filters.reduce((filteredData, filter) => {
        return filterData(
            filteredData,
            filter.typeColumn,
            filter.typeFilter,
            filter.column,
            filter.values,
            filter.isCaseSensitive
        );
    }, sourceData);
}

export function removeFilter(
    columnToRemove: string,
    filterConfig: FilterConfig[],
    setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig[]>>,
    originalSource: any[],
    setSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    const newFilterConfig = filterConfig.filter(y => y.column !== columnToRemove);
    setFilterConfig(newFilterConfig);
    const newSource = applyAllFilters(newFilterConfig, originalSource);
    setSource(newSource);
}