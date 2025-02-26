import { useState, useEffect } from "react";
import { headersRu } from "./headersRu";
import { EditingRows, NewRowValues, SortConfig, TableProps } from "./types";
import { addNewRow, handleEditingChange, handleInputChange, handleInputChangeRows, RefreshTable, sort } from "./functions";
import { Modal } from "./Modal";

export const Table: React.FC<TableProps> = ({ tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [editingSource, setEditingSource] = useState<any[]>(tableState?.editingSource || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || {});
    const [sortConf, setSortConf] = useState<SortConfig>(tableState.sortConf || {})
    const [originalSource, setOriginalSource] = useState<any[]>(tableState?.source || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterColumn, setFilterColumn] = useState('')

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
        <div className="space-table" style={isModalOpen ? { userSelect: "none" } : { userSelect: 'auto' }}>
            <div>
                <button onClick={() => RefreshTable(setIsLoading, tableState.name, setSource, setOriginalSource)}>Обновить</button>
            </div>
            {isLoading ? (<p> Загрузка...</p>) :
                (
                    <table>
                        <thead>
                            <tr>
                                {headersRu.find(x => x.name == tableState.name)?.headers.map((x, i) => i != 0 && (
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
                                                setIsModalOpen(true);
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
                                    {tableState.headersEn.map((y, j) => j != 0 && (
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
                                    <td colSpan={tableState.headersEn.length}>
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
            {isModalOpen && <Modal column={filterColumn} setIsModalOpen={setIsModalOpen} />}
        </div>
    )
}