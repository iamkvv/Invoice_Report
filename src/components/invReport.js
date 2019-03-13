import React, { Component } from 'react'
import { Tabs, DatePicker, BackTop, Table, Icon, Tooltip as ATooltip, Badge } from 'antd';

import { getAllInvoices, getAllCompanies } from '../BXMethods'
import { rootTableColumns } from '../Helper/user_columns'

import { clearArray } from '../BXMethods'

import { monthRome } from '../Helper/user_columns'

import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'
import filter from 'lodash/filter'
import moment from 'moment'

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { resizeWindow } from '../BXMethods'


const TabPane = Tabs.TabPane
const { RangePicker } = DatePicker; //февраль - console.log(moment([2019, 1]).toDate(),"---" ,moment([2019, 1]).endOf('month').toDate())

class InvoiceReport extends Component {
    state = {
        data: [],
        companies: [],
        roottabledata: [],
        childtablesdata: [],
        isLoad: false
    }
    prevMonthStart = moment(moment(new Date()).subtract(1, 'month').startOf('month'), "YYYY-MM-DD");
    prevMonthEnd = moment(moment(new Date()).subtract(1, 'month').endOf('month'), "YYYY-MM-DD");

    componentDidMount() {
        let tkn = BX24.getAuth();
        getAllCompanies(tkn.access_token)
            .then(response => {

                console.log('comp response', response)

                this.setState({ companies: response });

                console.log('COMPANIES', this.state.companies)

                this.onChange(null,
                    [this.prevMonthStart.format('YYYY-MM-DD'),
                    this.prevMonthEnd.format("YYYY-MM-DD")]
                )
            })
    }


    sumInvoicesByStatus = (data, status) => {
        let sum = 0
        sum = sumBy(data, (obj) => {
            if (obj.PAYED === status)
                return parseFloat(obj.PRICE)
        })
        return isNaN(sum) ? 0 : sum;
    }

    getCompanyTitle = (idcomp) => {
        let t = this.state.companies.filter((cmp) => cmp.ID === idcomp)
        if (t.length === 1) {
            return t[0].TITLE
        } else {
            return ''
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
        const dataOptions = {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric',
        }
        for (let i = 0; i < data.length; i++) {
            invarr.push(
                Object.assign({}, {
                    key: key,
                    ID: data[i].ID,
                    ACCOUNT_NUMBER: data[i].ACCOUNT_NUMBER,
                    DATE_BILL: new Date(data[i].DATE_BILL).toLocaleString("ru", dataOptions),
                    PRICE: data[i].PRICE,
                    COMPANY: this.getCompanyTitle(data[i].UF_COMPANY_ID),   // ? this.state.companies.filter((obj) => obj.ID === data[i].UF_COMPANY_ID)[0].TITLE : '???',
                    STATUS: data[i].STATUS_ID,
                    DATE_PAYED: data[i].DATE_PAYED ? new Date(data[i].DATE_PAYED).toLocaleString("ru", dataOptions) : '',
                    DATE_DIFF: data[i].DATE_PAYED ? moment(data[i].DATE_PAYED).diff(moment(data[i].DATE_BILL), 'days') : ''
                })
            )
        }
        this.setState({ childtablesdata: this.state.childtablesdata.concat(invarr) })
    }

    getChildTable = (key) => {

        const childData = this.state.childtablesdata.filter((obj) => (obj.key === key));

        const handleChange = (pagination, filters, sorter, ...rest) => {
            console.log('Various parameters', pagination, filters, sorter, rest);
            // this.setState({
            //   filteredInfo: filters,
            //   sortedInfo: sorter,
            // });
        }

        const getStatus = (s) => {
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

        const columns = [
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
                render: (s) => { return getStatus(s) },
                filters: [{
                    text: 'отклонен',
                    value: 'D',
                }, {
                    text: 'оплачен',
                    value: 'P',
                }],
                onFilter: (value, record) => {
                    //if (record.key === "2019 I") {
                    console.log("STATUS--", record, record.key, record.STATUS, value)
                    return record.STATUS === value //.indexOf(value) === 0
                    //}
                },
            },
            {
                title: "Дата оплаты", dataIndex: "DATE_PAYED", key: "DATE_PAYED"
            },
            {
                title: "Длит-ть дн.", dataIndex: "DATE_DIFF", key: "DATE_DIFF"
            }
        ]

        return (
            <Table
                rowKey={e => e.ID}
                columns={columns}
                dataSource={childData} //   {this.state.childtablesdata}
                size="small"
                pagination={true}
                onChange={handleChange}
            />
        )
    }


    onChange = (date, dateString) => {

        console.log("dateString", dateString)

        //??? clearArray() //переделать!!
        this.setState({ roottabledata: [], childtablesdata: [], isLoad: true })

        getAllInvoices(null, dateString[0], dateString[1])
            .then(response => {
                console.log("Invoices ", response)

                let invArr = [];

                var groupedResults = groupBy(response, function (result) {
                    return moment(result['DATE_BILL'], 'YYYY-MM-DD').startOf('month'); //ПО какой дате лучше группировать???
                });

                //для таблицы
                let RootTableInvoicesData = this.groupInvoicesByPeriod(response)
                this.setState({ roottabledata: RootTableInvoicesData })
                console.log('Группировка по месяцам', groupedResults)//Группировка по месяцам

                for (let prop in groupedResults) {
                    this.buildChildData(
                        new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
                        groupedResults[prop]
                    )
                }

                console.log("childtablesdata ??? ", this.state.childtablesdata)
                console.log("roottablesdata ??? ", this.state.roottabledata)


                for (let prop in groupedResults) {
                    console.log("obj." + new Date(prop).getFullYear() + " " + new Date(prop).getMonth(), groupedResults[prop]);

                    invArr.push(Object.assign({}, {
                        period: new Date(prop).getFullYear() + " " + monthRome(new Date(prop).getMonth()),
                        есть: filter(groupedResults[prop], { PAYED: 'Y' }).length,
                        нет: filter(groupedResults[prop], { PAYED: 'N' }).length,

                        "оплачено ₽": sumBy(groupedResults[prop], (obj) => {
                            if (obj.PAYED === "Y")
                                return parseFloat(obj.PRICE)
                        }),

                        "не оплачено ₽": sumBy(groupedResults[prop], (obj) => {
                            if (obj.PAYED === "N")
                                return parseFloat(obj.PRICE)
                        })
                    }))
                }

                console.log('ARRAY ', invArr)
                this.setState({ data: invArr, isLoad: false });
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

                        <BarChart width={700} height={400} data={this.state.data}
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
                            expandedRowRender={(record) => this.getChildTable(record.key)}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default InvoiceReport