import React, { Component } from 'react';
import NavBar from '../components/NavBar'
import '../css/Default.css';
import "react-table/react-table.css";
import {LinkContainer} from 'react-router-bootstrap'


class Home extends Component {

    render() {
        return (
            <div className="boxTela colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar selected="ApergsWeb"></NavBar>
                </div>
                {/*********************** Header ***********************/}
                <div className="boxHeader">
                    {/* <h3 className="headerCadastro">Página Inicial</h3> */}
                </div>
                {/*********************** Filtros ***********************/}
                <div style={{minHeight: '90vh'}}>
                    <div style={{ width: 'calc(100% - 60px)', marginLeft: '30px', marginRight: '30px'}}>
                        <div className="buttonsHome">
                            <LinkContainer className="buttonHomeDiv" to="associados">
                                <button >
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
        );
    }
}

export default Home;
