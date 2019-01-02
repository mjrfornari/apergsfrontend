import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'
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
// import Situacoes from './pages/Situacoes'
import Lotacoes from './pages/Lotacoes'
import Home from './pages/Home'
import CategoriasAssociados from './pages/CategoriasAssociados';
import GrauParentesco from './pages/GrauParentesco';
import Bancos from './pages/Bancos';
import TiposServicos from './pages/TiposServicos';
import Dependentes from './pages/Dependentes';
import Login from './pages/Login';

class App extends Component {
    render() {
        return (
            <Router>
                <Switch>  
                    <Route exact path="/login" component={Login}>
                    </Route>
                    <ProtectedRoute path="/home" component={Home}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/associados" component={Associados}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/associados/registro" component={RegistroAssociados}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/associados/celulares" component={Celulares}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/associados/dependentes" component={Dependentes}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/cidades" component={Cidades}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/estados" component={Estados}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/paises" component={Paises}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/parametros" component={Parametros}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/lotacoes" component={Lotacoes}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/categorias-associados" component={CategoriasAssociados}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/grau-parentesco" component={GrauParentesco}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/bancos" component={Bancos}>
                    </ProtectedRoute>
                    <ProtectedRoute exact path="/tipos-servicos" component={TiposServicos}>
                    </ProtectedRoute>
                    <ProtectedRoute component={Home}>
                    </ProtectedRoute>
                </Switch>
            </Router>
        );
    }
}

export default App;
