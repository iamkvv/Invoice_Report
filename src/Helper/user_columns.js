import React, { Component } from 'react'

//столбцы для корневой таблицы по анализу счетов
export const rootTableColumns = [
    { title: 'Период', dataIndex: 'period', key: 'period', className: 'root-col-title' },
    { title: 'Оплачено ₽', dataIndex: "оплачено ₽", key: "оплачено ₽", className: 'root-col-title' },
    { title: 'Не оплачено ₽', dataIndex: "не оплачено ₽", key: "не оплачено ₽", className: 'root-col-title' },
    { title: 'Оплачено - не оплачено ₽', dataIndex: "deltasum", key: "не оплачено ₽", className: 'root-col-title' },
    { title: 'Всего счетов', dataIndex: "invcount", key: "invcount", className: 'root-col-title' }
]




//структура столбцов для таблицы пользователей в отчете по Activities
const columns = [
    {
        title: 'ID',
        dataIndex: 'ID',
        key: 'ID'
    },
    {
        title: 'Имя, Фамилия ',
        dataIndex: 'FIO',
        key: 'FIO',
        render: fio => (
            <span style={{ color: 'blue', cursor: 'pointer' }}>{fio}</span>
        )
    },
    {
        title: 'Должность',
        dataIndex: 'WORK_POSITION',
        key: 'WORK_POSITION'
    }
]

//export default columns