import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import Associados from './pages/Associados'
import RegistroAssociados from './pages/RegistroAssociados'
import RegistroCelulares from './pages/RegistroCelulares'
import Home from './pages/Home'

class App extends Component {
  render() {
    return (
		<Router>
            <Switch>  
                {/* <Route exact path="/" component={Login}>
                </Route> */}
                <Route path="/home" component={Home}>
                </Route>
				<Route exact path="/associados" component={Associados}>
                </Route>
                <Route exact path="/associados/registro" component={RegistroAssociados}>
                </Route>
                <Route exact path="/associados/celulares" component={RegistroCelulares}>
                </Route>
                <Route component={Home}>
                </Route>
            </Switch>
        </Router>
    );
  }
}

export default App;
