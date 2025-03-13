import { fk, subordinateTables } from "./constants";
import { getTable, addRecord, saveRecord, deleteRecordById } from "./database";
import { DopFilterConfig, EditingRows, FilterConfig, NewRowValues, SearchedSource, SelectingRows, SortConfig, Tables, TableState } from "./types";

// loading tables for foreign keys
export const loadTables = async (tableState: TableState, setTablesPK: React.Dispatch<React.SetStateAction<{ nameTable: string, source: any[] }[]>>) => {
    let fk_data = fk.find(x => x.nameTable == tableState.name);
    if (fk_data) {
        const promises = fk_data.tablesPK.map(async (x) => {
            const data = await getTable(x);
            return {
                nameTable: x,
                source: data || []
            };
        });
        const results = await Promise.all(promises);
        setTablesPK(results);
    }
};

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
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>,
    setEditingSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    if (editingRows[id]) {
        const rowToSave = editingSource.find(x => x.id == id);
        await saveRecord(tableState.name, rowToSave);

        const updatedSource = source.map(row =>
            row.id == id ? rowToSave : row
        );
        setSource(updatedSource);

        const newOrigSource = originalSource.map(row =>
            row.id == id ? rowToSave : row
        );
        setOriginalSource(newOrigSource);
    } else {
        const rowToEdit = source.find(x => x.id == id);
        const updatedEditingSource = [...editingSource];
        const existingRowIndex = updatedEditingSource.findIndex(row => row.id == id);

        if (existingRowIndex !== -1) {
            updatedEditingSource[existingRowIndex] = { ...rowToEdit };
        } else {
            updatedEditingSource.push({ ...rowToEdit });
        }

        setEditingSource(updatedEditingSource);
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
    originalSource: any[],
    isRepetion: boolean,
    filterConfig: FilterConfig[],
    dopFilters: DopFilterConfig[]
) {
    setSortConf((prevSortConf) => {
        // Сначала применяем основные фильтры
        let filteredData = applyAllFilters(filterConfig, originalSource);

        // Затем применяем дополнительные фильтры
        dopFilters.forEach(dopFilter => {
            if (dopFilter.selected !== 'all') {
                filteredData = filteredData.filter(x => x[dopFilter.column] === dopFilter.selected);
            }
        });

        const compareValues = (a: any, b: any, col: string): number => {
            const valA = a[col];
            const valB = b[col];

            // Обработка null значений
            if (valA === null && valB === null) return 0;
            if (valA === null) return 1;
            if (valB === null) return -1;

            // Определение типа данных
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valA - valB;
            }

            // Обработка дат
            const dateA = new Date(valA);
            const dateB = new Date(valB);
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                return dateA.getTime() - dateB.getTime();
            }

            // Обработка строк
            return String(valA).localeCompare(String(valB), 'ru');
        };

        if (isRepetion) {
            switch (prevSortConf.type) {
                case "asc":
                    setSource([...filteredData].sort((a, b) => compareValues(a, b, col)));
                    return prevSortConf;
                case "desc":
                    setSource([...filteredData].sort((a, b) => compareValues(b, a, col)));
                    return prevSortConf;
                default:
                    return prevSortConf;
            }
        } else {
            if (prevSortConf?.column === col) {
                switch (prevSortConf.type) {
                    case "asc":
                        setSource([...filteredData].sort((a, b) => compareValues(b, a, col)));
                        return { ...prevSortConf, type: "desc" };
                    case "desc":
                        setSource(filteredData);
                        return { ...prevSortConf, type: "none" };
                    case "none":
                        setSource([...filteredData].sort((a, b) => compareValues(a, b, col)));
                        return { column: col, type: "asc" };
                    default:
                        return prevSortConf;
                }
            } else {
                setSource([...filteredData].sort((a, b) => compareValues(a, b, col)));
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
    columnToRemove: FilterConfig,
    filterConfig: FilterConfig[],
    setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig[]>>,
    originalSource: any[],
    setSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    const newFilterConfig = filterConfig.filter(y => y != columnToRemove);
    setFilterConfig(newFilterConfig);
    const newSource = applyAllFilters(newFilterConfig, originalSource);
    setSource(newSource);
}

//
export function getValueFK(nameTableTo: string, nameTableFrom: string, id: number, sourceTableTo: any[]) {
    let row = sourceTableTo.find(x => x.id == id);
    let data_fks = fk.find(x => x.nameTable == nameTableFrom);
    let tablesPK = data_fks?.tablesPK;
    if (tablesPK && data_fks) {
        let ind = tablesPK.findIndex(y => y == nameTableTo);
        let val = data_fks.visCols?.[ind]?.map(y => row[y]);
        return val?.join(' ');
    }
    return 'ошибка';
}

// deleting rows
export async function deleteRows(
    nameTable: string,
    editingSource: any[],
    setEditingSource: React.Dispatch<React.SetStateAction<any[]>>,
    selectingRows: SelectingRows,
    setSelectingRows: React.Dispatch<React.SetStateAction<SelectingRows>>,
    editingRows: EditingRows,
    setEditingRows: React.Dispatch<React.SetStateAction<EditingRows>>,
    originalSource: any[],
    setOriginalSource: React.Dispatch<React.SetStateAction<any[]>>,
    setSource: React.Dispatch<React.SetStateAction<any[]>>
) {
    const rowsToDelete = Object.keys(selectingRows).filter(x => selectingRows[x]);
    if (rowsToDelete.length > 0) {
        try {
            await Promise.all(rowsToDelete.map(async (x) => {
                await deleteRecordById(nameTable, parseInt(x));
            }));

            // Обновляем все состояния
            const newEditingSource = editingSource.filter(y => !rowsToDelete.includes(y.id.toString()));
            const newOriginalSource = originalSource.filter(y => !rowsToDelete.includes(y.id.toString()));
            const newSelectingRows = { ...selectingRows };
            const newEditingRows = { ...editingRows };
            
            // Удаляем выбранные строки из всех состояний
            rowsToDelete.forEach(x => {
                delete newSelectingRows[x];
                delete newEditingRows[x];
            });

            // Обновляем все состояния
            setEditingSource(newEditingSource);
            setOriginalSource(newOriginalSource);
            setSelectingRows(newSelectingRows);
            setEditingRows(newEditingRows);
            setSource(newOriginalSource); // Обновляем основной источник данных
        } catch (error) {
            console.error("Ошибка при удалении записей:", error);
        }
    }
}

// searching data
export function search(
    value: string,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>,
    source: any[],
    tableState: TableState,
    setSearchedRows: React.Dispatch<React.SetStateAction<SearchedSource>>,
    tablesPK: { nameTable: string, source: any[] }[],
    isCaseSensitiveSearch: boolean
) {
    setSearchValue(value);
    if (value.length > 0) {
        source.map(x => {
            let c = 0;
            Object.keys(x).map((y: any, i) => {
                if (i != 0) {
                    if (fk.find(z => z.nameTable == tableState.name)?.fkS.includes(y)) {
                        let v = getValueFK(fk.find(z => z.nameTable == tableState.name)?.tablesPK[fk.find(z => z.nameTable == tableState.name)?.fkS.indexOf(y) || 0] || '', tableState.name, x[y], tablesPK.find(z => z.nameTable == fk.find(z => z.nameTable == tableState.name)?.tablesPK[fk.find(z => z.nameTable == tableState.name)?.fkS.indexOf(y) || 0])?.source || []);
                        if (isCaseSensitiveSearch) {
                            if (v.toString().includes(value)) {
                                c++;
                            }
                        } else {
                            if (v.toString().toLowerCase().includes(value.toLowerCase())) {
                                c++;
                            }
                        }
                    }
                    if (normalizeDate(x[y]).toLocaleDateString().toString().toLowerCase().includes(value.toLowerCase()) && new Date(x[y]).toString() != 'Invalid Date') {
                        c++;
                    }
                }
            })
            Object.values(x).map((y: any, i) => {
                if (i != 0) {
                    if (isCaseSensitiveSearch) {
                        if (y.toString().includes(value)) {
                            c++;
                        }
                    } else {
                        if (y.toString().toLowerCase().includes(value.toLowerCase())) {
                            c++;
                        }
                    }
                }
            })
            if (c > 0) {
                setSearchedRows(prev => ({ ...prev, [x['id']]: true }));
            } else {
                setSearchedRows(prev => ({ ...prev, [x['id']]: false }));
            }
        });
    } else {
        setSearchedRows({});
    }
}

export function getSubordinateTable(nameTable: string, id: number, states: Tables, tableState: TableState, setStates: (a: Tables) => void, changeCurrentTable: (nameTable: string) => void) {
    let state = states[nameTable];
    let sbT = subordinateTables.find(x => x.nameTable == tableState.name);
    if (sbT) {
        let ind = sbT.subordinateTables.indexOf(nameTable);
        let howToTable = sbT.howToTable;
        let isHaveFK = sbT.isHaveFK[ind];
        if (!isHaveFK && howToTable) {
            let nameHowToTable = howToTable[ind];
            let OrigSource = states[nameHowToTable].originalSource;
            let filteredSource = OrigSource.filter(x => x[sbT.idToFK] == id);
            let idToOsn = sbT.idToOsn;
            if (idToOsn) {
                let idToOsnName = idToOsn[ind];
                let ids = filteredSource.map((x: any) => x[idToOsnName]);
                let filteredSourceForTable = state.originalSource.filter((x: any) => ids.includes(x['id']));
                setStates({ ...states, [nameTable]: { 
                    ...state,
                    originalSource: filteredSourceForTable } });
                changeCurrentTable(nameTable);
            }
        } else if (isHaveFK) {
            let OrigSource = states[nameTable].originalSource;
            let filteredSource = OrigSource.filter(x => x[sbT.idToFK] == id);
            setStates({ ...states, [nameTable]: { ...state, originalSource: filteredSource } });
            changeCurrentTable(nameTable);
        }
    }
}