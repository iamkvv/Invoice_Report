import axios from 'axios';
import moment from 'moment'

import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
//import filter from 'lodash/filter'

import { monthRome, dateRU, dateDiff } from './Helper/helpers'
import { object } from 'prop-types';

export const resizeWindow = (w, h) => {
    BX24.resizeWindow(w, h,
        (e) => {
            console.log('resize e - this ', e, this)
        })
}

let arr = []; // массив для возврата полученных счетов
let companiesArr = [];

export const clearArray = () => {
    console.log('ITS OLD ARRAY!!! ', arr) //переделать!!!
    arr.length = 0;
    companiesArr.length = 0;
}

/**
 * рабочий запрос по компаниям
 *https://its74.bitrix24.ru/rest/crm.company.list.json?auth=5aff855c00376534000046e100000162201c03f4f3258ec292845af72cbdb76d6075ad
 *&filter[<ID]=120&filter[>ID]=100
 *&SELECT[]=TITLE&SELECT[]=PHONE&SELECT[]=BANKING_DETAILS
 *
 */

/**
 * Возвращает счета по диапазону дат
 * @param {*} startpos 
 * @param {*} startdate 
 * @param {*} enddate 
 */
export const getInvoicesByPeriod = (startpos, startdate, enddate) => {
    let tkn = BX24.getAuth(); //вынести из функции
    let addr = 'https://its74.bitrix24.ru/rest/crm.invoice.list.json'
    let req = `${addr}?auth=${tkn.access_token}${startpos ? '&start=' + startpos : ''}&FILTER[>DATE_BILL]=${startdate}&FILTER[<DATE_BILL]=${enddate}&timestamp=${new Date().getTime()}`

    return axios.get(req)
        .then(response => {
            if (response.data.next) {
                arr = arr.concat(response.data.result)
                return getInvoicesByPeriod(response.data.next, startdate, enddate)
            } else {
                arr = arr.concat(response.data.result)
                //return arr
                let datas = Object.assign({}, {
                    graphicData: createGraphicData(arr),
                    rootTableData: createRootTableData(arr)
                })
                //return createGraphicData(arr) //не забыть про arr!! УБРАТЬ!!
                console.log('datas??', datas)
                return datas
            }
        })
        .catch(err => {
            console.log(err)
        })
}

/**
 * создает данные для родительской таблицы
 */
const createRootTableData = (invarr) => {
    let rootTableData = [];
    let nestedTablesData = [];

    let groupedInvoices = groupBy(invarr, function (inv) {
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

            payed: opl,
            nopayed: nopl,
            deltasum: opl - nopl,
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
                    DATE_BILL: dateRU(groupedInvoices[prop][i].DATE_BILL),//  new Date(data[i].DATE_BILL).toLocaleString("ru", dataOptions),
                    PRICE: groupedInvoices[prop][i].PRICE,
                    COMPANY:'???',
                    // getCompany(groupedInvoices[prop][i].UF_COMPANY_ID).then(val => {COMPANY: val}),
                    //  this.getCompanyTitle(groupedInvoices[prop][i].UF_COMPANY_ID),   // ? this.state.companies.filter((obj) => obj.ID === data[i].UF_COMPANY_ID)[0].TITLE : '???',
                    STATUS: groupedInvoices[prop][i].STATUS_ID,
                    DATE_PAYED: dateRU(groupedInvoices[prop][i].DATE_PAYED), // data[i].DATE_PAYED ? new Date(data[i].DATE_PAYED).toLocaleString("ru", dataOptions) : '',
                    DATE_DIFF: dateDiff(groupedInvoices[prop][i].DATE_BILL, groupedInvoices[prop][i].DATE_PAYED) //     data[i].DATE_PAYED ? moment(data[i].DATE_PAYED).diff(moment(data[i].DATE_BILL), 'days') : ''
                })
            )
        }
    }

    console.log('nestedData', nestedTablesData)

    return rootTableData
}

