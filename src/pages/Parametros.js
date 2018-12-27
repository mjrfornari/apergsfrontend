import React, { Component } from 'react';
import config from '../config'
import NavBar from '../components/NavBar'
import Autocomplete from '../components/Autocomplete'
import '../css/Default.css';
// import {LinkContainer}  from 'react-router-bootstrap'
import {Tabs, Tab} from 'react-bootstrap'
import "react-table/react-table.css";
import { asyncForEach, populateForm } from '../Utils'
import swal from 'sweetalert';

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




class Parametros extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            combos: [],
            filter: [],
            selected: {
                cidade: []
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
        this.selectCidade = this.selectCidade.bind(this);
    }

    selectCidade(item){
        this.setState({ selected: {
            cidade: item
        }})
    }

    async componentDidMount() {
        //Busca valores para combo de filtro
        //Cidades
        await fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getCidades').then(r => r.json()).then(async r => {
            let combosCidades = this.state.combos
            await asyncForEach(r, async (item)=>{
               let cidades = {
                    type: 'cidades',
                    display: item.descricao,
                    value: item.pk_cid
                }
                await combosCidades.push(cidades)
            })
        }) 

        this.setState({combos: this.state.combos})


        fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/getParametros?pk=999').then(r => r.json()).then(async r => {
            if (typeof r[0] === 'undefined') {
                window.location.href = '/home'
            } else {
                let selectedCidade = this.state.combos.filter((item) => { return item.type==='cidades' && item.value===r[0].fk_cid })
                this.setState({ selected: {
                    cidade: selectedCidade[0],
                }})
                let form = document.getElementById('registroParametros');
                populateForm(form, r[0])
            }

        })
        this.setState({edit: true})



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
        const form = document.getElementById('registroParametros');
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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/editParametros?pk=999', {
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
            fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/novoParametro', {
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
        let cidades = this.state.combos.filter((item) => { return item.type==='cidades' })
        return (
            <div className="boxSite colorSettings">
                {/***************** Barra de Navegação *******************/}
                <div className="boxNavBar">
                    <NavBar selected="Parametros"></NavBar>
                </div>
                {/***************** Tela do WebSite *******************/}
                <div className="boxTela">
                    {/*********************** Header ***********************/}
                    <div className="boxHeader">
                        <h3 className="headerCadastro">Parâmetros</h3>
                    </div>
                    {/*********************** Campos ***********************/}
                    <div style={{ paddingBottom: '30px'}}>
                        <div style={{ marginLeft: '30px', marginRight: '30px', paddingBottom: "30px" }}>
                            <form id="registroParametros" name="registroParametros" onSubmit={ this.submitData }>
                                <div style={{ height:'auto' }}>
                                    <Tabs defaultActiveKey={1} animation={false} id="uncontrolled-tab-example">
                                        <Tab eventKey={1} title="Principal">
                                            <div style={{ paddingTop: '30px' }}>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <label htmlFor="nome_fantasia">Nome fantasia:</label>
                                                        <input type="text" name="nome_fantasia" className="form-control"/>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label htmlFor="razao_social">Razão social:</label>
                                                        <input type="text" name="razao_social" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label htmlFor="cnpj">CNPJ:</label>
                                                        <input type="text" name="cnpj" className="form-control" maxLength="14" />
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <label htmlFor="endereco">Endereço:</label>
                                                        <input type="text" name="endereco" className="form-control" />
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <label htmlFor="bairro">Bairro:</label>
                                                        <input type="text" name="bairro" className="form-control"/>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <label htmlFor="cep">CEP:</label>
                                                        <input type="text" name="cep" className="form-control"/>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div>
                                                            <label htmlFor="cidade">Cidade:</label>
                                                            <Autocomplete field="fk_cid" items={cidades} inModal="" selected={this.state.selected.cidade} select={this.selectCidade}></Autocomplete>
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

export default Parametros;
