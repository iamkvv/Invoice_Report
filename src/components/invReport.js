import React, { Component } from 'react'
import { Tabs, Card, DatePicker, BackTop, Table, Icon, Tooltip as ATooltip } from 'antd';
import moment from 'moment'

import { getInvoicesByPeriod, buildTablesData } from '../BXMethods'
import { rootTableColumns, nestedTablesColumns } from '../Helper/helpers'
import { clearInvArray, clearCompArray } from '../BXMethods' //?? этого не д.б.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { resizeWindow } from '../BXMethods' //доделать!!!!

const TabPane = Tabs.TabPane
const { RangePicker } = DatePicker;

class InvoiceReport extends Component {
    state = {
        companyname: {},
        graphicData: [],
        companies: [],
        roottabledata: [],
        nestedtablesdata: [],
        isLoad: false,
        tableDataReady: false
    }
    prevMonthStart = moment(moment(new Date()).subtract(1, 'month').startOf('month'), "YYYY-MM-DD");
    prevMonthEnd = moment(moment(new Date()).subtract(1, 'month').endOf('month'), "YYYY-MM-DD");

    componentDidMount() {
        this.onChange(null,
            [this.prevMonthStart.format('YYYY-MM-DD'),
            this.prevMonthEnd.format("YYYY-MM-DD")]
        )
    }


    detailInvoiceTable = (key) => {
        const nestedData = this.state.nestedtablesdata.filter((obj) => (obj.key === key));
        return (
            <Card title="Детализация" size="small">
                <Table
                    columns={nestedTablesColumns}
                    dataSource={nestedData}
                    size="small"
                    pagination={true}
                />
            </Card>
        )
    }

    onChange = (date, dateString) => {
        let self = this;
        let tkn = BX24.getAuth();

        clearInvArray() //переделать!!

        this.setState({
            roottabledata: [],
            childtablesdata: [],
            tableDataReady: false,
            isLoad: true
        })

        getInvoicesByPeriod(null, dateString[0], dateString[1], tkn.access_token)
            .then(response => {
                this.setState({
                    graphicData: response.graphicData,
                    isLoad: false
                })
                return response.sourceData //все счета без company TITLE
            })
            .then(response => {

                clearCompArray(); //??переделать!!

                //строим данные для родительской и вложенных таблиц
                return buildTablesData(tkn.access_token, response)
            })
            .then(response => {
                //помещаем данные таблиц в state
                self.setState({
                    roottabledata: response.roottabledata,
                    nestedtablesdata: response.nestedtablesdata,
                    tableDataReady: true
                })

                let el = document.getElementById('react-app')
                let w = el.scrollWidth;
                let h = el.scrollHeight;
                resizeWindow(w, h);//1500);  //перепроверить 

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

                    <TabPane tab={this.state.tableDataReady ? "Таблица" : "Подготовка данных..."}
                        disabled={this.state.tableDataReady ? false : true}
                        key="2">
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