import './CSS/App.css';
import './CSS/table.css';
import './CSS/panelChoosing.css';
import './CSS/tableSpace.css';
import { useEffect, useState } from 'react';
import { GroupTables } from './GroupTables';
import { getTable, getColumnNames } from './database';
import { Table } from './Table';
import { Tables, TableState, EditingRows } from './types';

export const names = ['applications', 'categories', 'categoriesInLicenses', 'exams', 'journalIssues', 'licenses', 'medicCert', 'owners', 'revocations', 'suspensions']

function App() {
  const [currentTable, setCurrentTable] = useState('owners');
  const [isLoading, setIsLoading] = useState(true);
  const [tableStates, setTableStates] = useState<Tables>({});

  useEffect(() => {
    async function getAndSetTables() {
      const promises = names.map(async (x) => {
        let content = await getTable(x);
        let headersEn = await getColumnNames(x);
        let newRowVals = headersEn?.reduce((acc, header, index) => {
          if (index !== 0) acc[header] = "";
          return acc;
        }, {} as { [key: string]: string });
        let edRows: EditingRows = content?.reduce((acc, x) => {
          acc[x['id']] = false;
          return acc;
        }, {} as EditingRows);
        return { [x]: { name: x, headersEn: headersEn || [], source: content || [], newRowValues: newRowVals || {}, editingRows: edRows || {} } as TableState };
      });
      const tablesM = await Promise.all(promises);
      const result = tablesM.reduce((acc, tableObj) => ({ ...acc, ...tableObj }), {});
      setTableStates(result);
      setIsLoading(false);
    }
    getAndSetTables();
  }, []);

  function ChangeCurrentTable(name: string) {
    setCurrentTable(name);
  }

  function saveTableState(tableName: string, newState: TableState) {
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
