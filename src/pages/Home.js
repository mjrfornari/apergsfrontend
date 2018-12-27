import React, { Component } from 'react';
import NavBar from '../components/NavBar'
import '../css/Default.css';
import "react-table/react-table.css";
import {LinkContainer} from 'react-router-bootstrap'


class Home extends Component {

    render() {
        return (
            <div className="boxSite colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar></NavBar>
                </div>
                {/***************** Tela do WebSite *******************/}
                <div className="boxTela">
                    {/*********************** Header ***********************/}
                    <div className="boxHeader">
                        {/* <h3 className="headerCadastro">Página Inicial</h3> */}
                    </div>
                    {/*********************** Filtros ***********************/}
                    <div style={{minHeight: '80vh'}}>
                        <div style={{ width: '80vw', marginLeft: '30px', marginRight: '30px'}}>
                            <div className="buttonsHome">
                                <LinkContainer to="associados">
                                    <button className="buttonHomeDiv">
                                        <img alt="Associados" src={require('../imgs/associados.png')} className="buttonHome" title="Associados"/>
                                        <br/>
                                        Associados
                                    </button>
                                </LinkContainer>
                                <LinkContainer to="contas_receber">
                                    <button className="buttonHomeDiv">
                                        {/* style={{height: '15vh', display:"block", width: 'auto'}} */}
                                        <img alt="Contas a Receber" src={require('../imgs/contas_receber.png')} className="buttonHome" title="Associados"/>
                                        <br/>
                                        Contas a Receber
                                    </button>
                                </LinkContainer>
                            </div>
                        </div>
                        <div>
                            <img alt="Contas a Receber" src={require('../imgs/ApergsPNG.png')} title="Associados" className="logoHome"/>
                        </div>
                    </div>
                    
                    {/*********************** Tabela ***********************/}

                    {/*********************** Rodapé ***********************/}
                    
                </div>
            </div>
        );
    }
}

export default Home;
