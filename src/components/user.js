import React, { Component } from 'react'
import { Card, Icon } from 'antd';
import { getCurrentUser } from '../BXMethods'

class User extends Component {
    state = {
        user: {}
    }

    componentDidMount() {
        const result = getCurrentUser();
        if (result) {
            result.then(this.displayCurrentUser, this.errCurrentUser)
        } else {
            this.setState({ fio: "BX24 not found" })
        }
    }

    displayCurrentUser = (result) => {
        console.log('setCurrentUser', this, result)

        if (result.status === 200) {
            //   this.setState({
            //     fio: "ID: " + result.data().ID + " -- "
            //       + result.data().LAST_NAME + " "
            //       + result.data().NAME
            //   })
            this.setState({
                user: result.data()
            })


        } else {
            this.setState({
                fio: 'Не удалось определить текущего пользователя'
            })
        }
    }
    errCurrentUser = (err) => {
        console.log('errCurrentUser', err)
    }


    render() {
        return (
            <div>
                <Card
                    size="small"
                    title="Текущий пользователь"
                    extra={<Icon type="user" />}
                    style={{ margin: '30px auto 0 auto', width: 300 }}
                >
                    <p>{this.state.user.NAME} {this.state.user.LAST_NAME}</p>
                    <p>{this.state.user.EMAIL}</p>
                    <p><img style={{ width: '250px' }} src={this.state.user.PERSONAL_PHOTO} /></p>
                </Card>
            </div>
        )

    }
}

export default User