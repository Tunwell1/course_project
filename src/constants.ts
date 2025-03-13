export const headersRu = [
    {
        name: 'applications',
        headers: ['ID', 'Владелец', 'Категория', 'Дата подачи заявки', 'Тип заявки', 'Статус заявки']
    },
    {
        name: 'categories',
        headers: ['ID', 'Обозначение', 'Название', 'Описание категории']
    },
    {
        name: 'categoriesInLicenses',
        headers: ['ID', 'ID удостоверения', 'Категория', 'Дата начала действия категории', 'Дата окончания действия категории', 'Ограничения']
    },
    {
        name: 'exams',
        headers: ['ID', 'ID заявки', 'Дата экзамена', 'Результат ', 'Тип']
    },
    {
        name: 'journalIssues',
        headers: ['ID', 'ID удостоверения', 'Владелец', 'ID заявки', 'Дата выдачи']
    },
    {
        name: 'licenses',
        headers: ['ID', 'Дата окончания срока действия', 'Место выдачи', 'Серия', 'Номер', 'Статус']
    },
    {
        name: 'medicCert',
        headers: ['ID', 'Владелец', 'Дата выдачи', 'Дата окончания действия', 'Особые пометки']
    },
    {
        name: 'owners',
        headers: ['ID', 'Фамилия', 'Имя', 'Отчество', 'Место жительства', 'Дата рождения']
    },
    {
        name: 'revocations',
        headers: ['ID', 'ID удостоверения', 'Дата аннуляции', 'Причина аннуляции']
    },
    {
        name: 'suspensions',
        headers: ['ID', 'ID удостоверения', 'Дата приостановления', 'Дата окончания приостановления', 'Причина приостановления']
    },
]

export const names = ['applications', 'categories', 'categoriesInLicenses', 'exams', 'journalIssues', 'licenses', 'medicCert', 'owners', 'revocations', 'suspensions']

export const fk = [
    {
        nameTable: 'exams',
        fkS: ['idApplication'],
        tablesPK: ['applications'],
        visCols: [['dateIssue','type','state']]
    },
    {
        nameTable: 'applications',
        fkS: ['idOwner', 'idCategory'],
        tablesPK: ['owners', 'categories'],
        visCols: [['surname', 'name', 'fatherName'], ['obozn', 'name']]
    },
    {
        nameTable: 'categoriesInLicenses',
        fkS: ['idLicense', 'idCategory'],
        tablesPK: ['licenses', 'categories'],
        visCols: [['placeIssue', 'serial', 'number'], ['obozn', 'name']]
    },
    {
        nameTable: 'journalIssues',
        fkS: ['idLicense', 'idApplication', 'idOwner'],
        tablesPK: ['licenses', 'applications', 'owners'],
        visCols: [['placeIssue', 'serial', 'number'], ['dateIssue','type','state'], ['surname', 'name', 'fatherName']]
    },
    {
        nameTable: 'medicCert',
        fkS: ['idOwner'],
        tablesPK: ['owners'],
        visCols: [['surname', 'name', 'fatherName']]
    },
    {
        nameTable: 'revocations',
        fkS: ['idLicense'],
        tablesPK: ['licenses'],
        visCols: [['placeIssue', 'serial', 'number']]
    },
    {
        nameTable: 'suspensions',
        fkS: ['idLicense'],
        tablesPK: ['licenses'],
        visCols: [['placeIssue', 'serial', 'number']]
    }
    
]

export const comboboxes = [
    {
        nameTable: 'applications',
        columns: ['type','state'],
        comboboxes: [['Получение', 'Замена'],['Открыта', 'В процессе', 'Закрыта']]
    },
    {
        nameTable: 'exams',
        columns: ['type', 'state'],
        comboboxes: [['Практика', 'Теория'],['Сдано', 'Не сдано']]
    },
    {
        nameTable: 'licenses',
        columns: ['state'],
        comboboxes: [['Действительно', 'Недействительно']]
    }
]

export const defaultSelections = [
    {
        nameTable: 'applications',
        columns: ['state'],
        defaultSelections: [['Закрыта', 'В процессе', 'Открыта']]
    },
    {
        nameTable: 'exams',
        columns: ['state'],
        defaultSelections: [['Сдано', 'Не сдано']]
    },
    {
        nameTable: 'licenses',
        columns: ['state'],
        defaultSelections: [['Действительно', 'Недействительно']]
    }
]

export const subordinateTables = [
    {
        nameTable: 'owners',
        subordinateTables: ['licenses', 'applications'],
        ru: ['Удостоверения', 'Заявки'],
        isHaveFK: [false, true],
        howToTable: ['journalIssues',''],
        idToFK: 'idOwner',
        idToOsn: ['idLicense']
    },
    {
        nameTable: 'licenses',
        subordinateTables: ['categoriesInLicenses', 'journalIssues', 'revocations', 'suspensions'],
        ru: ['Категории в удостоверениях', 'Журнал выдач', 'Аннулирования', 'Приостановления'],
        isHaveFK: [true,true,true,true],
        idToFK: 'idLicense'
    },
    {
        nameTable: 'applications',
        subordinateTables: ['exams'],
        ru: ['Экзамены'],
        isHaveFK: [true],
        idToFK: 'idApplication'
    }
]