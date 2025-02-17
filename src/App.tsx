import './CSS/App.css';
import './CSS/table.css';
import './CSS/panelChoosing.css';
import './CSS/tableSpace.css';
import { useEffect, useState } from 'react';
import { GroupTables } from './GroupTables';
import { getTable, getColumnNames } from './database';
import { Table } from './Table';

export const names = ['applications', 'categories', 'categoriesInLicenses', 'exams', 'journalIssues', 'licenses', 'medicCert', 'owners', 'revocations', 'suspensions']
export type fullTable = {
  name: string;
  headersEn: string[];
  source: any[];
};

function App() {
  const [currentTable, setCurrentTable] = useState('applications');
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<fullTable[]>([]);
  const [tableStates, setTableStates] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    async function getAndSetTables() {
      const promises = names.map(async (x) => {
        let content = await getTable(x);
        let headersEn = await getColumnNames(x);
        return { name: x, headersEn: headersEn || [], source: content || [], newRowValues: {} };
      });
      const tablesM = await Promise.all(promises);
      setTables(tablesM);
      setIsLoading(false);
    }
    getAndSetTables();
  }, []);


  function ChangeCurrentTable(name: string) {
    setCurrentTable(name);
  }

  function saveTableState(tableName: string, newState: any) {
    setTableStates((prevState) => ({
      ...prevState,
      [tableName]: newState
    }));
  }

  return (
    <div>
      <div className='panel-for-choosing'>
        <GroupTables
          names={['Владельцы', 'Категории']}
          namesEn={['owners', 'categories']}
          changeNameMethod={ChangeCurrentTable}
        />
        <GroupTables
          names={['Заявки', 'Экзамены']}
          namesEn={['applications', 'exams']}
          changeNameMethod={ChangeCurrentTable}
        />
        <GroupTables
          names={[
            'Водительские удостоверения',
            'Медицинские справки',
            'Категории в водительских удостоверениях',
            'История выдачи водительских удостоверений',
            'История аннуляции водительских удостоверений',
            'История приостановки водительских удостоверений'
          ]}
          namesEn={['licenses', 'medicCert', 'categoriesInLicenses', 'journalIssues', 'revocations', 'suspensions']}
          changeNameMethod={ChangeCurrentTable} />
      </div>
      <div className='table-space'>
        {isLoading ? (
          <p>Загрузка данных...</p>
        ) : (
          names.map((x, i) => (
            x == currentTable && (
              <Table
                key={i}
                table={tables[i]}
                tableState={tableStates[x]}
                saveTableState={saveTableState}
              />
            )
          ))
        )}
      </div>
    </div>
  );
}

export default App;
