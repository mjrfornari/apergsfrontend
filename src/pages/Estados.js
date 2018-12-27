import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import Autocomplete from '../components/Autocomplete'
import '../css/Default.css';
import { Modal } from 'react-bootstrap'
// import {LinkContainer} from 'react-router-bootstrap'
import ReactTable from "react-table";
import "react-table/react-table.css";
import { garanteDate, asyncForEach, getParameterByName, populateForm } from '../Utils'
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


class Estados extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            combos: [],
            filter: [],
            selected : {
                pais: []
            },
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
        this.selectPais = this.selectPais.bind(this);
        this.filterPais = this.filterPais.bind(this);
    }

    selectPais(item){
        this.setState({ selected: {
            pais: item
        }})
    }


    filterPais(item){
        let newFilter = this.state.filter
        newFilter.fk_pai = item.value
        newFilter.pais = item
        this.setState({ filter: newFilter })
    }

    populaPaises(item, id) {
        if (item.type === 'paises'){
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
        let edicao = false
        let pk = '0'
        if (Number(codigo) > 0) {
            edicao = true
            pk = codigo
            await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getEstados?pk='+(Number(codigo)).toString()).then(r => r.json()).then(async r => {
            // await fetch(config.backend+'/getCelulares?pk='+(Number(e.target.id)).toString()).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/estados'
                } else {
                    let form = document.getElementById('registroEstados');
                    let selectedPais = this.state.combos.filter((item) => { return item.type==='paises' && item.value===r[0].fk_pai })
                    this.setState({ selected: {
                        pais: selectedPais[0]
                    }})
                    await populateForm(form, r[0])
                }  
            })
        } else {
            this.setState({ selected: {
                pais: []
            }})
            edicao = false
            document.getElementById("registroEstados").reset();
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
        e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('registroEstados');
        const data = new FormData(form);

        console.log(data)

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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editEstados?pk='+this.state.codigo, {
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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoEstados', {
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
        //Busca valores para combo de filtro
        //Paises
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getPaises').then(r => r.json()).then(async r => {
            let combosPaises = this.state.combos
            await asyncForEach(r, async (item)=>{
               let paises = {
                    type: 'paises',
                    display: item.nome,
                    value: item.pk_pai
                }
                await combosPaises.push(paises)
            })
            this.setState({combos: this.state.combos})
        })  
  


        //Carregar Parâmetros de pesquisa
        let query = {}
        query.filtered = getParameterByName('filtered')
        query.nome = getParameterByName('nome')
        query.sigla = getParameterByName('sigla')
        query.fk_pai = Number(getParameterByName('fk_pai'))
        query.pais = this.state.combos.filter((item) => { return item.type==='paises' && Number(item.value)===query.fk_pai})[0]

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
                fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/deleteEstados?pk='+pk, {
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
        console.log(reg)
        reg[name] = value
        this.setState({
            filter : reg
        })
        
    }

    handleClean(e) {
        //Limpa o filtro
        e.preventDefault()
        console.log('limpa')
        window.history.replaceState({filtered: false}, 'filter', "/estados") //Apaga QueryURL
        this.setState({filter: []}) 
        
        // document.getElementById('inputfiltroFk_pai').value=''
    }

    async modelingData(data) {
        //Trata os campos
        return new Promise(async (resolve)=>{
            await asyncForEach(data, async (item)=>{
               item.data_nasc = garanteDate(item.data_nasc)
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

                //Filtro: Nome
                let nome = (item.nome || '').includes((filter.nome || '').toUpperCase())
                if (filter.nome) {
                    if (queryString === '?') {
                        queryString = queryString + 'nome=' + filter.nome
                    } else queryString = queryString + '&nome=' + filter.nome
                }

                //Filtro: Sigla
                let sigla = (item.sigla || '').includes((filter.sigla || '').toUpperCase())
                if (filter.sigla) {
                    if (queryString === '?') {
                        queryString = queryString + 'sigla=' + filter.sigla
                    } else queryString = queryString + '&sigla=' + filter.sigla
                }

                //Filtro: Lotação
                let fk_pai = (Number(item.fk_pai) === Number(filter.fk_pai)) || (filter.fk_pai || '') === ''
                if (filter.fk_pai) {
                    if (queryString === '?') {
                        queryString = queryString + 'fk_pai=' + filter.fk_pai
                    } else queryString = queryString + '&fk_pai=' + filter.fk_pai
                }

                //Monta Query URL
                if (queryString !== '?') {
                    window.history.replaceState({filtered: true}, 'filter', "/estados"+queryString+"&filtered=true")
                } else {
                    window.history.replaceState({filtered: true}, 'filter', "/estados")                
                }

                //Filtra
                return nome && sigla && fk_pai
            })
            resolve(filtered)
        })        
    }

    getData(e) {
        //Busca, filtra e trata os dados
        e.preventDefault()
        //Busca
        fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getEstados').then(r => r.json()).then(async r => {
            //Filtra
            let items = await this.filterData(r)
            //Trata
            items = await this.modelingData(items)
            this.setState({data: items})
        })
    }


    render() {
        let paises = this.state.combos.filter((item) => { return item.type==='paises' })
        return (
            <div className="boxSite colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar selected="Estados"></NavBar>
                </div>
                {/***************** Tela do WebSite *******************/}
                <div className="boxTela">
                    {/*********************** Header ***********************/}
                    <div className="boxHeader">
                        <h3 className="headerCadastro">Cadastro de Estados</h3>
                    </div>
                    {/*********************** Filtros ***********************/}
                    <div className="boxFiltros">
                        {/* Parâmetros de pesquisa:<br/> */}
                        <div className="filtros">
                            <div className="column-filter">
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Sigla</label>
                                    <input name="sigla" type="text" id='filtroSigla' className="inputFiltro" style={{width: '60px'}} value={this.state.filter.sigla || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Nome</label>
                                    <input name="nome" type="text" id='filtroNome' className="inputFiltro" style={{width: '50vw'}} value={this.state.filter.nome || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">País</label>
                                    <Autocomplete field="filtroFk_pai" items={paises} inModal="" selected={this.state.filter.pais || { display: '' }} select={this.filterPais}></Autocomplete>
                                </div>
                            </div>
                            <br/>
                            <div className="column-filter-2">
                                <button className="buttonFiltroProcessar" onClick={this.getData}><Icon size={20} style={{ display: "inline" }} icon={iosSearchStrong}></Icon>Processar</button>
                                <button className="buttonFiltroLimpar" aria-label="clear selection" onClick={this.handleClean}><Icon size={20} style={{ display: "inline" }} icon={ic_clear}></Icon>Limpar</button>
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
                                            <h3 className="headerModal">Registro de Estado</h3>
                                        </div>
                                    </Modal.Header>
                                    <Modal.Body className="ModalBg" >   
                                        <div className='ModalBody'> 
                                            <form id="registroEstados" name="registroEstados" onSubmit={ this.submitData }>
                                                <div>
                                                    <label className="labelModal">Sigla</label>
                                                    <input type="text" id="sigla" name="sigla" className="form-control inModal" style={{width: '60px'}} data-parse="uppercase" />
                                                </div>
                                                <div>
                                                    <label className="labelModal">Nome</label>
                                                    <input type="text" id="nome" name="nome" className="form-control inModal" data-parse="uppercase" />
                                                </div>
                                                <div>
                                                    <label className="labelModal">País</label>
                                                    <Autocomplete field="fk_pai" items={paises} inModal="-inModal" selected={this.state.selected.pais} select={this.selectPais}></Autocomplete>
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
                        <div style={{ marginLeft: '30px', marginTop: '30px', marginRight: '30px' }}>
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
                                            accessor: "pk_est",
                                            show: false
                                        }, 
                                        {
                                            Header: "Sigla",
                                            accessor: "sigla",
                                            minWidth: 100
                                        }, 
                                        {
                                            Header: "Nome",
                                            accessor: "nome",
                                            minWidth: 400
                                        },
                                        {
                                            Header: "País",
                                            accessor: "nomepai",
                                            minWidth: 400
                                        },
                                        {
                                            Header: "Opções",
                                            minWidth: 300,
                                            maxWidth: 300,
                                            Cell: row => { return (
                                                <div className="buttonsDetailColumn">
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.showModal(e, row.row.pk_est)}}>
                                                        <Icon size={20} icon={edit}></Icon>
                                                        Editar
                                                    </button>
                                                    <button className="buttonDetailColumn" onClick={(e)=>{this.handleDelete(e, row.row.pk_est)}}>
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Estados;
