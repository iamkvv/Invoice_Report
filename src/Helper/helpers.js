import React, { Component } from 'react'
import { Tooltip as ATooltip } from 'antd';
import moment from 'moment'
import sumBy from 'lodash/sumBy'

//столбцы для корневой таблицы  счетов
export const rootTableColumns = [
    { title: 'Период', dataIndex: 'period', key: 'period', className: 'root-col-title' },
    { title: 'Оплачено', dataIndex: "payed", key: "payed", className: 'root-col-title' },
    { title: 'Не оплачено', dataIndex: "nopayed", key: "nopayed", className: 'root-col-title' },
    { title: 'Дельта', dataIndex: "deltasum", key: "не оплачено ₽", className: 'root-col-title' },
    { title: 'Кол-во', dataIndex: "invcount", key: "invcount", className: 'root-col-title' }
]

//столбцы для вложенных таблиц счетов
export const nestedTablesColumns = [
    {
        title: "ID", dataIndex: "ID",
        render: text => (
            <ATooltip title='Открыть в портале B24'>
                <a href={"https://its74.bitrix24.ru/crm/invoice/show/" + text + "/"} target="_blank">
                    {text}</a>
            </ATooltip>
        )
    },
    {
        title: "№", dataIndex: "ACCOUNT_NUMBER", key: "ACCOUNT_NUMBER"
    },
    {
        title: "Дата", dataIndex: "DATE_BILL", key: "DATE_BILL"
    },
    {
        title: "Сумма", dataIndex: "PRICE", key: "PRICE"
    },
    {
        title: "Компания", dataIndex: "COMPANY", key: "COMPANY"
    },

    {
        title: "Статус",
        dataIndex: "STATUS",
        key: "STATUS",
        render: (s) => (invoiceStatus(s)),
        filters: [{
            text: 'отклонен',
            value: 'D',
        },
        {
            text: 'оплачен',
            value: 'P',
        },
        {
            text: 'подтвержден',
            value: 'A',
        },
        {
            text: 'частично',
            value: 'Q',
        },
        {
            text: 'отправлен',
            value: 'S',
        },
        {
            text: 'черновик',
            value: 'N',
        }],
        onFilter: (value, record) => {
            return record.STATUS === value
        },
    },
    {
        title: "Оплата", dataIndex: "DATE_PAYED", key: "DATE_PAYED"
    },
    {
        title: "Срок", dataIndex: "DATE_DIFF", key: "DATE_DIFF"
    }
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

export const dateDiff = (dateBill, datePayed) => (
    datePayed ? moment(datePayed).diff(moment(dateBill), 'days') : ''
)

export const dateRU = (d) => {
    const dateOptions = {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
    }
    return d ? new Date(d).toLocaleString("ru", dateOptions) : ''
}

/**
 * ищет компанию и возвращает ее TITLE
 * @param {*} compArr 
 * @param {*} compID 
 */
export const getCompanyTitle = (compArr, compID) => {
    let comp = compArr.filter((cmp) => cmp.ID === compID)
    if (comp.length === 1)
        return comp[0].TITLE
    else
        return "?"
}

/**
 * возвращает сумму оплаченных или неоплаченных счетов
 * @param {*} data 
 * @param {*} status 
 */
export const sumInvoicesByStatus = (data, status) => {
    let sum = sumBy(data, (obj) => {
        if (obj.PAYED === status)
            return parseFloat(obj.PRICE)
    })
    return isNaN(sum) ? 0 : sum;
}


export const invoiceStatus = (s) => {
    switch (s) {
        case "P":
            return "опл"//(<Badge status="success" text="опл" />)
            break;
        case "A":
            return "подтв" //(<Badge status="processing" text="подтв" />)
            break;
        case "D":
            return "откл"// (<Badge status="warning" text="откл" />)
            break;
        case "Q":
            return "част"//(<Badge status="default" text="част" />)
            break;
        case "N":
            return "черн" //(<Badge status="error" text="черн" />)
            break;
        case "S":
            return "отпр"// (<Badge status="processing" text="отпр" />)
            break;

        default:
            return s
    }
}

