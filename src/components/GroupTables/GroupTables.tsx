import React from 'react';
import './GroupTables.css';

interface GroupTablesProps {
    names: string[];
    namesEn: string[];
    changeNameMethod: (name: string) => void;
    title: string;
    currentTable: string;
}

export const GroupTables: React.FC<GroupTablesProps> = ({ names, namesEn, changeNameMethod, title, currentTable }) => {
    return (
        <div className='group-table'>
            <span className='group-table-title'>{title}</span>
            {names.map((x, i) => (
                <button
                    key={i}
                    onClick={() => changeNameMethod(namesEn[i])}
                    className={currentTable === namesEn[i] ? 'active' : ''}
                >
                    {x}
                </button>
            ))}
        </div>
    );
} 