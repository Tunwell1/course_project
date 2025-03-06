import { useState, useEffect } from "react";
import { headersRu } from "../../headersRu";
import { EditingRows, FilterConfig, NewRowValues, SortConfig, TableProps } from "../../types";
import { addNewRow, handleEditingChange, handleInputChange, handleInputChangeRows, RefreshTable, sort, normalizeDate, filterData, getTypeFilter, removeFilter } from "../../functions";
import { ModalFilter } from "../ModalFilter/ModalFilter";
import "./Table.css";

export const Table: React.FC<TableProps> = ({ tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [editingSource, setEditingSource] = useState<any[]>(tableState?.editingSource || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || {});
    const [sortConf, setSortConf] = useState<SortConfig>(tableState.sortConf || {})
    const [originalSource, setOriginalSource] = useState<any[]>(tableState?.source || []);
    const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
    const [filterColumn, setFilterColumn] = useState('');
    const [filterColumnEn, setFilterColumnEn] = useState('');
    const [filterValues, setFilterValues] = useState<any[]>([]);
    const [filterType, setFilterType] = useState<string>('none');
    const [filterIsCaseSensitive, setFilterIsCaseSensitive] = useState<boolean>(false);
    const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);

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
                tableState.sortConf != sortConf
            ) {
                saveTableState(tableState.name, { ...tableState, source, editingRows, newRowValues, editingSource, sortConf });
            }
        };
    }, [tableState.name, source, newRowValues, editingRows, editingSource, sortConf]);

    useEffect(() => {
        sort(sortConf.column, setSortConf, setSource, source, originalSource, true);
    }, [originalSource])

    return (
        <div className="space-table" style={isModalFilterOpen ? { userSelect: "none" } : { userSelect: 'auto' }}>
            <div>
                <button onClick={() => RefreshTable(setIsLoading, tableState.name, setSource, setOriginalSource, setFilterConfig)}>Обновить</button>
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
                                <button onClick={() => removeFilter(x.column, filterConfig, setFilterConfig, originalSource, setSource)}>X</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isLoading ? (<p> Загрузка...</p>) :
                (
                    <table>
                        <thead>
                            <tr>
                                {headersRu.find(x => x.name == tableState.name)?.headers.map((x, i) => i >= 0 && (
                                    <th key={i}>
                                        <div className="inTH">
                                            <span>{x}</span>
                                            <button onClick={() => sort(tableState.headersEn[i], setSortConf, setSource, source, originalSource, false)}>
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
                                    </th>
                                ))}
                                <th>
                                    <span>Редактирование</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {source.map((x, i) => (
                                <tr key={i}>
                                    {tableState.headersEn.map((y, j) => j >= 0 && (
                                        <td key={j}>
                                            {editingRows[x['id']] ? (
                                                <div className="inTD">
                                                    <input
                                                        type="text"
                                                        value={editingSource.find(z => z.id == x['id'])[y]}
                                                        onChange={(e) => handleInputChangeRows(e, x['id'], y, source, setEditingSource)}
                                                    />
                                                </div>
                                            ) : (
                                                <span>{x[y]}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td>
                                        <button onClick={() => handleEditingChange(x['id'], editingRows, tableState, source, setSource, editingSource, setEditingRows, originalSource, setOriginalSource)}>{editingRows[x['id']] ? "Сохранить" : "Редактировать"}</button>
                                    </td>
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
                                {tableState.headersEn.map((x, i) => i >= 0 && (
                                    <td key={i}>
                                        <div className="inTD">
                                            <input
                                                type="text"
                                                value={newRowValues[x] || ""}
                                                onChange={e => handleInputChange(x, e.target.value, setNewRowValues)}
                                            />
                                        </div>
                                    </td>
                                ))}
                                <td>
                                    <button onClick={async () => addNewRow(tableState, newRowValues, source, setSource, setNewRowValues, originalSource, setOriginalSource)}>+</button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            {isModalFilterOpen && <ModalFilter
                column={filterColumn}
                setIsModalOpen={setIsModalFilterOpen}
                type={tableState.types.find(x => x.column_name == filterColumnEn)?.data_type || 'text'}
                setFilterValues={setFilterValues}
                setFilterType={setFilterType}
                setFilterIsCaseSensitive={setFilterIsCaseSensitive}
            />}
        </div>
    );
} 