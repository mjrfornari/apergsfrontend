import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import '../css/Default.css';
import { Modal } from 'react-bootstrap'
import ReactTable from "react-table";
import "react-table/react-table.css";
import { getParameterByName, asyncForEach, populateForm, garanteDate, dateSql } from '../Utils'
import swal from 'sweetalert';
import { Icon } from 'react-icons-kit'
import {edit} from 'react-icons-kit/ionicons/edit'
import {iosTrash} from 'react-icons-kit/ionicons/iosTrash'
import {ic_add_circle} from 'react-icons-kit/md/ic_add_circle'


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





class Dependentes extends Component {
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

    populaCategoria(item, id) {
        if (item.type === 'categoria'){
            return (
                <option value={item.value} key={id}>{item.display}</option>  
            )
        }
    }

    populaBanco(item, id) {
        if (item.type === 'banco'){
            return (
                <option value={item.value} key={id}>{item.display}</option>  
            )
        }
    }

    populaGrau(item, id) {
        if (item.type === 'grau'){
            return (
                <option value={item.value} key={id}>{item.display}</option>  
            )
        }
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
            await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getDependentes?pk='+(Number(codigo)).toString()).then(r => r.json()).then(async r => {
            // await fetch(config.backend+'/getDependentes?pk='+(Number(e.target.id)).toString()).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/associados'
                } else {
                    let form = document.getElementById('registroDependentes');
                    r[0].data_nasc = dateSql(r[0].data_nasc)
                    console.log(r[0].data_nasc)
                    await populateForm(form, r[0])
                }  
            })
        } else {
            edicao = false
            document.getElementById("registroDependentes").reset();
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
        //Categoria
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCategoriasAssociados').then(r => r.json()).then(async r => {
            let combosCategoria = []
            await asyncForEach(r, async (item)=>{
               let categoria = {
                    type: 'categoria',
                    display: item.descricao,
                    value: item.pk_cat
                }
                await combosCategoria.push(categoria)
            })
            this.setState({combos: combosCategoria})
        })  

        //Graus
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getTiposDependentes').then(r => r.json()).then(async r => {
            let combosGrau = this.state.combos
            await asyncForEach(r, async (item)=>{
               let grau = {
                    type: 'grau',
                    display: item.descricao,
                    value: item.pk_tde
                }
                await combosGrau.push(grau)
            })
            this.setState({combos: combosGrau})
        })  

        //Bancos
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getBancos').then(r => r.json()).then(async r => {
            let combosBancos = this.state.combos
            await asyncForEach(r, async (item)=>{
               let bancos = {
                    type: 'banco',
                    display: item.nome,
                    value: item.pk_bco
                }
                
                await combosBancos.push(bancos)
            })
            // console.log(combosBancos)
            this.setState({combos: combosBancos})
        })  


        //Buscar informações do Associado
        let query = {}
        query.pk = Number(getParameterByName('pk'))

        if (query.pk > 0) {
            
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getAssociados?pk='+query.pk).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/associados'
                } else {
                    this.setState({ associado: r[0] })
                    fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getDependentes?fk='+query.pk).then(r => r.json()).then(async r => {
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

    validateData(data) {
        let valid = { isValid: true }
        //Consistências

        //Nome
        if (data.get('nome')) {
            valid = { isValid: true }
        } else {
            return { isValid: false, title: 'Campo inválido!', message: 'Verifique o campo NOME.'}
        }

        //Categoria
        if (data.get('fk_cat') !== 'NNN') {
            valid = { isValid: true }
        } else {
            return { isValid: false, title: 'Campo inválido!', message: 'Verifique o campo CATEGORIA DE ASSOCIADO.'}
        }

        //Grau de Parentesco
        if (data.get('fk_gra') !== 'NNN') {
            valid = { isValid: true }
        } else {
            return { isValid: false, title: 'Campo inválido!', message: 'Verifique o campo GRAU DE PARENTESCO.'}
        }

        //Data
        if (data.get('data_nasc')) {
            valid = { isValid: true }
        } else {
            return { isValid: false, title: 'Campo inválido!', message: 'Verifique o campo DATA NASCIMENTO.'}
        }

        //Banco
        if (data.get('fk_bco') || data.get('agencia') || data.get('conta')) {
            if (data.get('fk_bco') && data.get('agencia') && data.get('conta')) {
                valid = { isValid: true }
            } else {
                return { isValid: false, title: 'Campo(s) inválido(s)!', message: 'Verifique os dados bancários.'}
            }
        }


        console.log(valid)
        //Retorna resultado
        return valid
    }
    

    async modelingData(data) {
        //Trata os campos
        return new Promise(async (resolve)=>{
            await asyncForEach(data, async (item)=>{
               item.data_nasc_str = garanteDate(item.data_nasc)
               item.carteira_unimed = item.carteira_unimed_hospitalar || item.carteira_unimed_ambulat || item.carteira_unimed_global || item.carteira_unimed_odonto || ''
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
                fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/deleteDependente?pk='+pk, {
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
                        swal("Exclusão não realizada", "Registro não foi excluído.", "error");
                    }
                })
            }
        });
    }

    submitData(e) {
        e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('registroDependentes');
        const data = new FormData(form);
        const fk = Number(getParameterByName('pk'))

        
        let validate = this.validateData(data)
        
        if (!validate.isValid) {
            swal(validate.title, validate.message, "error");
            throw validate
        }
        console.log(data.keys())

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
            console.log(name, input.value)
        }


        //Insere FK
        data.append('fk_asstitular', fk)

        //Converte FormData em JSON
        var object = {};
        data.forEach(function(value, key){
            if (value !== "") {
                object[key] = value;
            } else {
                object[key] = null;
            }
        });
        var json = JSON.stringify(object);


        //Post no server
        if (this.state.edit) {
            //Editar
            console.log(json)
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editDependente?pk='+this.state.codigo, {
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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoDependente', {
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
        let categorias = this.state.combos.map(this.populaCategoria)
        let graus = this.state.combos.map(this.populaGrau)
        let bancos = this.state.combos.map(this.populaBanco)
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
                        <h3 className="headerCadastro">Cadastro de Dependentes</h3>
                    </div>
                    {/*********************** Campos ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
                        <div className={this.modalState()} tabIndex="-1">
                            <Modal.Dialog className="Modal">
                                    <div>
                                    <Modal.Header className="ModalBg">   
                                        <div className="ModalHeader">
                                            <h3 className="headerModal">Registro de Dependente</h3>
                                        </div>
                                    </Modal.Header>
                                    <Modal.Body className="ModalBg" >   
                                        <div className='ModalBody'> 
                                            <form id="registroDependentes" name="registroDependentes" onSubmit={ this.submitData }>
                                                <div>
                                                    <label className="labelModal">Nome:</label>
                                                    <input type="text" name="nome" className="form-control" data-parse="uppercase"/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Categoria de Associado:</label>
                                                    <select name="fk_cat" id="fk_cat" className="form-control" data-parse="uppercase" style={{ width: '180px' }}>
                                                        <option value="NNN">Selecione</option>
                                                        {categorias}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Grau de Parentesco:</label>
                                                    <select name="fk_gra" id="fk_gra" className="form-control" data-parse="uppercase" style={{ width: '150px' }}>
                                                        <option value="NNN">Selecione</option>
                                                        {graus}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Data de Nascimento:</label>
                                                    <input type="date" name="data_nasc" className="form-control" style={{ width: '150px' }}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Banco:</label>
                                                    <select name="fk_bco" data-parse="uppercase" className="form-control" style={{ width: '200px'}}>
                                                        <option value="">Selecione</option>
                                                        {bancos}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Agência:</label>
                                                    <input type="text" name="agencia" className="form-control" style={{ width: '100px'}} data-parse="uppercase"/>
                                                </div>
                                                <div>                                                
                                                    <label className="labelModal">Conta:</label>
                                                    <input type="text" name="conta" className="form-control" style={{ width: '130px'}} data-parse="uppercase"/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Número Carteira Global:</label>
                                                    <input type="text" id="carteira_unimed_global" name="carteira_unimed_global" className="form-control" maxLength="10"  style={{ width: '180px'}}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Número Carteira Ambulatorial:</label>
                                                    <input type="text" id="carteira_unimed_ambulat" name="carteira_unimed_ambulat" className="form-control" maxLength="10"  style={{ width: '180px'}}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Número Carteira Odonto:</label>
                                                    <input type="text" id="carteira_unimed_hospitalar" name="carteira_unimed_hospitalar" className="form-control" maxLength="10"  style={{ width: '180px'}}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Número Carteira Odonto:</label>
                                                    <input type="text" id="carteira_unimed_odonto" name="carteira_unimed_odonto" className="form-control" maxLength="10"  style={{ width: '180px'}}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Observações:</label>
                                                    <textarea type="text" name="observacoes" className="form-control" data-parse="uppercase"/>
                                                </div>
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
                            {/* <LinkContainer to={"/associados/dependentes/registro?pk="+this.state.associado.pk_ass}> */}
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
                                            accessor: "pk_ass",
                                            minWidth: 50
                                        }, 
                                        {
                                            Header: "Nome",
                                            accessor: "nome",
                                            minWidth: 400
                                        },
                                        {
                                            Header: "Grau de Parentesco",
                                            accessor: "nomegra",
                                            minWidth: 100
                                        },
                                        {
                                            Header: "Dt Nasc",
                                            accessor: "data_nasc_str",
                                            minWidth: 100,
                                        },
                                        {
                                            Header: "Carteira Unimed",
                                            accessor: "carteira_unimed",
                                            minWidth: 120,
                                        },
                                        {
                                            Header: "Categoria Associado",
                                            accessor: "nomecat",
                                            minWidth: 150,
                                        },
                                        {
                                            Header: "Opções",
                                            minWidth: 200,
                                            maxWidth: 200,
                                            Cell: row => { return (
                                                <div className="buttonsDetailColumn">
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.showModal(e, row.row.pk_ass)}}>
                                                        <Icon size={20} icon={edit}></Icon>
                                                        Editar
                                                    </button>
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.handleDelete(e, row.row.pk_ass)}}>
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

export default Dependentes;
