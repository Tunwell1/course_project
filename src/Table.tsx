import { useState, useEffect } from "react";
import { headersRu } from "./headersRu";
import { addRecord, getTable, saveRecord } from "./database";
import { EditingRows, NewRowValues, TableProps } from "./types";

export const Table: React.FC<TableProps> = ({ tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [editingSource, setEditingSource] = useState<any[]>(tableState?.source || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || {});

    useEffect(() => {
        return () => {
            if (tableState?.source != source || tableState.editingRows != editingRows || tableState.newRowValues != newRowValues) {
                saveTableState(tableState.name, { ...tableState, source, editingRows, newRowValues });
            }
        };
    }, [tableState.name, source, newRowValues, editingRows]);

    async function RefreshTable() {
        setIsLoading(true);
        const t = await getTable(tableState.name);
        setSource(t || []);
        setIsLoading(false);
    }

    async function addNewRow() {
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

    function handleInputChangeRows(e: React.ChangeEvent<HTMLInputElement>, id: string, header: string) {
        let rows = [...source];
        let ind = rows.findIndex(x => x.id == id);
        rows[ind][header] = e.target.value;
        setEditingSource(rows);
    }

    const handleInputChange = (header: string, value: string) => {
        setNewRowValues(prevValues => ({
            ...prevValues,
            [header]: value
        }));
    };

    async function handleEditingChange(id: number) {
        if (editingRows[id]) {
            await saveRecord(tableState.name, source.find(x => x.id == id))
            setSource(editingSource);
        }
        setEditingRows(prevEditingRows => ({
            ...prevEditingRows,
            [id]: !prevEditingRows[id]
        }));
    }


    return (
        <div className="space-table">
            <div>
                <button onClick={() => RefreshTable()}>Обновить</button>
            </div>
            {isLoading ? (
                <p>Ожидайте...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {headersRu.find(x => x.name == tableState.name)?.headers.map((x, i) => i != 0 && (
                                <th key={i}>
                                    <span>{x}</span>
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
                                                    onChange={(e) => handleInputChangeRows(e, x['id'], y)}
                                                />
                                            </div>
                                        ) : (
                                            <span>{x[y]}</span>
                                        )}
                                    </td>
                                ))}
                                <td>
                                    <button onClick={() => handleEditingChange(x['id'])}>{editingRows[x['id']] ? "Сохранить" : "Редактировать"}</button>
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
                                            onChange={e => handleInputChange(x, e.target.value)}
                                        />
                                    </div>
                                </td>
                            ))}
                            <td>
                                <button onClick={() => addNewRow()}>+</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    )
}