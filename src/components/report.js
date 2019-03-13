import React, { Component } from 'react'
import { Table, Button } from 'antd';
import { resizeWindow, leadList, getUsersProm, getDeparts, getUsers, getUser, getActivity, getUserDepart } from '../BXMethods'

import columns from '../Helper/user_columns'


class Report extends Component {
    state = {
        appWidth: 800,
        leads: [],
        users: []
    }
    ///////////////


    onClickUsersProms = () => {
        let result = getUsersProm();
        result.then(this.readUsers)
    }

    readUsers = (result) => {
        console.log("PromRes ", result)
    }

    /////////////////

    onClickActivity = () => {
        var x = getActivity();
        console.log("X", x);
    }

    onClickUser = () => {
        getUser(923)
    }

    onUserDepart = () => {
        getUserDepart(923)
    }

    onDeparts = () => {
        getDeparts(1)
    }

    /////////
    onClickAllUsers = () => {
        let emptyArr = [];
        getUsers(emptyArr, this.getDeps)
    }

    getDeps = (users) => {
        let emptyArr = [];
        getDeparts(emptyArr, (depArr) => {

            //массив - люди -подраздел
            let resArr = users.map((user) => {
                console.log(String(user.UF_DEPARTMENT[0]));
                return Object.assign({}, {
                    "ID": user.ID,
                    "FIO": user.NAME + ' ' + user.LAST_NAME,
                    "WORK_POSITION": user.WORK_POSITION,
                    "DEPARTMENT": depArr.filter((dep) => {
                        return dep.ID === String(user.UF_DEPARTMENT[0])
                    })[0].NAME
                })
            })

            this.setState({ users: resArr })
            console.log("RESULT USER-DEP", resArr);

            getActivity();
        });

    }

    /////////
    componentDidMount() {
        let emptyArr = [];
        getUsers(emptyArr, this.getDeps)

        // const result = getUsers();
        // if (result) {
        //     result.then(this.displayUsers, this.errUsers)
        // } else {
        //     this.setState({ fio: "BX24 not found" })
        // }

    }



    displayUsers = (result) => {
        console.log('uSers', result)

    }


    errUsers = (err) => {
        console.log('errCurrentUser', err)
    }



    render() {
        return (
            <div>
                <div id="report_container" style={{ width: "90%", display: "flex", flexDirection: "column" }}>
                    <div id="report_menu" style={{ display: "flex", flexDirection: "row" }}>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDrection: 'row' }}>
                            <li>
                                First
                            </li>
                            <li>
                                Second
                            </li>
                        </ul>

                    </div>
                    <div id="report_content" style={{ display: "flex", flexDirection: "row" }}>

                        <div style={{ width: '33%' }}>
                            <Table id="ttt" style={{ margin: '10px' }}

                                onRow={(record, rowIndex) => {
                                    return {
                                        onClick: (event) => {
                                            //record - object 
                                            console.log(event, record, rowIndex)
                                        }
                                    };
                                }}

                                size="middle"
                                bordered
                                columns={columns}
                                dataSource={this.state.users} />
                        </div>
                        <p>2 Content</p>
                    </div>
                </div>

                {/* <p>report</p>
                <p>
                    <button onClick={this.onClickUsersProms}>Users Promise</button>
                </p>

                <p>
                    <button onClick={this.onClickActivity}>Activity</button>
                </p>

                <p>
                    <button onClick={this.onClickUser}>Пользователь</button>
                </p>

                <p>
                    <button onClick={this.onClickAllUsers}>Все Пользователи</button>
                </p>

                <p>
                    <button onClick={this.onDeparts}>Подразделения</button>
                </p>

                <p>
                    <button onClick={this.onUserDepart}>Пользователь + Подразделение</button>
                </p> */}

            </div>
        )
    }
}

export default Report