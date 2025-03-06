import React from 'react';

interface NumberFilterProps {
    numberFilterType: string;
    setNumberFilterType: (value: string) => void;
    filterVals: any[];
    setFilterVals: (callback: (prev: any[]) => any[]) => void;
}

export const NumberFilter: React.FC<NumberFilterProps> = ({
    numberFilterType,
    setNumberFilterType,
    filterVals,
    setFilterVals
}) => {
    return (
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
            <div className="filter-input-container">
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
        </div>
    );
} 