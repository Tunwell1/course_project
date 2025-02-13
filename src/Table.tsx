import { useEffect, useState } from "react";
import { getTable, addRecord, deleteRecordById, saveRecord } from "./database";

type TableProps = {
    source: any[];
    nameTable: string;
    headers: string[];
    headersEn: string[];
    widthCols: number[];
    types: string[];
}

export const Table: React.FC<TableProps> = ({ source, nameTable, headers, headersEn, widthCols, types }) => {
    const [table, setTable] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState<{ id: number, isSelected: boolean }[]>([]);
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const [isEditingRows, setIsEditingRows] = useState<{ id: number, isEditing: boolean }[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' | '' }>({ key: '', direction: '' });

    // Обновление таблицы (посылаем запрос в БД)
    async function updateTable() {
        setIsLoading(true);
        let tabl = await getTable(nameTable) as [];
        setTable(tabl);
        setIsLoading(false);
    }

    // Обработчик изменения значения инпута
    const handleInputChange = (header: string, value: string) => {
        setInputValues((prevValues) => ({
            ...prevValues,
            [header]: value,
        }));
    };

    // Добавление записи в БД и обновлеяем текущее содержимое таблицы
    async function addRec() {
        let values = headersEn.map((header, index) => {
            if (index === 0) return;
            return inputValues[header] || '';
        });
        let record = Object.fromEntries(
            headersEn.map((e, i) => [e, values[i]])
        );
        let id = await addRecord(nameTable, record);
        if (id) record.id = id[0].id;
        setTable((prevTable) => [...prevTable, record]);
    }

    //Удаление выбранных записей из БД и текущей таблицы
    async function deleteSelectedRows() {
        setIsLoading(true);
        let idsForDeleting = selectedRows.filter(x => x.isSelected).map(x => x.id);
        idsForDeleting.forEach(async (x) => await deleteRecordById(nameTable, x));
        let tabl = table.filter(x => !idsForDeleting.includes(x['id']));
        setTable(tabl);
        setIsLoading(false);
    }

    // Обработчик изменения состояния редактирования для строки
    const handleEditClick = async (id: number) => {
        let row = table.find(x => x.id == id);
        setIsEditingRows((prevEditingRows) =>
            prevEditingRows.map((row) =>
                row.id === id ? { ...row, isEditing: !row.isEditing } : row
            )
        );
        if (isEditingRows.find(x => x.id == id)?.isEditing) await saveRecord(nameTable, row);
    };

    // Обработчик изменения состояния чекбокса для строки
    const handleCheckboxChange = (id: number) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.map((row) =>
                row.id === id ? { ...row, isSelected: !row.isSelected } : row
            )
        );
    };

    // Обработчик выделения всех чекбоксов
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.map((row) => ({
                ...row,
                isSelected: isChecked,
            }))
        );
    };

    // Обработчик сортировки
    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' | '' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = '';
            key = '';
        }
        setSortConfig({ key, direction });
    };


    // Функция сортировки
    const sortedTable = () => {
        if (sortConfig.direction === '') {
            return table;
        }
        return [...table].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Обновление table при изменении nameTable
    useEffect(() => {
        setTable(source);
    }, [nameTable]);

    return (
        <div className="space-table">
            <div>
                <button onClick={() => updateTable()}>Обновить</button>
            </div>
            {isLoading ? (
                <p>Ожидайте...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {headers.map((x, i) => (i != 0 &&
                                <th style={{ width: widthCols[i] + "%" }} key={i}>
                                    <div className="inTH">
                                        <span>{x}</span>
                                        <button onClick={() => handleSort(headersEn[i])}>
                                            {sortConfig.key === headersEn[i] && sortConfig.direction === 'ascending' && '↑'}
                                            {sortConfig.key === headersEn[i] && sortConfig.direction === 'descending' && '↓'}
                                            {sortConfig.key !== headersEn[i] && '⇅'}
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th>Ред</th>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.every((row) => row.isSelected)}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTable().map((x, i) => {
                            const isEditing = isEditingRows.find((row) => row.id === x['id'])?.isEditing || false;
                            return (
                                <tr key={i}>
                                    {headersEn.map((y, j) => (j != 0 && (
                                        <td style={{ width: widthCols[j] + "%" }} key={j}>
                                            {isEditing ? (
                                                <div className="inTD">
                                                    <input
                                                        type={types[j]}
                                                        value={x[y] || ''}
                                                        onChange={(e) => {
                                                            const updatedTable = table.map((row) =>
                                                                row.id === x['id'] ? { ...row, [y]: e.target.value } : row
                                                            );
                                                            setTable(updatedTable);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                x[y]
                                            )}
                                        </td>
                                    )))}
                                    <td>
                                        <button onClick={() => handleEditClick(x['id'])}>
                                            {isEditing ? 'Сохранить' : 'Ред'}
                                        </button>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.find((row) => row.id === x['id'])?.isSelected || false}
                                            onChange={() => handleCheckboxChange(x['id'])}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            {headers.map((x, i) => (i != 0 && <td style={{ width: widthCols[i] + "%" }} key={i}>
                                <div className="inTD">
                                    <input
                                        placeholder={"Введите столбец '" + x + "'..."}
                                        type={types[i]}
                                        onChange={(e) => handleInputChange(headersEn[i], e.target.value)}
                                    />
                                </div>
                            </td>))}
                            <td>
                                <button onClick={() => addRec()}>+</button>
                            </td>
                            <td>
                                <button onClick={() => deleteSelectedRows()}>Удалить</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
};
