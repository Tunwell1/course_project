import { useEffect, useState } from 'react';
import { ModalFilterProps } from '../../types';
import { TextFilter } from './TextFilter';
import { NumberFilter } from './NumberFilter';
import { DateFilter } from './DateFilter';
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
    const [filtType, setFiltType] = useState('equals');
    const [numberFilterType, setNumberFilterType] = useState('equals');
    const [dateFilterType, setDateFilterType] = useState('equals');
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
                    <TextFilter
                        filtType={filtType}
                        setFiltType={setFiltType}
                        filterVals={filterVals}
                        setFilterVals={setFilterVals}
                        isCaseSensitive={isCaseSensitive}
                        setIsCaseSensitive={setIsCaseSensitive}
                    />
                )}

                {(type === 'integer' || type === 'bigint') && (
                    <NumberFilter
                        numberFilterType={numberFilterType}
                        setNumberFilterType={setNumberFilterType}
                        filterVals={filterVals}
                        setFilterVals={setFilterVals}
                    />
                )}

                {type === 'date' && (
                    <DateFilter
                        dateFilterType={dateFilterType}
                        setDateFilterType={setDateFilterType}
                        filterVals={filterVals}
                        setFilterVals={setFilterVals}
                    />
                )}

                <button className='apply-filter' onClick={applyFilter}>Применить</button>
            </div>
        </div>
    );
} 