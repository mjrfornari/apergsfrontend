import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import '../css/Default.css';
// import {LinkContainer}  from 'react-router-bootstrap'
import {Tabs, Tab} from 'react-bootstrap'
import "react-table/react-table.css";
import { asyncForEach, getParameterByName, populateForm, setInputFilter, dateSql } from '../Utils'
import swal from 'sweetalert';
import Autocomplete from '../components/Autocomplete'

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
            filter: [],
            selected: {
                cidadeComerc: []
            },
            filterChanged: '',
            edit: false,
            data: []
        };
        this.submitData = this.submitData.bind(this)
        this.handleChange = this.handleChange.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.selectCidadeComerc = this.selectCidadeComerc.bind(this);
        this.selectCidadeResid = this.selectCidadeResid.bind(this);
    }

    selectCidadeComerc(item){
        let selected = this.state.selected
        selected.cidadeComerc = item
        this.setState({ selected: selected})
    }

    selectCidadeResid(item){
        let selected = this.state.selected
        selected.cidadeResid = item
        this.setState({ selected: selected})
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

    populaCidade(item, id) {
        if (item.type === 'cidade'){
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
            this.setState({combos: combosLotacao})
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
            this.setState({combos: combosSituacao})
        })    
        
        //Categoria
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCategoriasAssociados').then(r => r.json()).then(async r => {
            let combosCategoria = this.state.combos
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
        
        //Cidades
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCidades').then(r => r.json()).then(async r => {
            let combosCidades = this.state.combos
            await asyncForEach(r, async (item)=>{
               let cidades = {
                    type: 'cidade',
                    display: item.descricao,
                    value: item.pk_cid
                }
                // console.log(cidades)
                await combosCidades.push(cidades)
            })
            // console.log(combosCidades)
            this.setState({combos: combosCidades})
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
        
        setInputFilter(document.getElementById("carteira_unimed_global"), function(value) {
            return /^-?\d*$/.test(value);
        });

        setInputFilter(document.getElementById("carteira_unimed_odonto"), function(value) {
            return /^-?\d*$/.test(value);
        });

        setInputFilter(document.getElementById("carteira_unimed_ambulat"), function(value) {
            return /^-?\d*$/.test(value);
        });

        setInputFilter(document.getElementById("carteira_unimed_hospitalar"), function(value) {
            return /^-?\d*$/.test(value);
        });

        //Testar se é edição
        let query = {}
        query.pk = Number(getParameterByName('pk'))

        if (query.pk > 0) {
            
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getAssociados?pk='+query.pk).then(r => r.json()).then(async r => {
                if (typeof r[0] === 'undefined') {
                    window.location.href = '/associados'
                } else {
                    let form = document.getElementById('registroAssociados');
                    let selectedCidadeComerc = this.state.combos.filter((item) => { return item.type==='cidade' && item.value===r[0].fk_cid_comerc })
                    let selectedCidadeResid = this.state.combos.filter((item) => { return item.type==='cidade' && item.value===r[0].fk_cid_resid })
                    this.setState({ selected: {
                        cidadeComerc: selectedCidadeComerc[0],
                        cidadeResid: selectedCidadeResid[0]
                    }})
                    r[0].data_nasc = dateSql(r[0].data_nasc)
                    r[0].data_rg = dateSql(r[0].data_rg)
                    populateForm(form, r[0])
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

    }

    handleSave(e) {
        e.preventDefault()
        this.submitData(e)
    }

    handleBack(e) {
        e.preventDefault()
        swal({
            dangerMode: true,
            title: "Atenção!",
            text: "Ao voltar, todas as alterações serão descartadas. Confirma?",
            buttons: ["Não", "Sim"],
        }).then((result) => {
            if (result) window.history.back()
        });
    }


    submitData(e) {
        e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('registroAssociados');
        const data = new FormData(form);

        //Trata valores conforme data-parse dos inputs
        for (let name of data.keys()) {
            const input = form.elements[name]

            //Rejeita type = undefined (radio inputs)
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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editAssociado?pk='+getParameterByName('pk'), {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: json
            }).then(r=>r.json()).then(r=>{
                console.log(r)
                if (r.message === "Success!") {
                    swal("Alteração realizada", "Registro alterado com sucesso!", "success").then((result) => {
                        window.history.back()
                    });
                } else {
                    swal("Alteração não realizada", "Registro não foi alterado. Verifique os campos.", "error");
                }
            })
        } else {
             //Inserir
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoAssociado', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: json
            }).then(r=>r.json()).then(r=>{
                console.log(r)
                if (r.message === "Success!") {
                    swal("Inclusão realizada", "Registro incluído com sucesso!", "success").then((result) => {
                        window.history.back()
                    });
                } else {
                    swal("Inclusão não realizada", "Registro não foi incluído. Verifique os campos.", "error");
                }
            })
        }

       

        

    }

    render() {
        let lotacoes = this.state.combos.map(this.populaLotacao)
        // let situacoes = this.state.combos.map(this.populaSituacao)
        let categorias = this.state.combos.map(this.populaCategoria)
        let bancos = this.state.combos.map(this.populaBanco)
        let cidades = this.state.combos.filter((item) => { return item.type==='cidade' })
        console.log(cidades)
        console.log(this.state.combos)
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
                        <h3 className="headerCadastro">Registro de Associado</h3>
                    </div>
                    {/*********************** Campos ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
                        <div style={{ marginLeft: '30px', marginRight: '30px', paddingBottom: "30px" }}>
                            <form id="registroAssociados" name="registroAssociados" onSubmit={ this.submitData }>
                                <div style={{ height:'auto' }}>
                                    <Tabs defaultActiveKey={1} animation={false} id="uncontrolled-tab-example">
                                        <Tab eventKey={1} title="Principal">
                                            <div style={{ paddingTop: '30px' }}>
                                                <div className="row">
                                                    <div className="col-sm-3"  style={{ width: '150px'}}>
                                                        <label>Matrícula:</label>
                                                        <input type="text" id="matricula" name="matricula" className="form-control" maxLength="10" data-parse="number" />
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <label>Nome:</label>
                                                        <input type="text" id="nome" name="nome" data-parse="uppercase" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '150px'}}>
                                                    <label>RG:</label>
                                                        <input type="text" id="rg" name="rg" className="form-control" maxLength="10" data-parse="number"/>
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '180px'}}>
                                                        <label>Data expedição:</label>
                                                        <input type="date" id="data_rg" name="data_rg" className="form-control"/>
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '130px'}}>
                                                        <label>Orgão expedidor:</label>
                                                        <input type="text" id="orgao_expedidor" name="orgao_expedidor" className="form-control" data-parse="uppercase"/>
                                                    </div>
                                                    <div className="col-sm-3" style={{ width: '150px'}}>
                                                        <label >CPF:</label>
                                                        <input type="text" id="cpf" name="cpf" className="form-control" maxLength="11" data-parse="number"/>
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <label >Nome do Pai:</label>
                                                        <input type="text" id="nome_pai" name="nome_pai" className="form-control" data-parse="uppercase"/>
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <label>Nome da Mãe:</label>
                                                        <input type="text" id="nome_mae" name="nome_mae" className="form-control" data-parse="uppercase"/>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <div className="col-sm-9" style={{ marginLeft: '-15px' }}>
                                                            <label>Email pessoal:</label>
                                                            <input type="email" name="email_resid" className="form-control notUpper" />
                                                        </div>
                                                        <br/>
                                                        <div className="col-sm-3" style={{ marginLeft: '-15px' }}>
                                                            <div className="form-check" >
                                                                <input type="checkbox" className="check" data-parse="uppercase" name="envia_email_resid" value="S"/>Enviar Email
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <div className="col-sm-9" style={{ marginLeft: '-15px'}}>
                                                            <label>Email comercial:</label>
                                                            <input type="email" name="email_comerc" className="form-control notUpper" />
                                                        </div>
                                                        <br/>
                                                        <div className="col-sm-3"  style={{ marginLeft: '-15px'}}>
                                                            <input type="checkbox" className="check" data-parse="uppercase" name="envia_email_com" value="S"/> Enviar email
                                                        </div>
                                                    </div>
                                                        
                                                    <div className="col-sm-2"  style={{ width: '150px'}}>
                                                        <label >Sexo:</label>
                                                        <select name="sexo" id="sexo" data-parse="uppercase" className="form-control">
                                                            <option value="N">Selecione</option>
                                                            <option value="M">Masculino</option>
                                                            <option value="F">Feminino</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-sm-2"  style={{ width: '150px'}}>
                                                        <label >Estado civil:</label>
                                                        <select name="estado_civil" id="estado_civil" data-parse="uppercase" className="form-control">
                                                            <option value="N">Selecione</option>
                                                            <option value="S">Solteiro</option>
                                                            <option value="C">Casado</option>
                                                            <option value="P">Separado</option>
                                                            <option value="D">Divorciado</option>
                                                            <option value="V">Viúvo</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '180px'}}>
                                                    <label >Data nascimento:</label>
                                                        <input type="date" name="data_nasc" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-3" style={{ width: '200px'}}>
                                                        <label >Nr. OAB:</label>
                                                        <input type="text" name="nro_oab" data-parse="number" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-3" style={{ width: '200px'}}>
                                                        <label >Lotação:</label>
                                                        <select name="fk_lot" className="form-control" data-parse="uppercase" required="required">
                                                            <option value="N">Selecione</option>
                                                            {lotacoes}
                                                        </select>
                                                    </div>
                                                    <div className="col-sm-3" style={{ width: '230px'}}>
                                                        <label >Categoria de Associado:</label>
                                                        <select name="fk_cat" id="fk_cat" className="form-control" data-parse="uppercase" required="required" >
                                                            <option value="N">Selecione</option>
                                                            {categorias}
                                                        </select>
                                                    </div>
                                                    <div className="col-sm-12" style={{ marginTop: '10px' }}>
                                                        <input type="checkbox" className="check" data-parse="uppercase" name="ativo" value="A"/> Ativo
                                                    </div>
                                                    <div className="col-sm-12" style={{ marginTop: '10px' }}>
                                                        <input type="checkbox" className="check" data-parse="uppercase" name="falecido" value="S"/> Falecido
                                                    </div>
                                                    <div className="col-sm-12" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                                        <input type="checkbox" className="check" data-parse="uppercase" name="whatsapp" value="N"/> Habilitado para receber mensagens whatsapp
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <label>Observações:</label>
                                                        <textarea type="text" name="observacoes" data-parse="uppercase" className="form-control" style={{ height: '100px' }}  />
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={2} title="End. Comercial">
                                            <div style={{paddingTop: '30px'}}>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <label>Endereço:</label>
                                                        <input type="text" name="logradouro_comerc" data-parse="uppercase" className="form-control"/>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label>Bairro:</label>
                                                        <input type="text" name="bairro_comerc" data-parse="uppercase" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label>Cidade:</label>
                                                        <Autocomplete field="fk_cid_comerc" items={cidades} inModal="" selected={this.state.selected.cidadeComerc || []} select={this.selectCidadeComerc}></Autocomplete>
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '120px'}}>
                                                        <label>CEP:</label>
                                                        <input type="text" name="cep_comerc" data-parse="number" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '180px'}}>
                                                        <label>Telefone comercial:</label>
                                                        <input type="text" data-parse="number" name="telefone_comerc" className="form-control"  />
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={3} title="End. Residêncial">
                                            <div style={{paddingTop: '30px'}}>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <label>Endereço:</label>
                                                        <input type="text" data-parse="uppercase" name="endereco_resid" className="form-control"  />
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label>Bairro:</label>
                                                        <input type="text" data-parse="uppercase" name="bairro_resid" className="form-control"  />
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label>Cidade:</label>
                                                        <Autocomplete field="fk_cid_resid" items={cidades} inModal="" selected={this.state.selected.cidadeResid || []} select={this.selectCidadeResid}></Autocomplete>
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '120px'}}>
                                                        <label>CEP:</label>
                                                        <input type="text" data-parse="number" name="cep_resid" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-2" style={{ width: '180px'}}>
                                                        <label>Telefone residencial:</label>
                                                        <input type="text" data-parse="number" name="telefone_resid" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                        <Tab eventKey={4} title="Cobrança">
                                            <div style={{paddingTop: '30px'}}>
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <legend>Dados bancários:</legend>
                                                        <label>Banco:</label>
                                                        <select name="fk_bco" data-parse="uppercase" className="form-control" style={{ width: '200px'}}>
                                                            <option value="N">Selecione</option>
                                                            {bancos}
                                                        </select>
                                                        <label>Agência:</label>
                                                        <input type="text" name="agencia" data-parse="uppercase" className="form-control" style={{ width: '100px'}}/>
                                                        <label>Conta:</label>
                                                        <input type="text" name="conta" data-parse="uppercase" className="form-control" style={{ width: '130px'}}/>
                                                    </div>
                                                    <br/>
                                                    <div className="col-sm-8">
                                                        <legend>Formas de Cobrança</legend>
                                                        <div className="row" style={{ marginLeft: '0' }}>
                                                            <label>Mensalidades:</label>
                                                            <input type="radio" name="cobranca_mensalidade" value="B"/> Banco
                                                            <input type="radio" name="cobranca_mensalidade" value="T"/> Tesouro
                                                        </div>
                                                        <hr />
                                                        <div className="row">
                                                            <div className="col-sm-5">
                                                                <label>Unimed:</label>
                                                                <input type="radio" name="cobranca_unimed" value="B"/> Banco
                                                                <input type="radio" name="cobranca_unimed" value="T"/> Tesouro
                                                            </div>
                                                            <div className="col-sm-7">
                                                                <input type="checkbox" name="unimed_hospitalar" id="unimed_hospitalar" value="S"/> Hospitalar
                                                                <input type="checkbox" name="unimed_ambulatorial" value="S"/> Ambulatorial
                                                                <input type="checkbox" name="unimed_global" value="S"/> Global
                                                                <input type="checkbox" name="unimed_sos" value="S"/> SOS
                                                                <input type="checkbox" name="unimed_odonto" value="S"/> Odonto
                                                            </div>
                                                            <div style={{ paddingTop: '30px' }}>
                                                                <div className="col-sm-6">
                                                                    Número Carteira Global:
                                                                    <input type="text" id="carteira_unimed_global" name="carteira_unimed_global" className="form-control" maxLength="10" />
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    Número Carteira Ambulatorial:
                                                                    <input type="text" id="carteira_unimed_ambulat" name="carteira_unimed_ambulat" className="form-control" maxLength="10" />
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    Número Carteira Odonto:
                                                                    <input type="text" id="carteira_unimed_hospitalar" name="carteira_unimed_hospitalar" className="form-control" maxLength="10" />
                                                                </div>
                                                                <div className="col-sm-6">
                                                                    Número Carteira Odonto:
                                                                    <input type="text" id="carteira_unimed_odonto" name="carteira_unimed_odonto" className="form-control" maxLength="10" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div className="row">
                                                            <div className="col-sm-5">
                                                                <label>Telefonia:</label>
                                                                <input type="radio" name="cobranca_telefonia" value="B"/> Banco
                                                                <input type="radio" name="cobranca_telefonia" value="T"/> Tesouro
                                                            </div>
                                                            <div className="col-sm-7">
                                                                <input type="checkbox" name="telefonia_vivo" value="S"/> Vivo
                                                                <input type="checkbox" name="telefonia_claro" value="S"/> Claro
                                                            </div>
                                                        </div>
                                                        <hr />
                                                        <div className="row">
                                                            <div className="col-sm-5">
                                                                <label>Outros serviços:</label>
                                                                <input type="radio" name="cobranca_servicos" value="B"/> Banco
                                                                <input type="radio" name="cobranca_servicos" value="T"/> Tesouro
                                                            </div>
                                                            <div className="col-sm-7">
                                                                <input type="checkbox" name="anape" value="S"/> ANAPE
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                                <br/>
                                <div className="buttonsCadastro">
                                    <button className="buttonSalvar" onClick={this.handleSave}>Salvar</button>
                                    <button className="buttonVoltar" onClick={this.handleBack}>Voltar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegistroAssociados;
