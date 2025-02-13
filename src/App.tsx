import './CSS/App.css';
import './CSS/table.css';
import './CSS/panelChoosing.css';
import './CSS/tableSpace.css';
import { Table } from './Table';
import { useEffect, useState } from 'react';
import { getTable } from './database';

export type tabl = {
  name: string;
  source: any[];
};

function App() {
  const [currentTable, setCurrentTable] = useState('storage');
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<tabl[]>();

  useEffect(() => {
    async function getAndSetTables() {
      let storage = await getTable('storage') as [];
      let staff = await getTable('staff') as [];
      setTables([{ name: 'storage', source: storage }, { name: 'staff', source: staff}]);
      setIsLoading(false);
    }
    getAndSetTables();
  }, [])

  function ChangeCurrentTable(name: string){
    setCurrentTable(name);
  }

  return (
    <div>
      <div className='panel-for-choosing'>
        <button onClick={() => ChangeCurrentTable('storage')}>
          Таблица склада
        </button>
        <button onClick={() => ChangeCurrentTable('staff')}>
          Таблица сотрудников
        </button>
      </div>
      <div className='table-space'>
        {isLoading ? (
          <p>Загрузка данных...</p>
        ) : (
          <>
            <Table
              source={tables?.find(x => x.name == currentTable)?.source || []}
              nameTable={currentTable}
              headers={['ID', 'ID категории', 'Имя', 'Описание', 'Ед изм', 'Количество']}
              headersEn={['id', 'id_category', 'name', 'description', 'unit_measurment', 'count']}
              widthCols={[0, 20, 20, 50, 10, 10]}
              types={['number', 'number', 'text', 'text', 'text', 'number']}
            />
            <Table
              source={tables?.find(x => x.name == currentTable)?.source || []}
              nameTable={currentTable}
              headers={['ID', 'Имя', 'Фамилия', 'Отчество', 'Должность']}
              headersEn={['id', 'name', 'surname', 'father_name', 'post']}
              widthCols={[20, 100, 100, 100, 100]}
              types={['number', 'text', 'text', 'text', 'text']}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
