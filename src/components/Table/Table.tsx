import { useState, useEffect } from "react";
import { headersRu, fk, comboboxes, subordinateTables } from "../../constants";
import { EditingRows, FilterConfig, NewRowValues, SortConfig, TableProps, SelectingRows, SearchedSource, DopFilterConfig } from "../../types";
import { addNewRow, handleEditingChange, handleInputChange, handleInputChangeRows, RefreshTable, sort, normalizeDate, filterData, getTypeFilter, removeFilter, getValueFK, deleteRows, loadTables, search, applyAllFilters, getSubordinateTable } from "../../functions";
import { ModalFilter } from "../ModalFilter/ModalFilter";
import "./Table.css";
import { SelectRow } from "../SelectRow/SelectRow";
import { getColumnById } from "../../database";
export const Table: React.FC<TableProps> = ({ tableState, saveTableState, changeCurrentTable, states, setStates }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [editingSource, setEditingSource] = useState<any[]>(tableState?.editingSource || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || {});
    const [selectingRows, setSelectingRows] = useState<SelectingRows>(tableState?.selectingRows || {});
    const [sortConf, setSortConf] = useState<SortConfig>(tableState.sortConf || {})
    const [originalSource, setOriginalSource] = useState<any[]>(tableState?.originalSource || []);
    const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
    const [filterColumn, setFilterColumn] = useState('');
    const [filterColumnEn, setFilterColumnEn] = useState('');
    const [filterValues, setFilterValues] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<string>('none');
    const [filterIsCaseSensitive, setFilterIsCaseSensitive] = useState<boolean>(false);
    const [filterConfig, setFilterConfig] = useState<FilterConfig[]>(tableState?.filterConfig || []);
    const [isSelectingRow, setIsSelectingRow] = useState<boolean>(false);
    const [selectingColumn, setSelectingColumn] = useState<string>('');
    const [isSelectForNewRow, setIsSelectForNewRow] = useState<boolean>(false);
    const [selectId, setSelectId] = useState<number>();
    const [isSelect, setIsSelect] = useState<boolean>(false);
    const [tablesPK, setTablesPK] = useState<{ nameTable: string, source: any[] }[]>([]);
    const [searchValue, setSearchValue] = useState<string>(tableState?.searchValue || '');
    const [isCaseSensitiveSearch, setIsCaseSensitiveSearch] = useState<boolean>(false);
    const [searchedRows, setSearchedRows] = useState<SearchedSource>(tableState?.searchedRows || {});
    const [dopFilters, setDopFilters] = useState<DopFilterConfig[]>(tableState?.dopFilters || []);  

    useEffect(() => {
        loadTables(tableState, setTablesPK);
    }, [tableState]);

    useEffect(() => {
        if (dopFilters.length > 0) {
            // Сначала применяем основные фильтры
            let filteredData = applyAllFilters(filterConfig, originalSource);

            // Затем применяем дополнительные фильтры
            if (dopFilters[0].selected !== 'all') {
                filteredData = filteredData.filter((x: Record<string, any>) => x[dopFilters[0].column] === dopFilters[0].selected);
            }

            setSource(filteredData);
        }
    }, [originalSource, dopFilters, filterConfig]);

    useEffect(() => {
        if (!isModalFilterOpen && filterValues.length > 0) {
            const filterTypeColumn = tableState.types.find(x => x.column_name == filterColumnEn)?.data_type || 'text';
            const filteredSource = filterData(
                source,
                filterTypeColumn,
                filterType,
                filterColumnEn,
                filterValues,
                filterIsCaseSensitive
            );
            setFilterConfig([...filterConfig, { column: filterColumnEn, typeFilter: filterType, typeColumn: filterTypeColumn, values: filterValues, isCaseSensitive: filterIsCaseSensitive }]);
            setSource(filteredSource);
            setFilterValues([]);
        }
    }, [isModalFilterOpen, filterValues]);

    useEffect(() => {
        return () => {
            if (
                tableState?.source != source ||
                tableState.editingRows != editingRows ||
                tableState.newRowValues != newRowValues ||
                tableState.editingSource != editingSource ||
                tableState.selectingRows != selectingRows ||
                tableState.sortConf != sortConf ||
                tableState.filterConfig != filterConfig ||
                tableState.originalSource != originalSource ||
                tableState.searchedRows != searchedRows ||
                tableState.searchValue != searchValue ||
                tableState.dopFilters != dopFilters
            ) {
                saveTableState(tableState.name, { ...tableState, source, editingRows, newRowValues, editingSource, selectingRows, sortConf, filterConfig, originalSource, searchedRows, searchValue, dopFilters });
            }
        };
    }, [tableState.name, source, newRowValues, editingRows, editingSource, selectingRows, sortConf, filterConfig, originalSource, searchedRows, searchValue, dopFilters]);

    useEffect(() => {
        sort(sortConf.column, setSortConf, setSource, originalSource, true, filterConfig, dopFilters);
    }, [originalSource, dopFilters, filterConfig]);

    useEffect(() => {
        search(searchValue, setSearchValue, source, tableState, setSearchedRows, tablesPK, isCaseSensitiveSearch)
    }, [isCaseSensitiveSearch]);

    return (
        <div className="space-table" style={isModalFilterOpen ? { userSelect: "none" } : { userSelect: 'auto' }}>
            <div className="space-under-table">
                <div className="block-for-search">
                    <button onClick={() => RefreshTable(setIsLoading, tableState.name, setSource, setOriginalSource, setFilterConfig)}>Обновить</button>
                    <input type="text" placeholder="Что вы хотите найти?" value={searchValue} onChange={(e) => search(e.target.value, setSearchValue, source, tableState, setSearchedRows, tablesPK, isCaseSensitiveSearch)} />
                    <label>
                        <input className="checkbox-for-search" type="checkbox" checked={isCaseSensitiveSearch} onChange={() => setIsCaseSensitiveSearch(!isCaseSensitiveSearch)} />
                        <span className="span-for-search">С учетом регистра</span>
                    </label>
                </div>
                {filterConfig.length > 0 && (
                    <div className="space-filters">
                        {filterConfig.map((x, i) => (
                            <div className="filter-config" key={i}>
                                <span>
                                    {headersRu.find(y => y.name == tableState.name)?.headers[tableState.headersEn.indexOf(x.column)]} {getTypeFilter(x.typeFilter)} {' '}
                                    {(x.typeFilter === 'inRange' || x.typeFilter === 'notInRange') && (x.typeColumn === 'integer' || x.typeColumn === 'bigint' || x.typeColumn === 'date')
                                        ? `от ${x.typeColumn === 'date' ? normalizeDate(x.values[0]).toLocaleDateString() : x.values[0]} до ${x.typeColumn === 'date' ? normalizeDate(x.values[1]).toLocaleDateString() : x.values[1]}`
                                        : x.typeColumn === 'text'
                                            ? `"${x.values.join(', ')}"`
                                            : x.typeColumn === 'date' ? normalizeDate(x.values[0]).toLocaleDateString() : x.values.join(', ')
                                    }
                                    {x.typeColumn === 'text' ? (x.isCaseSensitive ? ' c учетом регистра' : ' без учета регистра') : ''}
                                </span>
                                <button onClick={() => {
                                    removeFilter(x, filterConfig, setFilterConfig, originalSource, setSource);
                                }}>X</button>
                            </div>
                        ))}
                    </div>
                )}
                {dopFilters.length > 0 && (
                    <div>
                        {dopFilters.map((x, i) => (
                            <div className="dop-filter-config" key={i}>
                                <span>{headersRu.find(y => y.name == tableState.name)?.headers[tableState.headersEn.indexOf(x.column)]}</span>
                                <select defaultValue={x.selected} onChange={(e) => {
                                    setDopFilters(prev => {
                                        const updatedDopFilters = [...prev];
                                        updatedDopFilters[i].selected = e.target.value;
                                        return updatedDopFilters;
                                    });
                                }}>
                                    <option key={0} value="all">Все</option>
                                    {x.values.map((y, i) => (
                                        <option key={i + 1} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="space-table-content">
                {isLoading ? (<p> Загрузка...</p>) :
                    (
                        <table>
                            <thead>
                                <tr>
                                    {headersRu.find(x => x.name == tableState.name)?.headers.map((x, i) => i != 0 && (
                                        <th key={i}>
                                            <div className="inTH">
                                                <span title={x} className="span-value">{x}</span>
                                                {(!dopFilters.find(y => y.column == tableState.headersEn[i]) || dopFilters.find(y => y.column == tableState.headersEn[i])?.selected == 'all') &&
                                                    <div>
                                                        <button onClick={() => sort(tableState.headersEn[i], setSortConf, setSource, originalSource, false, filterConfig, dopFilters)}>
                                                            {sortConf?.column === tableState.headersEn[i] ? (
                                                                sortConf.type === "asc" ? "↑" :
                                                                    sortConf.type === 'desc' ? "↓" : "↕"
                                                            ) : "↕"}
                                                        </button>
                                                        <button onClick={() => {
                                                            setFilterColumn(x);
                                                            setFilterColumnEn(tableState.headersEn[i]);
                                                            setIsModalFilterOpen(true);
                                                        }}>▼</button>
                                                    </div>
                                                }
                                            </div>
                                        </th>
                                    ))}
                                    <th className="edit-column">
                                        <button className="img-button center-img">
                                            <img src="info.png" alt="" />
                                        </button>
                                    </th>
                                    <th>
                                        <div className="inTH">
                                            <input
                                                type="checkbox"
                                                checked={Object.values(selectingRows).filter(x => x).length == source.length && source.length > 0}
                                                onChange={(e) => {
                                                    setSelectingRows(Object.keys(selectingRows).reduce((acc: SelectingRows, x) => {
                                                        acc[x] = e.target.checked;
                                                        return acc;
                                                    }, {}));
                                                }}
                                            />
                                        </div>
                                    </th>
                                    {subordinateTables.find(x => x.nameTable == tableState.name)?.subordinateTables.map((x, i) => (
                                        <th key={i}>
                                            <span>{subordinateTables.find(y => y.nameTable == tableState.name)?.ru[i]}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {source.map((x, i) => (
                                    <tr key={i} className={searchedRows[x['id']] ? 'searched' : ''}>
                                        {tableState.headersEn.map((y, j) => j != 0 && (
                                            <td key={j}>
                                                {fk.find(z => z.nameTable == tableState.name)?.fkS.includes(y) ? (
                                                    editingRows[x['id']] ? (
                                                        <div className="inTD">
                                                            <div className="inTD-select">
                                                                <button className="inTD-select-button" onClick={() => {
                                                                    setSelectId(editingSource.find(z => z.id == x['id'])[y]);
                                                                    setIsSelectForNewRow(false);
                                                                    setSelectingColumn(y);
                                                                    setIsSelectingRow(true);
                                                                    setIsSelect(true);
                                                                }}>
                                                                    {(() => {
                                                                        const indexTableTo = fk.find(z => z.nameTable === tableState.name)?.fkS.indexOf(y);
                                                                        const nameTableTo = fk.find(z => z.nameTable === tableState.name)?.tablesPK?.[indexTableTo || 0];
                                                                        const sourceTableTo = tablesPK.find(z => z.nameTable === nameTableTo)?.source;
                                                                        const value = editingSource.find(z => z.id == x['id'])[y];
                                                                        if (sourceTableTo && value) {
                                                                            return getValueFK(nameTableTo || '', tableState.name, value, sourceTableTo);
                                                                        }
                                                                        return value || 'Выбрать';
                                                                    })()}
                                                                </button>
                                                                {editingSource.find(z => z.id == x['id'])[y] &&
                                                                    <button className="img-button" onClick={async () => {
                                                                        const updatedEditingSource = [...editingSource];
                                                                        const rowIndex = updatedEditingSource.findIndex(row => row.id == x['id']);
                                                                        if (rowIndex !== -1) {
                                                                            let id = await getColumnById(tableState.name, y, x['id']);
                                                                            updatedEditingSource[rowIndex] = {
                                                                                ...updatedEditingSource[rowIndex],
                                                                                [y]: id
                                                                            };
                                                                            setEditingSource(updatedEditingSource);
                                                                        }
                                                                    }}>
                                                                        <img src="cancel.png" alt="" />
                                                                    </button>
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="inTD-select">
                                                            <span title={(() => {
                                                                let indexTableTo = fk.find(z => z.nameTable == tableState.name)?.fkS.indexOf(y);
                                                                let nameTableTo = fk.find(z => z.nameTable == tableState.name)?.tablesPK[indexTableTo || 0];
                                                                let sourceTableTo = tablesPK.find(z => z.nameTable == nameTableTo)?.source;
                                                                if (sourceTableTo) {
                                                                    let v = getValueFK(nameTableTo || '', tableState.name, x[y], sourceTableTo);
                                                                    return v;
                                                                }
                                                                return '';
                                                            })()} className="span-value">{(() => {
                                                                let indexTableTo = fk.find(z => z.nameTable == tableState.name)?.fkS.indexOf(y);
                                                                let nameTableTo = fk.find(z => z.nameTable == tableState.name)?.tablesPK[indexTableTo || 0];
                                                                let sourceTableTo = tablesPK.find(z => z.nameTable == nameTableTo)?.source;
                                                                if (sourceTableTo) {
                                                                    let v = getValueFK(nameTableTo || '', tableState.name, x[y], sourceTableTo);
                                                                    return v;
                                                                }
                                                                return '';
                                                            })()}</span>
                                                            <button className="img-button right whitebg-button" onClick={() => {
                                                                setSelectId(x[y]);
                                                                setIsSelectForNewRow(false);
                                                                setSelectingColumn(y);
                                                                setIsSelectingRow(true);
                                                                setIsSelect(false);
                                                            }}>
                                                                <img src="next.png" alt="" />
                                                            </button>
                                                        </div>
                                                    )
                                                ) : (
                                                    editingRows[x['id']] ? (
                                                        <div className="inTD">
                                                            {!comboboxes.find(y => y.nameTable == tableState.name)?.columns.includes(y) ? (
                                                                <input
                                                                    type={
                                                                        tableState.types.find(z => z.column_name == y)?.data_type == 'integer' ||
                                                                            tableState.types.find(z => z.column_name == y)?.data_type == 'bigint'
                                                                            ? 'number'
                                                                            : tableState.types.find(z => z.column_name == y)?.data_type == 'date'
                                                                                ? 'date'
                                                                                : 'text'
                                                                    }
                                                                    value={editingSource.find(z => z.id == x['id'])?.[y] || ""}
                                                                    onChange={e => handleInputChangeRows(e as unknown as React.ChangeEvent<HTMLInputElement>, x['id'].toString(), y, source, setEditingSource)}
                                                                />
                                                            ) : (
                                                                <select
                                                                    value={editingSource.find(z => z.id == x['id'])?.[y] || ""}
                                                                    onChange={e => handleInputChangeRows(e as unknown as React.ChangeEvent<HTMLInputElement>, x['id'].toString(), y, source, setEditingSource)}
                                                                >
                                                                    {comboboxes.find(z => z.nameTable == tableState.name)?.comboboxes[comboboxes.find(z => z.nameTable == tableState.name)?.columns.indexOf(y) || 0].map((z, i) => {
                                                                        if (i === 0 && !editingSource.find(row => row.id == x['id'])?.[y]) {
                                                                            setTimeout(() => {
                                                                                const updatedEditingSource = [...editingSource];
                                                                                const rowIndex = updatedEditingSource.findIndex(row => row.id == x['id']);
                                                                                if (rowIndex !== -1) {
                                                                                    updatedEditingSource[rowIndex] = {
                                                                                        ...updatedEditingSource[rowIndex],
                                                                                        [y]: z
                                                                                    };
                                                                                    setEditingSource(updatedEditingSource);
                                                                                }
                                                                            }, 0);
                                                                        }
                                                                        return <option key={i} value={z}>{z}</option>;
                                                                    })}
                                                                </select>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="span-value" title={tableState.types.find(z => z.column_name == y)?.data_type == 'date' ? normalizeDate(x[y]).toLocaleDateString() : x[y]}>{tableState.types.find(z => z.column_name == y)?.data_type == 'date' ? normalizeDate(x[y]).toLocaleDateString() : x[y]}</span>
                                                    )
                                                )}
                                            </td>
                                        ))}
                                        <td className="edit-column">
                                            <button className="img-button center-img" onClick={() => handleEditingChange(x['id'], editingRows, tableState, source, setSource, editingSource, setEditingRows, originalSource, setOriginalSource, setEditingSource)}>
                                                <img src={editingRows[x['id']] ? "save.png" : 'edit.png'} alt="" />
                                            </button>
                                        </td>
                                        <td>
                                            <div className="inTD">
                                                <input
                                                    type="checkbox"
                                                    checked={selectingRows[x['id']]}
                                                    onChange={(e) => {
                                                        setSelectingRows({ ...selectingRows, [x['id']]: e.target.checked });
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        {subordinateTables.find(y => y.nameTable == tableState.name)?.subordinateTables.map((y, i) => (
                                            <td key={i}>
                                                <button onClick={() => getSubordinateTable(y, x['id'], states, tableState, setStates, changeCurrentTable)} className="to-button">
                                                    <span>Посмотреть</span>
                                                    <img src="next.png" alt="" />
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {source.length == 0 && (
                                    <tr>
                                        <td colSpan={tableState.headersEn.length + 1}>
                                            <span>Здесь пока нету записей, но вы можете их добавить!</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    {tableState.headersEn.map((x, i) => i != 0 && (
                                        <td key={i}>
                                            <div className="inTD">
                                                {fk.find(y => y.nameTable === tableState.name)?.fkS.includes(x) ?
                                                    (
                                                        <div className="inTD-select">
                                                            <button className="inTD-select-button" onClick={() => {
                                                                setIsSelectForNewRow(true);
                                                                setSelectingColumn(x);
                                                                setIsSelectingRow(true);
                                                                setIsSelect(true);
                                                            }}>
                                                                {newRowValues[x]
                                                                    ? (() => {
                                                                        const indexTableTo = fk.find(z => z.nameTable === tableState.name)?.fkS.indexOf(x);
                                                                        const nameTableTo = fk.find(z => z.nameTable === tableState.name)?.tablesPK?.[indexTableTo || 0];
                                                                        const sourceTableTo = tablesPK.find(z => z.nameTable === nameTableTo)?.source;
                                                                        if (sourceTableTo && newRowValues[x]) {
                                                                            return getValueFK(nameTableTo || '', tableState.name, newRowValues[x], sourceTableTo);
                                                                        }
                                                                        return newRowValues[x];
                                                                    })()
                                                                    : 'Выбрать'}
                                                            </button>
                                                            {newRowValues[x] &&
                                                                <button className="img-button" onClick={() => {
                                                                    setNewRowValues({ ...newRowValues, [x]: null });
                                                                }}>
                                                                    <img src="cancel.png" alt="" />
                                                                </button>
                                                            }
                                                        </div>
                                                    ) : !comboboxes.find(y => y.nameTable == tableState.name)?.columns.includes(x) ? (
                                                        <input
                                                            placeholder="Введите значение..."
                                                            type={
                                                                tableState.types.find(y => y.column_name == x)?.data_type == 'integer' ||
                                                                    tableState.types.find(y => y.column_name == x)?.data_type == 'bigint'
                                                                    ? 'number'
                                                                    : tableState.types.find(y => y.column_name == x)?.data_type == 'date'
                                                                        ? 'date'
                                                                        : 'text'
                                                            }
                                                            value={newRowValues[x] || ""}
                                                            onChange={e => handleInputChange(x, e.target.value, setNewRowValues)}
                                                        />
                                                    ) : (
                                                        <select
                                                            defaultValue={(() => {
                                                                const options = comboboxes.find(y => y.nameTable == tableState.name)?.comboboxes[comboboxes.find(y => y.nameTable == tableState.name)?.columns.indexOf(x) || 0];
                                                                if (options && options.length > 0 && !newRowValues[x]) {
                                                                    setTimeout(() => handleInputChange(x, options[0], setNewRowValues), 0);
                                                                    return options[0];
                                                                }
                                                                return newRowValues[x] || '';
                                                            })()}
                                                            onChange={e => handleInputChange(x, e.target.value, setNewRowValues)}
                                                        >
                                                            {comboboxes.find(y => y.nameTable == tableState.name)?.comboboxes[comboboxes.find(y => y.nameTable == tableState.name)?.columns.indexOf(x) || 0].map((z, i) => {
                                                                return <option key={i} value={z}>{z}</option>;
                                                            })}
                                                        </select>
                                                    )}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="edit-column">
                                        <button className="img-button center-img" onClick={async () => {
                                            await addNewRow(tableState, newRowValues, source, setSource, setNewRowValues, originalSource, setOriginalSource);
                                        }}>
                                            <img src="add.png" alt="" />
                                        </button>
                                    </td>
                                    <td>
                                        <button className="img-button center-img" onClick={async () => {
                                            await deleteRows(tableState.name, editingSource, setEditingSource, selectingRows, setSelectingRows, editingRows, setEditingRows, originalSource, setOriginalSource, setSource);
                                        }}>
                                            <img src="delete.png" alt="" />
                                        </button>
                                    </td>
                                    {subordinateTables.find(x => x.nameTable == tableState.name)?.subordinateTables.map((x, i) => (<td key={i}></td>))}
                                </tr>
                            </tfoot>
                        </table>
                    )}
            </div>
            {
                isModalFilterOpen && <ModalFilter
                    column={filterColumn}
                    setIsModalOpen={setIsModalFilterOpen}
                    type={tableState.types.find(x => x.column_name == filterColumnEn)?.data_type || 'text'}
                    setFilterValues={setFilterValues}
                    setFilterType={setFilterType}
                    setFilterIsCaseSensitive={setFilterIsCaseSensitive}
                />
            }
            {
                isSelectingRow && <SelectRow
                    fkTableName={tableState.name}
                    tableName={fk[fk.findIndex(x => x.nameTable == tableState.name)].tablesPK[fk[fk.findIndex(x => x.nameTable == tableState.name)].fkS.indexOf(selectingColumn)]}
                    column={selectingColumn}
                    isSelect={isSelect}
                    id={!isSelectForNewRow ? selectId : newRowValues[selectingColumn]}
                    close={(id) => {
                        setIsSelectingRow(false);
                        if (id) {
                            const editingRowId = Object.keys(editingRows).find(rowId => editingRows[rowId]);
                            if (editingRowId) {
                                const updatedEditingSource = [...editingSource];
                                const rowIndex = updatedEditingSource.findIndex(row => row.id == editingRowId);
                                if (rowIndex !== -1) {
                                    updatedEditingSource[rowIndex] = {
                                        ...updatedEditingSource[rowIndex],
                                        [selectingColumn]: id
                                    };
                                    setEditingSource(updatedEditingSource);
                                }
                            } else {
                                setNewRowValues(prev => ({ ...prev, [selectingColumn]: id }));
                            }
                        }
                    }}
                />
            }
        </div >
    );
} 