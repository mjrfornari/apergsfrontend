import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import '../css/Default.css';
import {LinkContainer} from 'react-router-bootstrap'
import ReactTable from "react-table";
import "react-table/react-table.css";
import { garanteDate, asyncForEach, getParameterByName } from '../Utils'
import moment from 'moment'
import swal from 'sweetalert';
import { Icon } from 'react-icons-kit'
import {iosContact} from 'react-icons-kit/ionicons/iosContact'
import {iphone} from 'react-icons-kit/ionicons/iphone'
import {edit} from 'react-icons-kit/ionicons/edit'
import {iosTrash} from 'react-icons-kit/ionicons/iosTrash'
import {ic_add_circle} from 'react-icons-kit/md/ic_add_circle'
import {iosSearchStrong} from 'react-icons-kit/ionicons/iosSearchStrong'
import {ic_clear} from 'react-icons-kit/md/ic_clear'

class Associados extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            combos: [],
            filter: [],
            filterChanged: '',
            data: []
        };
        this.getData = this.getData.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.filterData = this.filterData.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    populaLotacao(item, id) {
        if (item.type === 'lotacao'){
            return (
                <option value={item.value} key={id}>{item.display}</option>  
            )
        }
    }

    populaSituacao(item, id) {
        if (item.type === 'situacao'){
            return (
                <option value={item.value} key={id}>{item.display}</option>  
            )
        }
    }

    async componentDidMount() {
        //Busca valores para combo de filtro
        //Lotação
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getLotacoes').then(r => r.json()).then(async r => {
            let combosLotacao = this.state.combos
            await asyncForEach(r, async (item)=>{
               let lotacao = {
                    type: 'lotacao',
                    display: item.descricao,
                    value: item.pk_lot
                }
                await combosLotacao.push(lotacao)
            })
        })  
        //Situação
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getSituacoes').then(r => r.json()).then(async r => {
            let combosSituacao = this.state.combos
            await asyncForEach(r, async (item)=>{
               let situacao = {
                    type: 'situacao',
                    display: item.descricao,
                    value: item.pk_sit
                }
                await combosSituacao.push(situacao)
            })
        })        


        //Carregar Parâmetros de pesquisa
        let query = {}
        query.filtered = getParameterByName('filtered')
        query.nome = getParameterByName('nome')
        query.matricula = getParameterByName('matricula')
        query.lotacao = getParameterByName('lotacao')
        query.data_nasc_max = getParameterByName('data_nasc_max')
        query.data_nasc_min = getParameterByName('data_nasc_min')
        query.situacao = getParameterByName('situacao')
        query.rg = getParameterByName('rg')
        query.cpf = getParameterByName('cpf')

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
                fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/deleteAssociado?pk='+pk, {
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
        window.history.replaceState({filtered: false}, 'filter', "/associados") //Apaga QueryURL
        this.setState({filter: []}) 
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

                //Filtro: Matrícula
                let matricula = (item.matricula || '').includes((filter.matricula || '').toUpperCase())
                if (filter.matricula) {
                    if (queryString === '?') {
                        queryString = queryString + 'matricula=' + filter.matricula
                    } else queryString = queryString + '&matricula=' + filter.matricula
                }

                //Filtro: Lotação
                let lotacao = (Number(item.fk_lot) === Number(filter.lotacao)) || (filter.lotacao || 'T') === 'T'
                if (filter.lotacao) {
                    if (queryString === '?') {
                        queryString = queryString + 'lotacao=' + filter.lotacao
                    } else queryString = queryString + '&lotacao=' + filter.lotacao
                }

                //Filtro: Data de Nascimento
                let data_nasc_min = true
                if (!isNaN((new Date((filter.data_nasc_min || '')+'T00:00:00')).getTime())) {
                    if (moment(new Date((item.data_nasc.split('T')[0] || '')+'T12:00:00')).isSameOrAfter((new Date((filter.data_nasc_min || '')+'T00:00:00')))){
                        data_nasc_min = true
                    } else data_nasc_min = false
                }
                if (filter.data_nasc_min) {
                    if (queryString === '?') {
                        queryString = queryString + 'data_nasc_min=' + filter.data_nasc_min
                    } else queryString = queryString + '&data_nasc_min=' + filter.data_nasc_min
                }
                let data_nasc_max = true
                if (!isNaN((new Date((filter.data_nasc_max || '')+'T00:00:00')).getTime())) {
                    if (moment(new Date((item.data_nasc.split('T')[0] || '')+'T12:00:00')).isSameOrBefore((new Date((filter.data_nasc_max || '')+'T00:00:00')))){
                        data_nasc_max = true
                    } else data_nasc_max = false
                }
                if (filter.data_nasc_max) {
                    if (queryString === '?') {
                        queryString = queryString + 'data_nasc_max=' + filter.data_nasc_max
                    } else queryString = queryString + '&data_nasc_max=' + filter.data_nasc_max
                }

                //Filtro: Situação
                let situacao = (Number(item.fk_sit) === Number(filter.situacao)) || (filter.situacao || 'T') === 'T'
                if (filter.situacao) {
                    if (queryString === '?') {
                        queryString = queryString + 'situacao=' + filter.situacao
                    } else queryString = queryString + '&situacao=' + filter.situacao
                }

                //Filtro: RG
                let rg = (item.rg || '').includes((filter.rg || '').toUpperCase())
                if (filter.rg) {
                    if (queryString === '?') {
                        queryString = queryString + 'rg=' + filter.rg
                    } else queryString = queryString + '&rg=' + filter.rg
                }

                //Filtro: CPF
                let cpf = (item.cpf || '').includes((filter.cpf || '').toUpperCase())
                if (filter.cpf) {
                    if (queryString === '?') {
                        queryString = queryString + 'cpf=' + filter.cpf
                    } else queryString = queryString + '&cpf=' + filter.cpf
                }

                //Monta Query URL
                if (queryString !== '?') {
                    window.history.replaceState({filtered: true}, 'filter', "/associados"+queryString+"&filtered=true")
                } else {
                    window.history.replaceState({filtered: true}, 'filter', "/associados")                
                }

                //Filtra
                return nome && matricula && rg && cpf && lotacao && situacao && data_nasc_max && data_nasc_min
            })
            resolve(filtered)
        })        
    }

    getData(e) {
        //Busca, filtra e trata os dados
        e.preventDefault()
        //Busca
        fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getAssociados').then(r => r.json()).then(async r => {
            //Filtra
            let items = await this.filterData(r)
            //Trata
            items = await this.modelingData(items)
            this.setState({data: items})
        })
    }

    render() {
        let lotacoes = this.state.combos.map(this.populaLotacao)
        let situacoes = this.state.combos.map(this.populaSituacao)
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
                        <h3 className="headerCadastro">Cadastro de Associados</h3>
                    </div>
                    {/*********************** Filtros ***********************/}
                    <div className="boxFiltros">
                        {/* Parâmetros de pesquisa:<br/> */}
                        <div className="filtros">
                            <div className="column-filter">
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Nome</label>
                                    <input name="nome" type="text" id='filtroNome' className="inputFiltro" style={{width: '50vw'}} value={this.state.filter.nome || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Lotação</label>
                                    <select name="lotacao" id='filtroLotacao' className="selectFiltro" value={this.state.filter.lotacao || 'T'} onChange={this.handleChange}>
                                        <option value="">TODOS</option>
                                        {lotacoes}
                                    </select>
                                </div>
                                <br/>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Dt. Nascimento</label>
                                    <input type="date" name="data_nasc_min" id='filtroNome' className="inputFiltro" style={{width: '140px'}} value={this.state.filter.data_nasc_min || ''} onChange={this.handleChange}></input>
                                    <input type="date" name="data_nasc_max" id='filtroNome' className="inputFiltro" style={{width: '140px'}} value={this.state.filter.data_nasc_max || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Situação</label>
                                    <select name="situacao" id='filtroSituacao' className="selectFiltro" value={this.state.filter.situacao || ''} onChange={this.handleChange}>
                                        <option value="">TODAS</option>
                                        {situacoes}
                                    </select>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">Matrícula</label>
                                    <input name="matricula" type="text" id='filtroMatricula' className="inputFiltro"  style={{width: '100px'}} value={this.state.filter.matricula || ''} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">RG</label>
                                    <input name="rg" type="text" id='filtroRg' className="inputFiltro" value={this.state.filter.rg || ''}  style={{width: '100px'}} onChange={this.handleChange}></input>
                                </div>
                                <div className='itemFiltro'>
                                    <label className="labelFiltro">CPF</label>
                                    <input name="cpf" type="text" id='filtroCPF' className="inputFiltro" value={this.state.filter.cpf || ''}  style={{width: '110px'}} onChange={this.handleChange}></input>
                                </div>
                            </div>
                            <br/>
                            <div className="column-filter-2">
                                <button className="buttonFiltroProcessar" onClick={this.getData}><Icon size={20} style={{ display: "inline" }} icon={iosSearchStrong}></Icon>Processar</button>
                                <button className="buttonFiltroLimpar" onClick={this.handleClean}><Icon size={20} style={{ display: "inline" }} icon={ic_clear}></Icon>Limpar</button>
                                <LinkContainer to={"/associados/registro"}>
                                    <button className="buttonNovo"><Icon size={20} style={{ display: "inline" }} icon={ic_add_circle}></Icon>Novo Registro</button>
                                </LinkContainer> 
                            </div>
                        </div> 
                    </div>
                    {/*********************** Tabela ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
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
                                        Header: "Matrícula",
                                        accessor: "matricula",
                                        width: 100
                                    },
                                    {
                                        Header: "Associado",
                                        accessor: "nome",
                                        width: 400
                                    },
                                    {
                                        Header: "CPF",
                                        accessor: "cpf",
                                        width: 110
                                    },
                                    {
                                        Header: "RG",
                                        accessor: "rg",
                                        width: 110
                                    },
                                    {
                                        Header: "Lotação",
                                        accessor: "nomelot",
                                        width: 100
                                    },
                                    {
                                        Header: "Dt Nasc",
                                        accessor: "data_nasc",
                                        width: 90
                                    },
                                    {
                                        Header: "Situação",
                                        accessor: "nomesit"
                                    },
                                    {
                                        Header: "Código",
                                        accessor: "pk_ass",
                                        show: false
                                    }
                                ]}
                                defaultSorted={[
                                    {
                                        id: "matricula",
                                        desc: true
                                    }
                                ]}
                                defaultPageSize={10}
                                className="-striped -highlight"
                                SubComponent={row => {
                                    return (
                                        <div className="buttonsDetail">
                                            <LinkContainer to={"/associados/dependentes?pk="+row.row.pk_ass}>
                                                <button className="buttonDetail"><Icon size={20} style={{ display: "inline" }} icon={iosContact}></Icon>Dependentes</button>
                                            </LinkContainer>                                    
                                            <LinkContainer to={"/associados/celulares?pk="+row.row.pk_ass}>
                                                <button className="buttonDetail"><Icon size={20} icon={iphone}></Icon>Celulares</button>
                                            </LinkContainer>
                                            <LinkContainer to={"/associados/registro?pk="+row.row.pk_ass}>
                                                <button className="buttonDetail"><Icon size={20} icon={edit}></Icon>Editar</button>
                                            </LinkContainer>
                                            <button className="buttonDetail" onClick={(e) => {this.handleDelete(e, row.row.pk_ass)}} name={row.row.pk_ass}><Icon size={20} icon={iosTrash}></Icon>Excluir</button>
                                        </div>
                                    );
                                }}
                                /> 
                            </div>  
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Associados;
