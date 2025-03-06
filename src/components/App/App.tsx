import './App.css';
import '../GroupTables/GroupTables.css';
import '../Table/Table.css';
import { useEffect, useState } from 'react';
import { GroupTables } from '../GroupTables/GroupTables';
import { getTable, getColumnNames, getColumnTypes } from '../../database';
import { Table } from '../Table/Table';
import { Tables, TableState, EditingRows } from '../../types';

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
        let types = await getColumnTypes(x);
        let newRowVals = headersEn?.reduce((acc, header, index) => {
          if (index !== 0) acc[header] = "";
          return acc;
        }, {} as { [key: string]: string });
        let edRows: EditingRows = content?.reduce((acc, x) => {
          acc[x['id']] = false;
          return acc;
        }, {} as EditingRows);
        return { [x]: { name: x, headersEn: headersEn || [], types: types || [], source: content || [], newRowValues: newRowVals || {}, editingRows: edRows || {}, editingSource: content } as TableState };
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
    <div className='container'>
      <div className='header'>
        <span>Система управления водительскими удостоверениями</span>
      </div>
      <div className='main-content'>
        <div className='panel-for-choosing'>
          <GroupTables
            names={['Владельцы', 'Категории']}
            namesEn={['owners', 'categories']}
            changeNameMethod={ChangeCurrentTable}
            title="Постоянные данные"
            currentTable={currentTable}
          />
          <GroupTables
            names={['Заявки', 'Экзамены']}
            namesEn={['applications', 'exams']}
            changeNameMethod={ChangeCurrentTable}
            title="Процессы"
            currentTable={currentTable}
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
            changeNameMethod={ChangeCurrentTable}
            title="Документы"
            currentTable={currentTable}
          />
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
    </div>
  );
}

export default App; 