import React, { Component } from 'react'
import { Card, Button } from 'antd';
import { sendMessage } from '../BXMethods'
import { sendToLenta } from '../BXMethods'

import { getRate } from '../outMehods'

//https://openexchangerates.org/account/app-ids

class CurrMessage extends Component {
    constructor(props) {
        super(props);
        this.afterMessage = this.afterMessage.bind(this);
    }



    state = {
        rate: 'xxx',
        result: false
    }

    onClick = () => {

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };

        if (this.state !== 'xxx') {
            const mess = `[P][B]Курс доллара на ${new Date().toLocaleString("ru", options)} составляет ${this.state.rate} руб.[/B][/P]`
            //sendMessage(this.state.rate, this.afterMessage)//, this)
            sendToLenta(mess)
        }
    }

    afterMessage(res) {   ///, ctx) {
        //callBack BX-метода; this привязан в конструкторе

        console.log('afterMessage - this', this)
        //console.log('afterMessage - ctx', ctx)

        if (!res.error()) {
            //ctx.setResult();
            this.setState({ result: true })
        }
        else {
            throw res.error();
        }
    }
    // setResult = () => {
    //     this.setState({ result: true })
    // }


    getRateClick = () => {
        let res = getRate()

        res.then((data) => {
            this.setState({ rate: data.rates.RUB })
            console.log(data.rates.RUB)
        }, (err) => {
            console.log(err)
        })
    }

    render() {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return (
            <Card
                title={<span style={{ fontSize: '20px', color: 'green' }}>
                    {`Курс доллара на ${new Date().toLocaleString("ru", options)}`}
                </span>}
                extra={<span style={{ fontSize: '32px', color: 'royalblue' }}>$</span>}
                style={{ width: 420, margin: '100px auto' }}
            >
                <div style={{ display: 'flex', flexDirection: "row-reverse", alignItems: 'baseline', justifyContent: 'space-around' }}>
                    <div style={{ color: '#a28d22', fontSize: '20px' }}>
                        {this.state.rate}
                        {this.state.rate !== 'xxx' ? <span>&#8381;</span> : ''}
                    </div>
                    <div>
                        <Button onClick={this.getRateClick}>Обновить</Button>
                    </div>
                </div>
                {!this.state.result ? <p>.</p>
                    :
                    <p style={{ marginTop: '10px' }}>Сообщение отправлено</p>
                }

                <Button type='primary' icon='notification' onClick={this.onClick}>
                    Проинформировать сотрудников
                </Button>
            </Card>
        )
    }
}

export default CurrMessage