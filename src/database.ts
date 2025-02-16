import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getColumnNames(tableName: string): Promise<string[] | null> {
    try {
        const { data, error } = await supabase.rpc('get_column_names', {
            target_table_name: tableName,
        });
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Ошибка при получении названий столбцов:', error);
        return null;
    }
}

export async function getTable(nameTable: string) {
    const { data, error } = await supabase.from(nameTable).select("*");
    if (error) {
        console.error('Ошибка при получении данных из таблицы ' + nameTable + ": " + error);
        return null;
    }
    return data
}

export async function addRecord(nameTable: string, row: any) {
    const { data, error } = await supabase.from(nameTable).insert(row).select('id');
    if (error) {
        console.error('Ошибка при добавлении данных в таблицу ' + nameTable + ": " + error);
        return null;
    }
    else return data;
}

export async function saveRecord(nameTable: string, row: any) {
    const { error } = await supabase.from(nameTable).update(row).eq('id', row['id']);
    if (error) {
        console.error('Ошибка при изменении данных таблицы ' + nameTable + ": " + error);
        return null;
    }
}

export async function deleteRecordById(nameTable: string, id: number) {
    const { error } = await supabase.from(nameTable).delete().eq('id', id);
    if (error) {
        console.error('Ошибка при удалени строки с id ' + id + ' из таблицы ' + nameTable + ": " + error);
        return null;
    }
}