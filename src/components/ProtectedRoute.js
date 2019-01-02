import React, { Component } from 'react';
import {Route, Redirect} from 'react-router-dom';

class ProtectedRoute extends Component {
     constructor(props, context) {
        super(props, context);
        this.state = {
            authenticated : false
        };

    }

    componentWillMount() {
        let strAuth = sessionStorage['authApergs'] || JSON.stringify({ authenticated: false, user: 0 })
        let auth = JSON.parse(strAuth) 
        console.log(auth.authenticated)
        this.setState({ authenticated: auth.authenticated })
        console.log(this.state.authenticated)
    }

    render() {
        const { component: Component, ...props } = this.props
        return (
            <Route 
                {...props} 
                render={props => (
                this.state.authenticated ?
                    <Component {...props} /> :
                    <Redirect to='/login' />
                )} 
            />
        )
    }
}

export default ProtectedRoute;