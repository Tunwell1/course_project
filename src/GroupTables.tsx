type GroupTablesProps = {
    names: string[];
    namesEn: string[];
    changeNameMethod: (name: string) => void 
}

export const GroupTables : React.FC<GroupTablesProps> = ({names, namesEn, changeNameMethod}) => {
    return (
        <div className="group-table">
            {names.map((x,i) => (
                <button key={i} onClick={() => changeNameMethod(namesEn[i])}>{x}</button>
            ))}
        </div>
    )
}