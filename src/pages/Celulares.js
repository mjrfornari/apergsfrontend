import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import '../css/Default.css';
import { Modal } from 'react-bootstrap'
import ReactTable from "react-table";
import "react-table/react-table.css";
import { getParameterByName, asyncForEach, populateForm } from '../Utils'
import swal from 'sweetalert';
import { Icon } from 'react-icons-kit'
import {edit} from 'react-icons-kit/ionicons/edit'
import {iosTrash} from 'react-icons-kit/ionicons/iosTrash'
import {ic_add_circle} from 'react-icons-kit/md/ic_add_circle'

const operadoras = [
    {
        nome: 'Claro',
        codigo: 'C'
    },
    {
        nome: 'Oi',
        codigo: 'O'
    },
    {
        nome: 'Tim',
        codigo: 'T'
    },
    {
        nome: 'Vivo',
        codigo: 'V'
    }
]


const inputParsers = {
    date(input) {
        const [month, day, year] = input.split('/');
        return `${year}-${month}-${day}`;
    },
    uppercase(input) {
        return input.toUpperCase();
    },
    number(input) {
        return parseFloat(input);
    }
};





class RegistroAssociados extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            combos: [],
            associado: {},
            modal: {show: false},
            filter: [],
            filterChanged: '',
            edit: false,
            modalIsOpen: false,
            data: []
        };
        this.submitData = this.submitData.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.showModal = this.showModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.modalState = this.modalState.bind(this)

    }

    closeModal() {
        swal({
            dangerMode: true,
            title: "Atenção!",
            text: "Ao cancelar, todas as alterações serão descartadas. Confirma?",
            buttons: ["Não", "Sim"],
        }).then((result) => {
            if (result) this.setState({ modal: { show: false } })
        });
        
    }

    async showModal(e, codigo) {
        // e.stopPropagation()
        e.preventDefault();
        console.log(e.target)
        let edicao = false
        let pk = '0'
        if (Number(codigo) > 0) {
            edicao = true
            pk = codigo
            await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCelulares?pk='+(Number(codigo)).toString()).then(r => r.json()).then(async r => {
            // await fetch(config.backend+'/getCelulares?pk='+(Number(e.target.id)).toString()).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/associados'
                } else {
                    let form = document.getElementById('registroCelulares');
                    await populateForm(form, r[0])
                }  
            })
        } else {
            edicao = false
            document.getElementById("registroCelulares").reset();
        }
        this.setState({ modal: { show: true }, edit: edicao, codigo: pk })
    }

    modalState(){
        if (this.state.modal.show === true) {
            return 'ModalShow'
        } else {
            return 'ModalHide'
        }
    }

    async componentDidMount() {      
        //Buscar informações do Associado
        let query = {}
        query.pk = Number(getParameterByName('pk'))

        if (query.pk > 0) {
            
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getAssociados?pk='+query.pk).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/associados'
                } else {
                    this.setState({ associado: r[0] })
                    fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCelulares?fk='+query.pk).then(r => r.json()).then(async r => {
                        console.log(r[0])
                        let items = await this.modelingData(r)
                        this.setState({data: items})
                    })
                }

            })
            this.setState({edit: true})

        }


    }

    handleChange(e) {
        //Popula inputs do filtro
        e.preventDefault()
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name
        let reg = this.state.filter
        reg[name] = value
        this.setState({
            filter : reg
        })
        
    }

    handleClean(e) {
        //Limpa o filtro

    }

    async modelingData(data) {
        //Trata os campos
        return new Promise(async (resolve)=>{
            await asyncForEach(data, async (item)=>{
                //Pega texto da Operadora
                let operadora = operadoras.filter(value => {
                    return value.codigo === item.operadora
                })
                item.operadora_nome = operadora[0].nome

                //Pega texto do Inativo
                let inativo = item.inativo === 'S' ? 'Sim' : 'Não'
                item.inativo_nome = inativo
            })
            resolve(data)
        })
    }

    handleSave(e) {
        e.preventDefault()
        swal({
            title: "Atenção!",
            text: this.state.edit ? "As alterações no registro serão salvas. Confirma?" : "O registro será incluído. Confirma?",
            buttons: ["Não", "Sim"],
        }).then((result) => {
            if (result) this.submitData(e)
        }); 
    }

    handleBack(e) {
        e.preventDefault()
        window.history.back()
    }

    handleDelete(e, pk) {
        e.preventDefault();
        swal({
            dangerMode: true,
            title: "Atenção!",
            text: "O registro selecionado será excluído. Confirma?",
            buttons: ["Não", "Sim"],
        }).then((result) => {
            if (result) {
                //Delete
                fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/deleteCelular?pk='+pk, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({})
                }).then(r=>r.json()).then(r=>{
                    console.log(r)
                    if (r.message === "Success!") {
                        swal("Exlusão realizada", "Registro excluído com sucesso!", "success").then((result) => {
                            this.componentDidMount()
                        });
                    } else {
                        swal("Exclusão não realizada", "Registro não foi excluído. Verifique os campos.", "error");
                    }
                })
            }
        });
    }

    submitData(e) {
        e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('registroCelulares');
        const data = new FormData(form);
        const fk = Number(getParameterByName('pk'))

        //Trata valores conforme data-parse dos inputs
        for (let name of data.keys()) {
            const input = form.elements[name]

            // Rejeita type = undefined (radio inputs)
            if (typeof input.type !== 'undefined') {
                const parserName = input.dataset.parse;
                if (parserName) {
                    const parser = inputParsers[parserName];
                    const parsedValue = parser(data.get(name));
                    data.set(name, parsedValue);
                }
            }
        }

        //Insere FK
        data.append('fk_ass', fk)

        //Converte FormData em JSON
        var object = {};
        data.forEach(function(value, key){
            object[key] = value;
        });
        var json = JSON.stringify(object);

        console.log(data.get('inativo'))
        //Post no server
        if (this.state.edit) {
            //Editar
            console.log(json)
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editCelular?pk='+this.state.codigo, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: json
            }).then(r=>r.json()).then(r=>{
                console.log(r)
                if (r.message === "Success!") {
                    swal("Alteração realizada", "Registro alterado com sucesso!", "success").then((result) => {
                        this.setState({ modal: { show:false } })
                        this.componentDidMount()
                    });
                } else {
                    swal("Alteração não realizada", "Registro não foi alterado. Verifique os campos.", "error");
                }
            })
        } else {
            //Inserir
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoCelular', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: json
            }).then(r=>r.json()).then(r=>{
                console.log(r)
                if (r.message === "Success!") {
                    swal("Inclusão realizada", "Registro incluído com sucesso!", "success").then((result) => {
                        this.setState({ modal: { show:false } })
                        this.componentDidMount()
                    });
                } else {
                    swal("Inclusão não realizada", "Registro não foi incluído. Verifique os campos.", "error");
                }
            })
        }

       

        

    }

    render() {
        return (
            <div className="boxSite colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar selected="Associados"></NavBar>
                </div>
                {/***************** Tela do WebSite *******************/}
                <div className="boxTela">
                    {/*********************** Header ***********************/}
                    <div className="boxHeader">
                        <h3 className="headerCadastro">Cadastro de Celulares</h3>
                    </div>
                    {/*********************** Campos ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
                        <div className={this.modalState()} tabIndex="-1">
                            <Modal.Dialog className="Modal">
                                    <div>
                                    <Modal.Header className="ModalBg">   
                                        <div className="ModalHeader">
                                            <h3 className="headerModal">Registro de Celulare</h3>
                                        </div>
                                    </Modal.Header>
                                    <Modal.Body className="ModalBg" >   
                                        <div className='ModalBody'> 
                                            <form id="registroCelulares" name="registroCelulares" onSubmit={ this.submitData }>
                                                <div>
                                                    <label className="labelModal">Operadora</label>
                                                    <select data-parse="uppercase" id="operadora" name="operadora" className="form-control" >
                                                        <option value="N" >Selecione</option>
                                                        <option value="C" >Claro</option>
                                                        <option value="T" >Tim</option>
                                                        <option value="O" >Oi</option>
                                                        <option value="V" >Vivo</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Número</label>
                                                    <input type="text" id="numero" name="numero" className="form-control" maxLength="10" data-parse="number" />
                                                </div>
                                                <div>
                                                    <label className="labelModal">Observação</label>
                                                    <input type="text" data-parse="uppercase" id="observacao" name="observacao" className="form-control" />
                                                </div>
                                                <label className="labelModal">Inativo</label>
                                                <select data-parse="uppercase" id="inativo" name="inativo" className="form-control" defaultValue="N">
                                                    <option value="N">Não</option>
                                                    <option value="S">Sim</option>
                                                </select>
                                            </form>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer className="ModalBg">
                                        <div className="ModalFooter">
                                            <button className="ModalButton" onClick={this.handleSave}>Salvar</button>
                                            <button className="ModalButton" onClick={this.closeModal}>Cancelar</button>
                                        </div>
                                    </Modal.Footer>
                                </div>
                            </Modal.Dialog>
                        </div>
                        <div style={{ marginLeft: '30px', marginRight: '30px', paddingBottom: "30px" }}>
                            <div style={{ height:'auto', marginBottom: '10px' }}>
                                <p style={{ fontSize: '1.2em' }}>Associado: <font style={{ fontSize: '1.2em',  fontWeight: 'bold'}}>{this.state.associado.nome}</font></p>
                            </div>
                            {/* <LinkContainer to={"/associados/celulares/registro?pk="+this.state.associado.pk_ass}> */}
                                <button className="buttonNovo" style={{ marginLeft: '0' }} onClick={this.showModal}><Icon size={20} style={{ display: "inline" }} icon={ic_add_circle}></Icon>Novo Registro</button>
                            {/* </LinkContainer>  */}
                            <br/>
                            <div className="divTabela">
                                <ReactTable
                                    data={this.state.data}
                                    previousText = 'Anterior'
                                    nextText = 'Próximo'
                                    loadingText = 'Carregando...'
                                    pageText = 'Página'
                                    ofText = 'de'
                                    rowsText = 'registros'
                                    noDataText="Nenhum registro encontrado"
                                    columns={[
                                        {
                                            Header: "Código",
                                            accessor: "pk_ace",
                                            show: false
                                        }, 
                                        {
                                            Header: "Número",
                                            accessor: "numero",
                                            minWidth: 400
                                        },
                                        {
                                            Header: "Operadora",
                                            accessor: "operadora_nome",
                                            minWidth: 200
                                        },
                                        {
                                            Header: "Inativo",
                                            accessor: "inativo_nome",
                                            minWidth: 50
                                        }, 
                                        {
                                            Header: "Opções",
                                            minWidth: 300,
                                            maxWidth: 300,
                                            Cell: row => { return (
                                                <div className="buttonsDetailColumn">
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.showModal(e, row.row.pk_ace)}}>
                                                        <Icon size={20} icon={edit}></Icon>
                                                        Editar
                                                    </button>
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.handleDelete(e, row.row.pk_ace)}}>
                                                        <Icon size={20} icon={iosTrash}></Icon>
                                                        Excluir
                                                    </button>
                                                </div>
                                            )}
                                        }
                                    ]}
                                    defaultSorted={[
                                        {
                                            id: "numero",
                                            desc: true
                                        }
                                    ]}
                                    defaultPageSize={10}
                                    className="-striped -highlight"
                                /> 
                            </div>  
                            <div className="buttonsCadastro">
                                <button className="buttonVoltar" style={{marginTop: '10px', marginLeft: '0px'}} onClick={this.handleBack}>Voltar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegistroAssociados;
