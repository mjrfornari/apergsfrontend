import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import '../css/Default.css';
import { Modal } from 'react-bootstrap'
// import {LinkContainer} from 'react-router-bootstrap'
import ReactTable from "react-table";
import "react-table/react-table.css";
import { onBlurCurrency, asyncForEach, getParameterByName, populateForm, setInputFilter } from '../Utils'
// import moment from 'moment'
import swal from 'sweetalert';
import { Icon } from 'react-icons-kit'
import {edit} from 'react-icons-kit/ionicons/edit'
import {iosTrash} from 'react-icons-kit/ionicons/iosTrash'
import {ic_add_circle} from 'react-icons-kit/md/ic_add_circle'
import {iosSearchStrong} from 'react-icons-kit/ionicons/iosSearchStrong'
import {ic_clear} from 'react-icons-kit/md/ic_clear'


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


class TiposServicos extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            combos: [],
            filter: [],
            modal: {show: false},
            edit: false,
            filterChanged: '',
            data: []
        };
        this.getData = this.getData.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.filterData = this.filterData.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.showModal = this.showModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.modalState = this.modalState.bind(this);
        this.handleSave = this.handleSave.bind(this);
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
        let edicao = false
        let pk = '0'
        if (Number(codigo) > 0) {
            edicao = true
            pk = codigo
            await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getTiposServicos?pk='+(Number(codigo)).toString()).then(r => r.json()).then(async r => {
            // await fetch(config.backend+'/getCelulares?pk='+(Number(e.target.id)).toString()).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/tipos-servicos'
                } else {
                    let form = document.getElementById('registroTiposServicos');
                    console.log(r[0])
                    r[0].valor = r[0].valor.toFixed(2).replace(".", ",")
                    await populateForm(form, r[0])
                }  
            })
        } else {
            edicao = false
            document.getElementById("registroTiposServicos").reset();
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

    submitData(e) {
        // e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('registroTiposServicos');
        const data = new FormData(form);

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

        //Valor para sql
        let valor = data.get('valor')
        valor = valor.replace(',', '.')
        console.log(valor)
        data.set('valor', valor)


        //Converte FormData em JSON
        var object = {};
        data.forEach(function(value, key){
            object[key] = value;
        });
        var json = JSON.stringify(object);

        //Post no server
        if (this.state.edit) {
            //Editar
            console.log(json)
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editTiposServicos?pk='+this.state.codigo, {
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
                        var event = new Event('build');
                        this.getData(event)
                    });
                } else {
                    swal("Alteração não realizada", "Registro não foi alterado. Verifique os campos.", "error");
                }
            })
        } else {
            //Inserir
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoTiposServicos', {
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
                        var event = new Event('build');
                        this.getData(event)
                    });
                } else {
                    swal("Inclusão não realizada", "Registro não foi incluído. Verifique os campos.", "error");
                }
            })
        }
    }


    async componentDidMount() {

        setInputFilter(document.getElementById("valor"), function(value) {
            return /^-?\d*[.,]?\d*$/.test(value);
        });

        //Carregar Parâmetros de pesquisa
        let query = {}
        query.filtered = getParameterByName('filtered')
        query.descricao = getParameterByName('descricao')
        query.inativo = getParameterByName('inativo')


        this.setState({
            filter: query
        })

        //Caso filtered=true, traz form já processado
        var event = new Event('build');
        if (query.filtered) this.getData(event)

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
                fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/deleteTiposServicos?pk='+pk, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({})
                }).then(r=>r.json()).then(r=>{
                    console.log(r)
                    if (r.message === "Success!") {
                        swal("Exlusão realizada", "Registro excluído com sucesso!", "success").then((result) => {
                            //Caso filtered=true, traz form já processado
                            var event = new Event('build');
                            this.getData(event)
                        });
                    } else {
                        swal("Exclusão não realizada", "Registro não foi excluído. Verifique os campos.", "error");
                    }
                })
            }
        });
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
        e.preventDefault()
        console.log('limpa')
        window.history.replaceState({filtered: false}, 'filter', "/tipos-servicos") //Apaga QueryURL
        this.setState({filter: []}) 
    }

    async modelingData(data) {
        //Trata os campos
        return new Promise(async (resolve)=>{
            await asyncForEach(data, async (item)=>{
               item.inativo_str = item.inativo === 'S' ? 'Sim' : 'Não'
            })
            resolve(data)
        })
    }

    async filterData(data) {
        //Filtra os dados
        return new Promise(async (resolve)=>{
            let filter = this.state.filter


            let filtered = await data.filter((item) => {
                let queryString = '?' 

                //Filtro: Descricao
                let descricao = (item.descricao || '').includes((filter.descricao || '').toUpperCase())
                if (filter.descricao) {
                    if (queryString === '?') {
                        queryString = queryString + 'descricao=' + filter.descricao
                    } else queryString = queryString + '&descricao=' + filter.descricao
                }

                //Filtro: Inativo
                let inativo = (String(item.inativo) === String(filter.inativo)) || (filter.inativo || '') === ''
                if (filter.inativo) {
                    if (queryString === '?') {
                        queryString = queryString + 'inativo=' + filter.inativo
                    } else queryString = queryString + '&inativo=' + filter.inativo
                }

                //Monta Query URL
                if (queryString !== '?') {
                    window.history.replaceState({filtered: true}, 'filter', "/tipos-servicos"+queryString+"&filtered=true")
                } else {
                    window.history.replaceState({filtered: true}, 'filter', "/tipos-servicos")                
                }

                //Filtra
                return descricao && inativo
            })
            resolve(filtered)
        })        
    }

    getData(e) {
        //Busca, filtra e trata os dados
        e.preventDefault()
        //Busca
        fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getTiposServicos').then(r => r.json()).then(async r => {
            //Filtra
            let items = await this.filterData(r)
            //Trata
            items = await this.modelingData(items)
            this.setState({data: items})
        })
    }

    render() {
        return (
            <div className="boxSite colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar selected="TiposServicos"></NavBar>
                </div>
                {/***************** Tela do WebSite *******************/}
                <div className="boxTela">
                    {/*********************** Header ***********************/}
                    <div className="boxHeader">
                        <h3 className="headerCadastro">Cadastro de Tipos de Serviços</h3>
                    </div>
                    {/*********************** Filtros ***********************/}
                    <div className="boxFiltros">
                        {/* Parâmetros de pesquisa:<br/> */}
                        <div className="filtros">
                            <div className="column-filter">
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Descrição</label>
                                    <input name="descricao" type="text" id='filtroDescricao' className="inputFiltro" style={{width: '50vw'}} value={this.state.filter.descricao || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Situação</label>
                                    <select data-parse="uppercase" id="filtroInativo" name="inativo" className="form-control" value={this.state.filter.inativo || ''} style={{ width: '100px'}} onChange={this.handleChange}>
                                        <option value="">Todas</option>
                                        <option value="N">Ativos</option>
                                        <option value="S">Inativos</option>
                                    </select>
                                </div>
                            </div>
                            <br/>
                            <div className="column-filter-2">
                                <button className="buttonFiltroProcessar" onClick={this.getData}><Icon size={20} style={{ display: "inline" }} icon={iosSearchStrong}></Icon>Processar</button>
                                <button className="buttonFiltroLimpar" onClick={this.handleClean}><Icon size={20} style={{ display: "inline" }} icon={ic_clear}></Icon>Limpar</button>
                                <button className="buttonNovo" onClick={this.showModal}><Icon size={20} style={{ display: "inline" }} icon={ic_add_circle}></Icon>Novo Registro</button>
                            </div>
                        </div> 
                    </div>
                    {/*********************** Tabela ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
                        <div className={this.modalState()} tabIndex="-1">
                            <Modal.Dialog className="Modal">
                                    <div>
                                    <Modal.Header className="ModalBg">   
                                        <div className="ModalHeader">
                                            <h3 className="headerModal">Registro de Tipo de Serviço</h3>
                                        </div>
                                    </Modal.Header>
                                    <Modal.Body className="ModalBg" >   
                                        <div className='ModalBody'> 
                                            <form id="registroTiposServicos" name="registroTiposServicos" onSubmit={ this.submitData }>
                                                <div>
                                                    <label className="labelModal">Descrição</label>
                                                    <input type="text" id="descricao" name="descricao" className="form-control" data-parse="uppercase" />
                                                </div>
                                                <div>
                                                    <label className="labelModal">Valor (R$)</label>
                                                    <input type="text" id="valor" name="valor" className="form-control" style={{ width: '120px' }} onBlur={onBlurCurrency}/>
                                                </div>
                                                <div>
                                                    <label className="labelModal">Inativo</label>
                                                    <select data-parse="uppercase" id="inativo" name="inativo" className="form-control" defaultValue="N" style={{ width: '100px'}}>
                                                        <option value="N">Não</option>
                                                        <option value="S">Sim</option>
                                                    </select>
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
                        <div style={{ marginLeft: '30px', marginTop: '30px', marginRight: '30px'}}>
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
                                            accessor: "pk_ser",

                                            // show: false
                                        }, 
                                        {
                                            Header: "Descrição",
                                            accessor: "descricao",
                                            minWidth: 400
                                        },
                                        {
                                            Header: "Valor",
                                            // accessor: "inativo_str",
                                            minWidth: 80,
                                            Cell: row => { 
                                                return (
                                                    <div>
                                                        {Number(row.original.valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                                    </div>
                                            )}
                                        },
                                        {
                                            Header: "Inativo",
                                            // accessor: "inativo_str",
                                            minWidth: 50,
                                            Cell: row => { 
                                                return (
                                                    <div style={{ color: row.original.inativo==='S' ? 'red' : 'var(--table-font)'}}>
                                                        {row.original.inativo_str}
                                                    </div>
                                            )}
                                        },
                                        {
                                            Header: "Opções",
                                            minWidth: 300,
                                            maxWidth: 300,
                                            Cell: row => { return (
                                                <div className="buttonsDetailColumn">
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.showModal(e, row.row.pk_ser)}}>
                                                        <Icon size={20} icon={edit}></Icon>
                                                        Editar
                                                    </button>
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.handleDelete(e, row.row.pk_ser)}}>
                                                        <Icon size={20} icon={iosTrash}></Icon>
                                                        Excluir
                                                    </button>
                                                </div>
                                            )}
                                        }
                                    ]}
                                    defaultSorted={[
                                        {
                                            id: "pk_ser",
                                            desc: false
                                        }
                                    ]}
                                    defaultPageSize={10}
                                    className="-striped -highlight"
                                /> 
                            </div>   
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TiposServicos;
