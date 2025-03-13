import React from 'react';

interface TextFilterProps {
    filtType: string;
    setFiltType: (value: string) => void;
    filterVals: any[];
    setFilterVals: (callback: (prev: any[]) => any[]) => void;
    isCaseSensitive: boolean;
    setIsCaseSensitive: (value: boolean) => void;
}

export const TextFilter: React.FC<TextFilterProps> = ({
    filtType,
    setFiltType,
    filterVals,
    setFilterVals,
    isCaseSensitive,
    setIsCaseSensitive
}) => {
    return (
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

            <div className="filter-input-container">
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

            <div className="case-sensitive">
                <input 
                    type="checkbox" 
                    id="caseSensitive" 
                    checked={isCaseSensitive}
                    onChange={(e) => setIsCaseSensitive(e.target.checked)}
                />
                <label htmlFor="caseSensitive">Учитывать регистр</label>
            </div>
        </div>
    );
} 