import React, { Component } from 'react'
import { Tabs, DatePicker, BackTop, Table, Icon } from 'antd';

import { getInvoicesByPeriod, getAllCompanies } from '../BXMethods'
import { monthRome, rootTableColumns, dateDiff, dateRU, invoiceTablesColumns } from '../Helper/helpers'

import { clearArray } from '../BXMethods' //?? этого не д.б.

import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
import filter from 'lodash/filter'
import moment from 'moment'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { resizeWindow } from '../BXMethods' //доделать!!!!

const TabPane = Tabs.TabPane
const { RangePicker } = DatePicker; //февраль - console.log(moment([2019, 1]).toDate(),"---" ,moment([2019, 1]).endOf('month').toDate())

class InvoiceReport extends Component {
    state = {
        graphicData: [], //для графика - дать хорошее имя
        companies: [],
        roottabledata: [],
        nestedtablesdata: [],
        isLoad: false
    }
    prevMonthStart = moment(moment(new Date()).subtract(1, 'month').startOf('month'), "YYYY-MM-DD");
    prevMonthEnd = moment(moment(new Date()).subtract(1, 'month').endOf('month'), "YYYY-MM-DD");

    componentDidMount() {
        let tkn = BX24.getAuth();
        getAllCompanies(tkn.access_token)
            .then(response => {
                this.setState({ companies: response });

                this.onChange(null,
                    [this.prevMonthStart.format('YYYY-MM-DD'),
                    this.prevMonthEnd.format("YYYY-MM-DD")]
                )
            })
    }


    // sumInvoicesByStatus = (data, status) => {
    //     let sum = 0
    //     sum = sumBy(data, (obj) => {
    //         if (obj.PAYED === status)
    //             return parseFloat(obj.PRICE)
    //     })
    //     return isNaN(sum) ? 0 : sum;
    // }

    getCompanyTitle = (idcomp) => {
        let t = this.state.companies.filter((cmp) => cmp.ID === idcomp)
        if (t.length === 1) {
            return t[0].TITLE
        } else {
            return
        }
    }