const getCompany = (id) => {
    let tkn = BX24.getAuth();
    let addr = 'https://its74.bitrix24.ru/rest/crm.company.get.json';
    let req = `${addr}?auth=${tkn.access_token}&id=${id}`;

    return axios.get(req)
        .then(response => {
            console.log("Comp", response.data.result.TITLE)
            //return 'response.result - ' + id
            return response.data.result.TITLE
        }
        )
        .catch(err => {
            console.log("COMPANY-ERR", err)
        })
}


/**
 * создает данные для вложенных таблиц
 */
// const createNestedTablesData = (invarr) => {
//     let invs = [];

//     for (let i = 0; i < invarr.length; i++) {
//         let key_period = new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth());
//         invarr.push(
//             Object.assign({}, {
//                 key: key,
//                 ID: data[i].ID,
//                 ACCOUNT_NUMBER: data[i].ACCOUNT_NUMBER,
//                 DATE_BILL: dateRU(data[i].DATE_BILL),//  new Date(data[i].DATE_BILL).toLocaleString("ru", dataOptions),
//                 PRICE: data[i].PRICE,
//                 COMPANY: this.getCompanyTitle(data[i].UF_COMPANY_ID),   // ? this.state.companies.filter((obj) => obj.ID === data[i].UF_COMPANY_ID)[0].TITLE : '???',
//                 STATUS: data[i].STATUS_ID,
//                 DATE_PAYED: dateRU(data[i].DATE_PAYED), // data[i].DATE_PAYED ? new Date(data[i].DATE_PAYED).toLocaleString("ru", dataOptions) : '',
//                 DATE_DIFF: dateDiff(data[i].DATE_BILL, data[i].DATE_PAYED) //     data[i].DATE_PAYED ? moment(data[i].DATE_PAYED).diff(moment(data[i].DATE_BILL), 'days') : ''
//             })
//         )
//     }
//     return invs;

// }


const getCompanyTitle = (idcomp) => {
    // let t = this.state.companies.filter((cmp) => cmp.ID === idcomp)
    // if (t.length === 1) {
    //     return t[0].TITLE
    // } else {
    //     return
    // }
}

const sumInvoicesByStatus = (data, status) => {
    //let sum = 0
    let sum = sumBy(data, (obj) => {
        if (obj.PAYED === status)
            return parseFloat(obj.PRICE)
    })
    return isNaN(sum) ? 0 : sum;
}

/**
 * создает данные для графика
 * @param {*} invarr 
 */
const createGraphicData = (invarr) => {
    let graphicData = [];

    let groupedInvoices = groupBy(invarr, function (inv) {
        return moment(inv['DATE_BILL'], 'YYYY-MM-DD').startOf('month');
    });

    for (let prop in groupedInvoices) {
        // console.log(new Date(prop).getFullYear() + " " + new Date(prop).getMonth(), groupedInvoices[prop]);

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
 * Возвращает все компании
 * @param {*} token 
 * @param {*} startpos 
 */
export const getAllCompanies = (token, startpos) => {
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

export const getUsers = (userArr, returnResult) => {
    if (window.BX24) {
        window.BX24.callMethod(
            'user.get',
            {
                "filter": { "ACTIVE": true },
                "select": ["ID", "NAME", "LAST_NAME", "UF_DEPARTMENT"]
            },

            function (result) {
                if (result.error()) {
                    console.error('get users', result.error());
                }
                else {

                    Array.prototype.push.apply(userArr, result.data());

                    if (result.more()) {
                        result.next();
                    } else {
                        console.log("userArr end", userArr)
                        let tmpArr = userArr.filter((user) => { return (user.WORK_POSITION !== "" && user.WORK_POSITION !== null) })
                        console.log("userArr filter", tmpArr)
                        //OK!!
                        returnResult(tmpArr); //возвращает в компонент массив польз-й и запускает функцию получения подразделений
                    }
                }
            }
        )
        //}
        //)
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