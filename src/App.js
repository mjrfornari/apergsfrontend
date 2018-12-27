import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './css/Default.css';
import './css/Table.css';
import 'semantic-ui-css/semantic.min.css';
import Associados from './pages/Associados'
import RegistroAssociados from './pages/RegistroAssociados'
import Celulares from './pages/Celulares'
import Cidades from './pages/Cidades'
import Estados from './pages/Estados'
import Paises from './pages/Paises'
import Parametros from './pages/Parametros'
import Situacoes from './pages/Situacoes'
import Lotacoes from './pages/Lotacoes'
import Home from './pages/Home'
import CategoriasAssociados from './pages/CategoriasAssociados';
import TiposDependentes from './pages/TiposDependentes';
import Bancos from './pages/Bancos';

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
                <Route exact path="/associados/celulares" component={Celulares}>
                </Route>
                <Route exact path="/cidades" component={Cidades}>
                </Route>
                <Route exact path="/estados" component={Estados}>
                </Route>
                <Route exact path="/paises" component={Paises}>
                </Route>
                <Route exact path="/parametros" component={Parametros}>
                </Route>
                <Route exact path="/situacoes" component={Situacoes}>
                </Route>
                <Route exact path="/lotacoes" component={Lotacoes}>
                </Route>
                <Route exact path="/categorias-associados" component={CategoriasAssociados}>
                </Route>
                <Route exact path="/tipos-dependentes" component={TiposDependentes}>
                </Route>
                <Route exact path="/bancos" component={Bancos}>
                </Route>
                <Route component={Home}>
                </Route>
            </Switch>
        </Router>
    );
  }
}

export default App;
