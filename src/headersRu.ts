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
        headers: ['ID', 'ID заявки', 'Дата экзамена', 'Результат экзамена']
    },
    {
        name: 'journalIssues',
        headers: ['ID', 'ID удостоверения', 'Владелец', 'Дата выдачи']
    },
    {
        name: 'licenses',
        headers: ['ID', 'Дата выдачи', 'Дата окончания срока действия', 'Место выдачи', 'Серия', 'Номер', 'Статус']
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