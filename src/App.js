import './App.css'
import React, { Component } from 'react'
import { LocaleProvider } from 'antd';
import ruRU from 'antd/lib/locale-provider/ru_RU';


//import { resizeWindow } from './BXMethods'
import { getAllInvoices } from './BXMethods'



import { Layout, BackTop } from 'antd';
import CurrMessage from './components/message'

// import Leads from './components/leads'
// import User from './components/user'
// import Report from './components/report'
import InvoiceReport from './components/invReport'

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import axios from 'axios'



/**
 * http://recharts.org/en-US/examples/StackedBarChart
 * zip_dist.js в .bin
 * //https://github.com/Mostafa-Samir/zip-local;
var zipper = require('zip-local');
zipper.sync.zip("./dist").compress().save("./dist/pack.zip");
console.info("Program Ended")
 */

class App extends Component {

  simulateClick = function (elem) {
    // Create our event (with options)
    var evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    // elem.dispatchEvent(evt)
    // If cancelled, don't dispatch our event
    var canceled = !elem.dispatchEvent(evt);
  };

  componentDidMount() {
    let r = document.getElementById('invrep')
    this.simulateClick(r);

    var obj = BX24.getAuth();
    console.log("access_token", obj.access_token);


    // let el = document.getElementById('react-app')
    // let w = el.scrollWidth;
    // let h = el.scrollHeight;
    // resizeWindow(w, h);//1500);

    //Это работает --> auth взят из access_token, к-й возвращается функцией BX24.getAuth()
    // axios.get('https://fanfantulpan.bitrix24.ru/rest/user.current.json?auth=76af525c003355500003002a0000060b201c0309ddde983ed67c86b8a775d703108276')
    //   .then((response) => {
    //     console.log('from axios', response)
    //   })
    //   .catch(err => {
    //     console.log("ERR", err)
    //   })


    // getAllInvoices().then(response => {
    //   console.log("RRRR", response)
    // })


  }

  render() {
    const {
      Header, Footer, Sider, Content,
    } = Layout;

    return (
      <Router>
        <LocaleProvider locale={ruRU}>
          <div id="react-app" className="App">

            <Layout>

              {/* <Header className='repofr-header'>
              <h2 className='repofr-title'> Аналитические отчеты </h2>
               <h2 className="App-react"> <span >Bitrix24</span>
                <img className="App-logo" src='react.svg' />
                <span>React</span>
              </h2> 
              </Header> */}
              <Layout>
                <Sider style={{ backgroundColor: '#535c69' }}>
                  <div>
                    <ul style={{ listStyle: 'none', padding: '0px', textAlign: 'center', marginTop: '20px', marginLeft: '0px' }}>
                      {/* <li>
                      <Link style={{ color: '#00d8ff' }} to="/">Список лидов</Link>
                    </li>
                    <li>
                      <Link style={{ color: '#00d8ff' }} to="/currencies/">Курс доллара</Link>
                    </li>
                    <li>
                      <Link style={{ color: '#00d8ff' }} to="/user/">User</Link>
                    </li>
                    <li>
                      <Link style={{ color: '#00d8ff' }} to="/report/">Отчет</Link>
                    </li> */}

                      <li>
                        <Link id="invrep" style={{ color: '#2fc6f7', fontSize: '16px' }} to="/InvoiceReport/">Отчет по счетам</Link>
                      </li>

                      <li>
                        <Link style={{ color: '#00d8ff' }} to="/currencies/">Курс доллара</Link>
                      </li>


                    </ul>
                  </div>
                </Sider>
                <Content>
                  <div>

                    {/* <Route path="/" exact component={Leads} />
                  <Route path="/currencies/" component={CurrMessage} />
                  <Route path="/user/" component={User} />
                  <Route path="/report/" component={Report} /> */}

                    <Route exact path="/InvoiceReport/" component={InvoiceReport} />
                    <Route path="/currencies/" component={CurrMessage} />

                  </div>
                </Content>
              </Layout>
              <Footer>
                <h3>Оливит 2019</h3>
              </Footer>
            </Layout>
          </div>
        </LocaleProvider>
      </Router >
    )
  }
}

export default App
