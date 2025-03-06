import React from 'react';

interface DateFilterProps {
    dateFilterType: string;
    setDateFilterType: (value: string) => void;
    filterVals: Date[];
    setFilterVals: (callback: (prev: any[]) => any[]) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
    dateFilterType,
    setDateFilterType,
    filterVals,
    setFilterVals
}) => {
    return (
        <div className='filter-options'>
            <select 
                value={dateFilterType} 
                onChange={(e) => setDateFilterType(e.target.value)} 
                className='filter-select'
            >
                <option value="none">Выберите тип фильтра</option>
                <option value="equals">Равняется</option>
                <option value="notEquals">Не равняется</option>
                <option value="greater">Больше</option>
                <option value="greaterOrEqual">Больше или равно</option>
                <option value="less">Меньше</option>
                <option value="lessOrEqual">Меньше или равно</option>
                <option value="inRange">Входит в диапазон</option>
                <option value="notInRange">Не входит в диапазон</option>
            </select>

            <div className="filter-input-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <input
                        type="date"
                        value={filterVals[0].toISOString().split('T')[0]}
                        onChange={(e) => setFilterVals(prev => {
                            const newFilterVals = [...prev];
                            newFilterVals[0] = new Date(e.target.value);
                            return newFilterVals;
                        })}
                        placeholder='Введите значение даты' 
                    />
                </div>
                {(dateFilterType === 'inRange' || dateFilterType === 'notInRange') && filterVals.length > 1 && (
                    <div>
                        <input
                            type="date"
                            value={filterVals[1].toISOString().split('T')[0]}
                            onChange={(e) => setFilterVals(prev => {
                                const newFilterVals = [...prev];
                                newFilterVals[1] = new Date(e.target.value);
                                return newFilterVals;
                            })}
                            placeholder='Введите значение даты' 
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 