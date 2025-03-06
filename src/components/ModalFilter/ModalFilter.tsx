import { useEffect, useState } from 'react';
import { ModalFilterProps } from '../../types';
import "./ModalFilter.css";

export const ModalFilter: React.FC<ModalFilterProps> = ({ 
    setIsModalOpen, 
    column, 
    type, 
    setFilterValues, 
    setFilterType, 
    setFilterIsCaseSensitive 
}) => {
    const [isCaseSensitive, setIsCaseSensitive] = useState(false);
    const [filtType, setFiltType] = useState('none');
    const [numberFilterType, setNumberFilterType] = useState('none');
    const [dateFilterType, setDateFilterType] = useState('none');
    const [filterVals, setFilterVals] = useState<any[]>([
        type === 'text' ? '' : 
        type === 'integer' || type === 'bigint' ? 0 : 
        new Date()
    ]);

    useEffect(() => {
        if (type === 'integer' || type === 'bigint') {
            if (numberFilterType === 'inRange' || numberFilterType === 'notInRange') {
                setFilterVals(prev => [prev[0], prev[0] || 0]);
            } else {
                setFilterVals(prev => [prev[0]]);
            }
        }
    }, [numberFilterType]);

    useEffect(() => {
        if (dateFilterType === 'inRange' || dateFilterType === 'notInRange') {
            setFilterVals(prev => [prev[0], prev[0] || new Date()]);
        } else {
            setFilterVals(prev => [prev[0]]);
        }
    }, [dateFilterType]);

    useEffect(() => {
        if (type === 'integer' || type === 'bigint') {
            setFilterVals([0]);
        }
        else if (type === 'text') {
            setFilterVals(['']);
        }
        else if (type === 'date') {
            setFilterVals([new Date()]);
        }
    }, [type]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            }
            if (e.key === "Enter") {
                applyFilter();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [filterVals]);

    function applyFilter() {
        if (type === 'text') setFilterType(filtType);
        else if (type === 'integer' || type === 'bigint') setFilterType(numberFilterType);
        else if (type === 'date') setFilterType(dateFilterType);
        setFilterIsCaseSensitive(isCaseSensitive);
        setFilterValues(filterVals);
        setIsModalOpen(false);
    }

    return (
        <div className="modal" onClick={() => setIsModalOpen(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <span className='header'>Фильтрация по столбцу "{column}"</span>
                
                {type === 'text' && (
                    <div className="filter-options">
                        <select 
                            value={filtType} 
                            onChange={(e) => setFiltType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="none">Выберите тип фильтра</option>
                            <option value="equals">Равняется</option>
                            <option value="contains">Содержит</option>
                            <option value="startsWith">Начинается с</option>
                            <option value="endsWith">Заканчивается на</option>
                        </select>
                        
                        <div className="case-sensitive">
                            <input 
                                type="checkbox" 
                                id="caseSensitive" 
                                checked={isCaseSensitive}
                                onChange={(e) => setIsCaseSensitive(e.target.checked)}
                            />
                            <label htmlFor="caseSensitive">Учитывать регистр</label>
                        </div>

                        <input 
                            type="text" 
                            placeholder='Введите значение' 
                            className="filter-input"
                            value={filterVals[0]}
                            onChange={(e) => setFilterVals(prev => {
                                const newFilterVals = [...prev];
                                newFilterVals[0] = e.target.value;
                                return newFilterVals;
                            })}
                        />
                    </div>
                )}

                {(type === 'integer' || type === 'bigint') && (
                    <div className="filter-options">
                        <select 
                            value={numberFilterType} 
                            onChange={(e) => setNumberFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="none">Выберите тип фильтра</option>
                            <option value="equals">Равняется</option>
                            <option value="notEquals">Не равняется</option>
                            <option value="greater">Больше</option>
                            <option value="greaterOrEqual">Больше или равно</option>
                            <option value="lessOrEqual">Меньше или равно</option>
                            <option value="inRange">Входит в диапазон</option>
                            <option value="notInRange">Не входит в диапазон</option>
                        </select>
                        <input 
                            type="number" 
                            placeholder='Введите значение' 
                            className="filter-input"
                            value={filterVals[0]}
                            onChange={(e) => setFilterVals(prev => {
                                const newFilterVals = [...prev];
                                newFilterVals[0] = e.target.value;
                                return newFilterVals;
                            })}
                        />
                        {(numberFilterType === 'inRange' || numberFilterType === 'notInRange') && filterVals.length > 1 && (
                            <input 
                                type="number" 
                                placeholder='Введите значение' 
                                className="filter-input"
                                value={filterVals[1]}
                                onChange={(e) => setFilterVals(prev => {
                                    const newFilterVals = [...prev];
                                    newFilterVals[1] = e.target.value;
                                    return newFilterVals;
                                })}
                            />
                        )}
                    </div>
                )}

                {type === 'date' && (
                    <div className="filter-options">
                        <select 
                            value={dateFilterType} 
                            onChange={(e) => setDateFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="none">Выберите тип фильтра</option>
                            <option value="equals">Равняется</option>
                            <option value="notEquals">Не равняется</option>
                            <option value="greater">Больше</option>
                            <option value="greaterOrEqual">Больше или равно</option>
                            <option value="lessOrEqual">Меньше или равно</option>
                            <option value="inRange">Входит в диапазон</option>
                            <option value="notInRange">Не входит в диапазон</option>
                        </select>
                        <input 
                            type="date" 
                            className="filter-input"
                            value={filterVals[0].toISOString().split('T')[0]}
                            onChange={(e) => setFilterVals(prev => {
                                const newFilterVals = [...prev];
                                newFilterVals[0] = new Date(e.target.value);
                                return newFilterVals;
                            })}
                        />
                        {(dateFilterType === 'inRange' || dateFilterType === 'notInRange') && filterVals.length > 1 && (
                            <input 
                                type="date" 
                                className="filter-input"
                                value={filterVals[1].toISOString().split('T')[0]}
                                onChange={(e) => setFilterVals(prev => {
                                    const newFilterVals = [...prev];
                                    newFilterVals[1] = new Date(e.target.value);
                                    return newFilterVals;
                                })}
                            />
                        )}
                    </div>
                )}

                <button className='apply-filter' onClick={applyFilter}>Применить</button>
            </div>
        </div>
    );
} 