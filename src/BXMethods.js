import axios from 'axios';
import moment from 'moment'

import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
//import filter from 'lodash/filter'

import { monthRome, dateRU, dateDiff, getCompanyTitle, sumInvoicesByStatus } from './Helper/helpers'

export const resizeWindow = (w, h) => {
    BX24.resizeWindow(w, h,
        (e) => {
            console.log('resize e - this ', e, this)
        })
}

let arr = []; // массив для возврата полученных счетов
let companiesArr = [];

export const clearInvArray = () => {
    arr.length = 0;
}

export const clearCompArray = () => {
    companiesArr.length = 0;
}




/**
 * Возвращает счета по диапазону дат
 * @param {*} startpos 
 * @param {*} startdate 
 * @param {*} enddate 
 */
export const getInvoicesByPeriod = (startpos, startdate, enddate, token) => {
    //let tkn = BX24.getAuth(); //вынести из функции
    let addr = 'https://its74.bitrix24.ru/rest/crm.invoice.list.json'
    let req = `${addr}?auth=${token}${startpos ? '&start=' + startpos : ''}&FILTER[>DATE_BILL]=${startdate}&FILTER[<DATE_BILL]=${enddate}&timestamp=${new Date().getTime()}`

    return axios.get(req)
        .then(response => {
            if (response.data.next) {
                arr = arr.concat(response.data.result)
                return getInvoicesByPeriod(response.data.next, startdate, enddate, token)
            } else {
                arr = arr.concat(response.data.result)

                let datas = Object.assign({}, {
                    graphicData: createGraphicData(arr),
                    sourceData: arr// возвращаем исходные данные по счетам, чтобы потом создать данные для таблиц   createTableData(arr)
                })
                //не забыть про arr!! УБРАТЬ!!
                return datas
            }
        })
        .catch(err => {
            console.log(err)
        })
}


/**
 * Возвращает все компании
 * @param {*} token 
 * @param {*} startpos 
 */
const getAllCompanies = (token, startpos) => {
    let addr = 'https://its74.bitrix24.ru/rest/crm.company.list.json';
    let req = `${addr}?auth=${token}${startpos ? '&start=' + startpos : ''}&SELECT[]=ID&SELECT[]=TITLE`;

    return axios.get(req)
        .then(response => {
            if (response.data.next) {
                companiesArr = companiesArr.concat(response.data.result)
                return getAllCompanies(token, response.data.next)
            } else {
                companiesArr = companiesArr.concat(response.data.result)
                return companiesArr
            }
        })
        .catch(err => {
            console.log(err)
        })
}

/**
 * строит данные для графика
 * @param {*} invarr 
 */
const createGraphicData = (invarr) => {
    let graphicData = [];

    let groupedInvoices = groupBy(invarr, function (inv) {
        return moment(inv['DATE_BILL'], 'YYYY-MM-DD').startOf('month');
    });

    for (let prop in groupedInvoices) {
        graphicData.push(Object.assign({}, {
            period: new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
            //есть: filter(groupedInvoices[prop], { PAYED: 'Y' }).length,
            // нет: filter(groupedInvoices[prop], { PAYED: 'N' }).length,

            "оплачено ₽": sumBy(groupedInvoices[prop], (obj) => {
                if (obj.PAYED === "Y")
                    return parseFloat(obj.PRICE)
            }),

            "не оплачено ₽": sumBy(groupedInvoices[prop], (obj) => {
                if (obj.PAYED === "N")
                    return parseFloat(obj.PRICE)
            })
        }))
    }
    return graphicData
}

/**
 * строит данные для родительской и вложенных таблиц
 * @param {*} token 
 * @param {*} invoices 
 */
export const buildTablesData = (token, invoices) => {
    return getAllCompanies(token, null)
        .then(response => {
            return createTablesData(response, invoices)  //вернем объект с данными для всех таблиц
        })
}

/**
 * создает данные для родительской таблицы и вложенных таблиц
 */
