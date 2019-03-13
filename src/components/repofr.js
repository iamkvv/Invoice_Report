import React, { Component } from 'react'
import { Tabs, BackTop } from 'antd';
import Iframe from 'react-iframe'
import { resizeWindow } from '../BXMethods'


const TabPane = Tabs.TabPane

//allow="geolocation microphone camera midi encrypted-media"
//const Repofr = (props) => {
class Repofr extends Component {

    componentDidMount() {
        // let w = document.getElementById('react-app').;
        // console.log("W? -- ", w)
        // resizeWindow(w, 2700);

        let el = document.getElementById('react-app')
        let w = el.scrollWidth;
        let h = el.scrollHeight;
        resizeWindow(w, h);//1500);

    }

    render() {
        return (
            <div style={{ width: '95%', height: 'auto', minHeight: '2000px', margin: '0 auto' }}>
                <BackTop>
                    <div className="ant-back-top-inner">UP</div>
                </BackTop>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="Сводный отчет" key="1">
                        <Iframe url="https://fanfantulpan.bitrix24.ru/crm/reports/report/view/453/"
                            width="100%"
                            height="2700px"
                            id="rep1"
                            className="myClassname"
                            display="initial"
                            position="relative"
                            sandbox=" allow-popups allow-same-origin allow-scripts allow-forms  allow-top-navigation-by-user-activation"
                        />
                    </TabPane>
                    <TabPane tab="Детальный отчет" key="2">
                        <Iframe url="https://fanfantulpan.bitrix24.ru/crm/activity/"
                            width="100%"
                            height="2700px"
                            id="rep2"
                            className="myClassname"
                            display="initial"
                            position="relative"
                            sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-top-navigation-by-user-activation"
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default Repofr
