import { getRowById, getTable } from "../../database";
import { headersRu, fk } from "../../constants";
import { SelectRowProps } from "../../types";
import { useState, useEffect } from "react";
import { getValueFK } from "../../functions";
import './SelectedRow.css';

export const SelectRow: React.FC<SelectRowProps> = ({ fkTableName, tableName, column, id, close, isSelect }) => {
    const [source, setSource] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [visCols, setVisCols] = useState<string[]>([]);
    const [nestedSelectRow, setNestedSelectRow] = useState<{
        fkTableName: string;
        tableName: string;
        column: string;
        id: number;
        isSelect: boolean;
    } | null>(null);
    const [fkValues, setFkValues] = useState<{ [rowId: number]: { [key: string]: string } }>({});

    useEffect(() => {
        async function getSource() {
            setIsLoading(true);
            if (isSelect) {
                const table = await getTable(tableName);
                if (table) setSource(table);
            } else {
                const row = await getRowById(tableName, id);
                if (row) setSource(row);
            }
            setIsLoading(false);
        }
        getSource();
    }, [tableName]);

    useEffect(() => {
        let ind = fk.find(x => x.nameTable == fkTableName)?.fkS.findIndex(x => x == column);
        let visCols = fk.find(x => x.nameTable == fkTableName)?.visCols;
        setVisCols(visCols ? visCols[ind ?? 0] : []);
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                if (nestedSelectRow) {
                    setNestedSelectRow(null);
                } else {
                    close();
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [nestedSelectRow]);

    // Загрузка значений для внешних ключей
    useEffect(() => {
        const loadFkValues = async () => {
            const newFkValues: { [rowId: number]: { [key: string]: string } } = {};

            for (const row of source) {
                newFkValues[row.id] = {};

                for (const key of Object.keys(row)) {
                    if (fk.find(x => x.nameTable == tableName)?.fkS.includes(key)) {
                        let indexTableTo = fk.find(z => z.nameTable == tableName)?.fkS.indexOf(key);
                        let nameTableTo = fk.find(z => z.nameTable == tableName)?.tablesPK[indexTableTo || 0];
                        let sourceTableTo = await getTable(nameTableTo || '');

                        if (sourceTableTo) {
                            let v = getValueFK(nameTableTo || '', tableName, row[key], sourceTableTo);
                            newFkValues[row.id][key] = v || row[key];
                        } else {
                            newFkValues[row.id][key] = row[key];
                        }
                    }
                }
            }

            setFkValues(newFkValues);
        };

        if (source.length > 0) {
            loadFkValues();
        }
    }, [source, tableName]);

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (nestedSelectRow) {
            setNestedSelectRow(null);
        } else {
            close();
        }
    };

    return (
        <div className={nestedSelectRow ? "" : "modal"} onClick={handleModalClick}>
            <div className="modal-content" style={{ width: 'fit-content' }} onClick={(e) => e.stopPropagation()}>
                <h1>{isSelect? `Выберите строку для столбца ${column}` : `Сведения о выбранной записи`}</h1>
                {isLoading ? <p>Loading...</p> : (
                    <table>
                        <thead>
                            <tr>
                                {headersRu.find(x => x.name == tableName)?.headers.map((x, i) => i != 0 && (
                                    <th key={i}>{x}</th>
                                ))}
                                {isSelect && <th>Выбрать</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {source.map((row, i) => (
                                <tr key={i}>
                                    {Object.keys(row).map((key, j) => j != 0 && (
                                        fk.find(x => x.nameTable == tableName)?.fkS.includes(key) ? (
                                            <td key={j}>
                                                <div className="inTD-select">
                                                    <span
                                                        title={fkValues[row.id]?.[key] || row[key]}
                                                        className="span-value"
                                                    >
                                                        {fkValues[row.id]?.[key] || row[key]}
                                                    </span>
                                                    <button className="img-button right" onClick={(e) => {
                                                        e.stopPropagation();
                                                        let indexTableTo = fk.find(z => z.nameTable == tableName)?.fkS.indexOf(key);
                                                        let nameTableTo = fk.find(z => z.nameTable == tableName)?.tablesPK[indexTableTo || 0];
                                                        setNestedSelectRow({
                                                            fkTableName: tableName,
                                                            tableName: nameTableTo || '',
                                                            column: key,
                                                            id: row[key],
                                                            isSelect: false
                                                        });
                                                    }}>
                                                        <img src="next.png" alt="" />
                                                    </button>
                                                </div>
                                            </td>
                                        ) : (
                                            <td key={j}>{row[key]}</td>
                                        )
                                    ))}
                                    {isSelect && (
                                        <td>
                                            <button className="inTD-select-button" onClick={(e) => {
                                                e.stopPropagation();
                                                close(row['id'], tableName, visCols.map(x => row[x]));
                                            }}>Выбрать</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {source.length == 0 && (
                                <tr>
                                    <td colSpan={headersRu.find(x => x.name == tableName)?.headers.length} className="center">Здесь пока нету строк.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            {nestedSelectRow && (
                <SelectRow
                    {...nestedSelectRow}
                    close={() => setNestedSelectRow(null)}
                />
            )}
        </div>
    );
}