const createTablesData = (compArr, invArr) => {
    let rootTableData = [];
    let nestedTablesData = [];

    let groupedInvoices = groupBy(invArr, function (inv) {
        return moment(inv['DATE_BILL'], 'YYYY-MM-DD').startOf('month');
    });

    //строим массив для родительской таблицы
    for (let prop in groupedInvoices) {

        let opl = sumInvoicesByStatus(groupedInvoices[prop], "Y");
        let nopl = sumInvoicesByStatus(groupedInvoices[prop], "N");
        let key_period = new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth());

        rootTableData.push(Object.assign({}, {
            key: key_period,
            period: key_period,

            payed: opl + " ₽",
            nopayed: nopl + " ₽",
            deltasum: (opl - nopl) + " ₽",
            invcount: groupedInvoices[prop].length
        }))
    }

    ////строим массив для вложенных таблиц, где каждый счет будет помечен признаком периода
    for (let prop in groupedInvoices) {
        for (let i = 0; i < groupedInvoices[prop].length; i++) {
            nestedTablesData.push(
                Object.assign({}, {
                    key: new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
                    ID: groupedInvoices[prop][i].ID,
                    ACCOUNT_NUMBER: groupedInvoices[prop][i].ACCOUNT_NUMBER,
                    DATE_BILL: dateRU(groupedInvoices[prop][i].DATE_BILL),
                    PRICE: groupedInvoices[prop][i].PRICE,
                    COMPANY: getCompanyTitle(compArr, groupedInvoices[prop][i].UF_COMPANY_ID),
                    STATUS: groupedInvoices[prop][i].STATUS_ID,
                    DATE_PAYED: dateRU(groupedInvoices[prop][i].DATE_PAYED),
                    DATE_DIFF: dateDiff(groupedInvoices[prop][i].DATE_BILL, groupedInvoices[prop][i].DATE_PAYED)
                })
            )
        }
    }

    return ({ roottabledata: rootTableData, nestedtablesdata: nestedTablesData })
}


// export const getCompany = (id, rec) => {
//     let tkn = BX24.getAuth();
//     let addr = 'https://its74.bitrix24.ru/rest/crm.company.get.json';
//     let req = `${addr}?auth=${tkn.access_token}&id=${id}`;

//     return axios.get(req)
//         .then(response => {
//             rec['COMPANY_NAME'] = response.data.result.TITLE
//             //return response.data.result.TITLE;
//         }
//         ).catch(err => {
//             console.log("COMPANY-ERR", err)
//         })
// }


export const sendToLenta = (mess) => {
    let tkn = BX24.getAuth();
    axios.post('https://its74.bitrix24.ru/rest/log.blogpost.add', {
        auth: tkn.access_token,
        POST_TITLE: "It's just test",
        POST_MESSAGE: mess
    })
        .then(function (response) {
            console.log('отправлено')
        })
        .catch(function (error) {
            console.log('Correct fields ', error);
        });
}


///=========================================///

export const getCurrentUser = () => {
    if (window.BX24) {
        return new Promise((resolve, reject) => {
            window.BX24.callMethod(
                'user.current',
                {},
                function (result) {
                    if (!result.error()) {
                        resolve(result)
                    } else {
                        reject(result)
                    }
                }
            )
        }
        )
    } else {
        return null
    }
}

export const getUserDepart = (id) => {
    BX24.callBatch({
        get_user: ['user.get', {
            "filter": { "ID": id },
            "select": ["ID", "NAME", "LAST_NAME", "UF_DEPARTMENT"]
        }],
        get_department: {
            method: 'department.get',
            params: {
                ID: "$result[get_user][0][UF_DEPARTMENT]"
            }
        }
    }, function (result) {
        console.log('getUserDepart -- ', result)

        var l = result.get_department.data().length;
        var d = result.get_department.data()[0].NAME;
        var str = 'Текущий пользователь ' + result.get_user.data()[0].NAME + ' ' + result.get_user.data()[0].LAST_NAME + ' приписан к подразделени' + (l > 1 ? 'ям ' : 'ю ');

        debugger;

        for (var i = 0; i < l; i++) {
            str += i == 0 ? '' : ', ';
            str += result.get_department.data()[i].NAME;
        }

        alert(str);
    });

}