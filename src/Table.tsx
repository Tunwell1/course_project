import { useState, useEffect } from "react";
import { headersRu } from "./headersRu";
import { EditingRows, NewRowValues, SortConfig, TableProps } from "./types";
import { addNewRow, handleEditingChange, handleInputChange, handleInputChangeRows, RefreshTable } from "./functions";

export const Table: React.FC<TableProps> = ({ tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [editingSource, setEditingSource] = useState<any[]>(tableState?.editingSource || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || {});
    const [sortConf, setSortConf] = useState<SortConfig>(tableState.sortConf || {column: tableState.headersEn[0], type: "none"})
    const [originalSource, setOriginalSource] = useState<any[]>(tableState?.source || []);

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

    function sort(col: string) {
        console.log(originalSource);
        setSortConf((prevSortConf) => {
            if (prevSortConf?.column === col) {
                switch (prevSortConf.type) {
                    case "asc":
                        setSource([...source].sort((a,b) => a[col]<b[col] ? 1 : -1))
                        return { ...prevSortConf, type: "desc" };
                    case "desc":
                        setSource([...originalSource]);
                        return { ...prevSortConf, type: "none" };
                    case "none":
                        setSource([...source].sort((a,b) => a[col]>b[col] ? 1 : -1))
                        return { ...prevSortConf, type: "asc" };
                    default:
                        return prevSortConf;
                }
            } else {
                setSource([...source].sort((a,b) => a[col]>b[col] ? 1 : -1))
                return { column: col, type: "asc" };
            }
        });
    }


    return (
        <div className="space-table">
            <div>
                <button onClick={() => RefreshTable(setIsLoading, tableState.name, setSource)}>Обновить</button>
            </div>
            {isLoading ? (
                <p>
                    Загрузка...
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {headersRu.find(x => x.name == tableState.name)?.headers.map((x, i) => i != 0 && (
                                <th key={i}>
                                    <div className="inTH">
                                        <span>{x}</span>
                                        <button onClick={() => sort(tableState.headersEn[i])}>
                                            {sortConf?.column === tableState.headersEn[i] ? (
                                                sortConf.type === "asc" ? "↑" :
                                                    sortConf.type === 'desc' ? "↓" : "↕"
                                            ) : "↕"}
                                        </button>
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
                                    <button onClick={() => handleEditingChange(x['id'], editingRows, tableState, source, setSource, editingSource, setEditingRows)}>{editingRows[x['id']] ? "Сохранить" : "Редактировать"}</button>
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
                                <button onClick={() => addNewRow(tableState, newRowValues, source, setSource, setNewRowValues)}>+</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    )
}