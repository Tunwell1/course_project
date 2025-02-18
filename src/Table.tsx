import { useState, useEffect } from "react";
import { headersRu } from "./headersRu";
import { addRecord, getTable } from "./database";
import { EditingRows, NewRowValues, TableProps } from "./types";

export const Table: React.FC<TableProps> = ({ tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || []);
    const [newRowValues, setNewRowValues] = useState<NewRowValues>(tableState?.newRowValues || {});
    const [editingRows, setEditingRows] = useState<EditingRows>(tableState?.editingRows || []);

    useEffect(() => {
        return () => {
            if (tableState?.source !== source || tableState.editingRows !== editingRows || tableState.newRowValues !== newRowValues) {
                saveTableState(tableState.name, { ...tableState, source, editingRows, newRowValues });
            }
        };
    }, [tableState.name, source, newRowValues]);

    async function RefreshTable() {
        setIsLoading(true);
        const t = await getTable(tableState.name);
        setSource(t || []);
        setIsLoading(false);
    }

    async function addNewRow() {
        const row = tableState.headersEn.reduce((acc, header, index) => {
            if (index !== 0) {
                acc[header] = newRowValues[header] || "";
            }
            return acc;
        }, {} as { [key: string]: string });
        await addRecord(tableState.name, row);
        const newSource = [...source, row];
        setSource(newSource);
        setNewRowValues({});
    }

    const handleInputChange = (header: string, value: string) => {
        setNewRowValues(prevValues => ({
            ...prevValues,
            [header]: value
        }));
    };

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
                                        <span>{x[y]}</span>
                                    </td>
                                ))}
                                <td>
                                    <button>кнопочка</button>
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