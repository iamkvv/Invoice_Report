import React, { Component } from 'react'
import { Table, Button } from 'antd';
import { resizeWindow, leadList } from '../BXMethods'

class Leads extends Component {
    state = {
        appWidth: 800,
        leads: []
    }

    columns = [
        {
            title: 'ID',
            dataIndex: 'ID',
            key: 'ID'
        },
        {
            title: 'ФИО',
            dataIndex: 'TITLE',
            key: 'TITLE'
        },
        {
            title: 'EMAIL',
            dataIndex: 'EMAIL',
            key: 'EMAIL',
            render: emails => (
                emails ?
                    emails.map(email => <p>{email.VALUE}</p>)
                    :
                    <span>-</span>
            )
        }]




    componentDidMount() {
        this.setState({ appWidth: document.getElementById('react-app').clientWidth });
        this.getLeadList();
    }


    displayLeadList = (result) => {
        console.log('displayLeadList', result)
        this.setState({ leads: this.state.leads.concat(result.data()) },
            () => {
                resizeWindow(this.state.appWidth,
                    document.getElementById('ttt').scrollHeight + 500);
                console.log("state-- ", this.state.leads)
            })
    }

    errLeadList = (err) => {
        console.log(err)
    }


    getLeadList = () => {
        const result = leadList(this.displayLeadList, this.errLeadList)
    }

    render() {
        return (
            <div>
                <Table id="ttt" style={{ margin: '20px' }} size="middle" bordered columns={this.columns} dataSource={this.state.leads} />
            </div>
        )
    }
}

export default Leads