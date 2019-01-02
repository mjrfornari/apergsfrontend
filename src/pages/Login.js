import React, { Component } from 'react';
import "../css/Login.css";
import {login} from 'react-icons-kit/ikons/login'
import { Icon } from 'react-icons-kit'
import config from '../config'
import swal from 'sweetalert';
// import {LinkContainer} from 'react-router-bootstrap'


class Login extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {

        };

    }

    login(e){
        e.preventDefault();
        //Pega valores do form
        const form = document.getElementById('loginForm');
        const data = new FormData(form);

        // console.log(data.get('user'), data.get('password'))

        //Converte FormData em JSON
        var object = {};
        data.forEach(function(value, key){
            object[key] = value;
        });
        var json = JSON.stringify(object);

        fetch(config.protocol+'://'+config.server+':'+config.portBackend+'/api/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: json
        }).then(r=>r.json()).then(r=>{
            console.log(r)
            sessionStorage['authApergs'] = JSON.stringify(r)
            if (r.authenticated === true) {
                window.location.href = '/home'
            } else {
                swal("Erro!", "Usuário ou senha incorretos. Tente novamente.", "error");
            }
        })
        

    }

    componentDidMount() {
        let strAuth = sessionStorage['authApergs'] || JSON.stringify({ authenticated: false, user: 0 })
        let auth = JSON.parse(strAuth) 
        if (auth.authenticated) window.location.href = '/home'
    }

    render() {
        return (
            <div className="boxSite colorSettings">
                <img alt="Contas a Receber" src={require('../imgs/ApergsPNG.png')} title="Associados" className="logoLogin"/>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto centerLogin">
                            <div className="card card-signin my-5">
                                <div className="card-body">
                                    <h5 className="card-title text-center headerLogin">Login</h5>
                                    <form className="form-signin" id="loginForm" onSubmit={this.login}>
                                        <div className="form-label-group">
                                            <input type="text" id="user" name="user" className="form-control" placeholder="Usuário" required autoFocus/>
                                            <label htmlFor="user">Usuário</label>
                                        </div>

                                        <div className="form-label-group">
                                            <input type="password" id="password" name="password" className="form-control" placeholder="Senha" required/>
                                            <label htmlFor="password">Senha</label>
                                        </div>

                                        <button className="buttonLogin" type="submit">
                                            <Icon size={20} icon={login}></Icon>
                                            <p className='buttonLoginText'>Entrar</p> 
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
