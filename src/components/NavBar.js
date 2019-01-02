import React, { Component } from 'react';
import {Nav, Navbar, NavDropdown, NavItem, MenuItem} from 'react-bootstrap'
import '../css/Default.css';
import swal from 'sweetalert';




class NavBar extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selected: 'Nenhum',
            item: ''
        };
        this.detailItem = this.detailItem.bind(this)
        this.clearItem = this.clearItem.bind(this)
        this.items = this.items.bind(this)

    }

    items(item){
        if (item !== '') {
            let pos = ((item-1)*150)+50
            return (
                <div className="themeDetailNavBar" style={{ position: 'absolute', left: pos+'px'}}>
                    <a href='#test' className="secondItemNavBar">Gerais</a>
                    <br/>
                    <a href='#test' className="secondItemNavBar">Associação</a>
                    <br/>
                    <a href='#test' className="secondItemNavBar">Financeiro</a>
                    <br/>
                </div>
            )
        }
        
    }

    detailItem(e) {
        e.preventDefault();
        this.setState({
            item: e.target.id
        })
    }

    clearItem(e) {
        e.preventDefault();
        this.setState({
            item: ''
        })
    }

    logout(e) {
        
        e.preventDefault();
        swal({
            dangerMode: true,
            title: "Atenção!",
            text: "Ao sair, todas as alterações em andamento serão descartadas. Você tem certeza que deseja sair?",
            buttons: ["Não", "Sim"],
        }).then((result) => {
            if (result) {
                sessionStorage['authApergs'] = JSON.stringify({ authenticated: false, user: 0 })
                window.location.reload();
            }
        });
        
    }

    render() {
        // let detailed = this.items(this.state.item)
        // return (
        //     <div className="themeNavBar" onMouseLeave={this.clearItem}>
        //         <a id='2' className="headItemNavBar" href='#test'>Apergs Web</a>
        //         <a id='2' className="firstItemNavBar" href='#test' onMouseOver={this.detailItem}>Cadastros</a>
        //         <a id='3' className="firstItemNavBar" href='#test' onMouseOver={this.detailItem}>Lançamentos</a>
        //         <a id='4' className="firstItemNavBar" href='#test' onMouseOver={this.detailItem}>Funções Especiais</a>
        //         {detailed}
        //         <a id='exit' className="logOutNavBar" href='#test'>Sair</a>
        //     </div>
        // );


        return(
            <div>
                <style type="text/css">
                    {`
                    .navbar {
                        background-color: var(--navbar-background);
                    }
                    `}
                </style>
                <Navbar inverse collapseOnSelect className='h-20'>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="/home" style={{display: 'flex'}}>   
                                <img alt="APERGS" src={require('../imgs/icontransparent.png')} className="iconApergs" title="APERGS"/>
                                APERGS
                            </a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse> 
                        <Nav>
                            <NavDropdown eventKey={1} title="Cadastros" id="basic-nav-dropdown">
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Gerais</p>
                                    <MenuItem eventKey={1.1} href="/paises">Países</MenuItem>
                                    <MenuItem eventKey={1.2} href="/estados">Estados</MenuItem>
                                    <MenuItem eventKey={1.3} href="/cidades">Cidades</MenuItem>
                                    <MenuItem eventKey={1.4} href="/parametros">Parâmetros</MenuItem>
                                <MenuItem divider />
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Associação</p>
                                    <MenuItem eventKey={1.1} href="/associados">Associados</MenuItem>
                                    {/* <MenuItem eventKey={1.2} href="/situacoes">Situações</MenuItem> */}
                                    <MenuItem eventKey={1.3} href="/lotacoes">Lotações</MenuItem>
                                    <MenuItem eventKey={1.4} href="/categorias-associados">Categorias de Associados</MenuItem>
                                    <MenuItem eventKey={1.5} href="/grau-parentesco">Grau de Parentesco</MenuItem>
                                <MenuItem divider />
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Financeiro</p>
                                    <MenuItem eventKey={1.1} href="/bancos">Bancos</MenuItem>
                                    <MenuItem eventKey={1.2} href="/tipos-servicos">Tipos de serviço</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={2} title="Lançamentos" id="basic-nav-dropdown">
                                <MenuItem eventKey={2.1} href="/contas-receber" disabled>Contas a receber</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={3} title="Funções Especiais" id="basic-nav-dropdown">
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Sistema</p>
                                    <MenuItem eventKey={3.1} href="/usuarios" disabled>Usuários</MenuItem>
                            </NavDropdown>
                        </Nav>
                        <Nav pullRight>
                            <NavItem eventKey={1} onClick={this.logout}>
                                Sair
                            </NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        )
    }
}

export default NavBar;
