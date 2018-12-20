import React, { Component } from 'react';
import {Nav, Navbar, NavDropdown, NavItem, MenuItem} from 'react-bootstrap'
import '../css/Default.css';




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
                                    <MenuItem eventKey={1.1}>Países</MenuItem>
                                    <MenuItem eventKey={1.2}>Estados</MenuItem>
                                    <MenuItem eventKey={1.3}>Cidades</MenuItem>
                                    <MenuItem eventKey={1.4}>Parâmetros</MenuItem>
                                <MenuItem divider />
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Associação</p>
                                    <MenuItem eventKey={1.1} href="/associados">Associados</MenuItem>
                                    <MenuItem eventKey={1.2}>Situações</MenuItem>
                                    <MenuItem eventKey={1.3}>Lotações</MenuItem>
                                    <MenuItem eventKey={1.4}>Categorias de Associados</MenuItem>
                                    <MenuItem eventKey={1.5}>Tipos de dependentes</MenuItem>
                                <MenuItem divider />
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Financeiro</p>
                                    <MenuItem eventKey={1.1}>Bancos</MenuItem>
                                    <MenuItem eventKey={1.2}>Tipos de serviço</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={2} title="Lançamentos" id="basic-nav-dropdown">
                                <MenuItem eventKey={2.1}>Contas a receber</MenuItem>
                            </NavDropdown>
                            <NavDropdown eventKey={3} title="Funções Especiais" id="basic-nav-dropdown">
                                <p style={{fontWeight: "bold", textDecoration: "underline", textAlign: "left", marginLeft: "20px"}}>Sistema</p>
                                    <MenuItem eventKey={3.1}>Usuários</MenuItem>
                            </NavDropdown>
                        </Nav>
                        <Nav pullRight>
                            <NavItem eventKey={1} href="#logout">
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
