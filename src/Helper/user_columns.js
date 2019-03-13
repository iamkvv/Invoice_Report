import React, { Component } from 'react'

//столбцы для корневой таблицы по анализу счетов
export const rootTableColumns = [
    { title: 'Период', dataIndex: 'period', key: 'period', className: 'root-col-title' },
    { title: 'Оплачено ₽', dataIndex: "оплачено ₽", key: "оплачено ₽", className: 'root-col-title' },
    { title: 'Не оплачено ₽', dataIndex: "не оплачено ₽", key: "не оплачено ₽", className: 'root-col-title' },
    { title: 'Оплачено - не оплачено ₽', dataIndex: "deltasum", key: "не оплачено ₽", className: 'root-col-title' },
    { title: 'Всего счетов', dataIndex: "invcount", key: "invcount", className: 'root-col-title' }
]

/**
 * Возвращает римское значение месяца
 * @param {*} mnum 
 */
export const monthRome = (mnum) => {
    switch (mnum) {
        case 0:
            return 'I'
            break;
        case 1:
            return 'II'
            break;
        case 2:
            return 'III'
            break;
        case 3:
            return 'IV'
            break;
        case 4:
            return 'V'
            break;
        case 5:
            return 'VI'
            break;
        case 6:
            return "VII"
            break;
        case 7:
            return 'VIII'
            break;
        case 8:
            return 'IX'
            break;
        case 9:
            return 'X'
            break;
        case 10:
            return 'XI'
            break;
        case 11:
            return 'XII'
            break;
        default:
            break;
    }
}



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