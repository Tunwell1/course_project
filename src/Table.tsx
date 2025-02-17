import { useState, useEffect } from "react";
import { fullTable } from "./App";
import { headersRu } from "./headersRu";
import { addRecord, getTable } from "./database";

type TableProps = {
    table: fullTable;
    tableState: any;
    saveTableState: (tableName: string, newState: any) => void;
}

export const Table: React.FC<TableProps> = ({ table, tableState, saveTableState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [source, setSource] = useState<any[]>(tableState?.source || table.source);
    const [newRowValues, setNewRowValues] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        return () => {
            if (tableState?.source !== source) {
                saveTableState(table.name, { ...tableState, source });
            }
        };
    }, [source, tableState, saveTableState, table.name]);

    async function RefreshTable() {
        setIsLoading(true);
        const t = await getTable(table.name);
        setSource(t || []);
        setIsLoading(false);
    }

    async function addNewRow() {
        const row = table.headersEn.reduce((acc, header, index) => {
            if (index !== 0) {
                acc[header] = newRowValues[header] || "";
            }
            return acc;
        }, {} as { [key: string]: string });

        await addRecord(table.name, row);
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
                            {headersRu.find(x => x.name == table.name)?.headers.map((x, i) => i != 0 && (
                                <th key={i}>
                                    <span>{x}</span>
                                </th>
                            ))}
                            <th>
                                <span>x</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {source.map((x, i) => (
                            <tr key={i}>
                                {table.headersEn.map((y, j) => j != 0 && (
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
                                <td colSpan={table.headersEn.length}>
                                    <span>Здесь пока нету записей, но вы можете их добавить!</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            {table.headersEn.map((x, i) => i != 0 && (
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