    groupInvoicesByPeriod = (data) => { //готовит данные для корневой таблицы - группировка по месяцам 
        let rootdata = [];
        let groupedResults = groupBy(data, function (result) {
            return moment(result['DATE_BILL'], 'YYYY-MM-DD').startOf('month'); //ПО какой дате лучше группировать???
        });

        for (let prop in groupedResults) {

            let opl = this.sumInvoicesByStatus(groupedResults[prop], "Y");
            let nopl = this.sumInvoicesByStatus(groupedResults[prop], "N");

            rootdata.push(Object.assign({}, {
                //rowKey: new Date(prop).getFullYear() + " " + this.monthRome(new Date(prop).getMonth()),
                key: new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
                period: new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),

                // "оплачено ₽": sumBy(groupedResults[prop], (obj) => {
                //     if (obj.PAYED === "Y")
                //         return parseFloat(obj.PRICE)
                // }),

                "оплачено ₽": opl, ///this.sumInvoicesByStatus(groupedResults[prop], "Y"),
                "не оплачено ₽": nopl, ///this.sumInvoicesByStatus(groupedResults[prop], "N")
                "deltasum": opl - nopl,
                "invcount": groupedResults[prop].length


                // "не оплачено ₽": sumBy(groupedResults[prop], (obj) => {
                //     if (obj.PAYED === "N")
                //         return parseFloat(obj.PRICE)
                // })
            }))
        }
        return rootdata;
    }

    buildChildData = (key, data) => {
        let invarr = [];

        for (let i = 0; i < data.length; i++) {
            invarr.push(
                Object.assign({}, {
                    key: key,
                    ID: data[i].ID,
                    ACCOUNT_NUMBER: data[i].ACCOUNT_NUMBER,
                    DATE_BILL: dateRU(data[i].DATE_BILL),//  new Date(data[i].DATE_BILL).toLocaleString("ru", dataOptions),
                    PRICE: data[i].PRICE,
                    COMPANY: this.getCompanyTitle(data[i].UF_COMPANY_ID),   // ? this.state.companies.filter((obj) => obj.ID === data[i].UF_COMPANY_ID)[0].TITLE : '???',
                    STATUS: data[i].STATUS_ID,
                    DATE_PAYED: dateRU(data[i].DATE_PAYED), // data[i].DATE_PAYED ? new Date(data[i].DATE_PAYED).toLocaleString("ru", dataOptions) : '',
                    DATE_DIFF: dateDiff(data[i].DATE_BILL, data[i].DATE_PAYED) //     data[i].DATE_PAYED ? moment(data[i].DATE_PAYED).diff(moment(data[i].DATE_BILL), 'days') : ''
                })
            )
        }
        this.setState({ childtablesdata: this.state.childtablesdata.concat(invarr) })
    }

    detailInvoiceTable = (key) => {

        const childData = this.state.nestedtablesdata.filter((obj) => (obj.key === key));

        return (
            <Table
                rowKey={e => e.ID} //???убрать
                columns={invoiceTablesColumns}
                dataSource={childData} //   {this.state.childtablesdata}
                size="small"
                pagination={true}
            />
        )
    }


    onChange = (date, dateString) => {

        //??? clearArray() //переделать!!
        this.setState({ roottabledata: [], childtablesdata: [], isLoad: true })

        getInvoicesByPeriod(null, dateString[0], dateString[1])
            .then(response => {
                //тут нужно возвращать 2 набора в одном объекте  1 - для графика и 1 - для таблицы
                console.log("all datas ", response)


                ///!!!!
                // let invArr = [];
                // var groupedResults = groupBy(response, function (result) {
                //     return moment(result['DATE_BILL'], 'YYYY-MM-DD').startOf('month'); //ПО какой дате лучше группировать???
                // });

                // //для таблицы
                // let RootTableInvoicesData = this.groupInvoicesByPeriod(response)
                // this.setState({ roottabledata: RootTableInvoicesData })
                // console.log('Группировка по месяцам', groupedResults)//Группировка по месяцам

                // for (let prop in groupedResults) {
                //     this.buildChildData(
                //         new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
                //         groupedResults[prop]
                //     )
                // }

                ///!!!!!

                this.setState({
                    graphicData: response.graphicData,
                    roottabledata: response.tableData.roottabledata,
                    nestedtablesdata: response.tableData.nestedtablesdata,
                    isLoad: false
                })//   ({ graphicData: invArr, isLoad: false });
            })
    }

    render() {
        return (
            <div style={{ width: '95%', height: 'auto', minHeight: '2000px', margin: '0 auto' }}>
                <BackTop>
                    <div className="ant-back-top-inner">UP</div>
                </BackTop>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="График" key="1">

                        <div style={{
                            display: 'flex', flexDirection: 'row', fontSize: '16px',
                            justifyContent: 'left', alignItems: 'baseline', marginLeft: '20px'
                        }}>
                            <p>Диапазон дат </p>
                            <RangePicker onChange={this.onChange}
                                defaultValue={[this.prevMonthStart, this.prevMonthEnd]}
                                style={{ textAlign: 'left', marginLeft: '20px' }}
                            />
                            <p>
                                {this.state.isLoad ?
                                    <Icon type="loading" style={{ marginLeft: 20 }} /> :
                                    null
                                }
                            </p>
                        </div>
                        <div style={{ textAlign: 'left', marginLeft: '20px', fontSize: '18px' }}>
                            Оплата счетов
                        </div>

                        <BarChart width={700} height={400} data={this.state.graphicData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="оплачено ₽" stackId="a" fill="#8884d8" />
                            <Bar dataKey="не оплачено ₽" stackId="a" fill="#82ca9d" />
                        </BarChart>
                    </TabPane>

                    <TabPane tab="Таблица" key="2">
                        <Table
                            scroll={{ y: 540 }}
                            columns={rootTableColumns}
                            dataSource={this.state.roottabledata}
                            expandedRowRender={(record) => this.detailInvoiceTable(record.key)}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default InvoiceReport