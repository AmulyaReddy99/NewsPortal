import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import './LoginComponent.scss'

const LoginComponent = () => {
    return (  
        <div class="content">
            <div class="login">
                <input type="text" placeholder="Username"/>
                <input type="password" placeholder="Password"/>
                <Button variant="primary" type="submit">Login</Button>
            </div>
        </div>
    );
}
 
export default LoginComponent;