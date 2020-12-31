import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from 'react-bootstrap'
import './LoginComponent.scss'

const LoginComponent = (props) => {

    localStorage.setItem("camunda-roles",
        JSON.stringify({
            roles: {
                composer : false,
                editor1: false,
                editor2: false,
                editor3: false
            },
            users: {
                composer: "composerUser",
                editor1: "editor1User",
                editor2: "editor2User",
                editor3: "editor3User"
            }
        })
    )

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const onUsernameChange = (e) => { setUsername(e.target.value) }
    const onPasswordChange = (e) => { setPassword(e.target.value) }

    const login = () => {
        let camunda_roles = localStorage.getItem("camunda-roles")
        camunda_roles = JSON.parse(camunda_roles)
        for (const [key, value] of Object.entries(camunda_roles.users)) {
            if (value === username){
                console.log("logged in as ",key);
                localStorage.setItem("role",key)
            }
        }
        if (localStorage.getItem("role") === "composer"){
            props.history.push({
                pathname: '/compose',
                role: "composer"
            })
        }
        if (localStorage.getItem("role") === "editor1"){
            props.history.push({
                pathname: '/tasklist',
                role: "editor1"
            })
        }
        if (localStorage.getItem("role") === "editor2"){
            props.history.push({
                pathname: '/tasklist',
                role: "editor2"
            })
        }
        if (localStorage.getItem("role") === "editor3"){
            props.history.push({
                pathname: '/tasklist',
                role: "editor3"
            })
        }
        
    }

    const logout = () => {
        localStorage.setItem("camunda-roles",
            JSON.stringify({
                roles: {
                    composer : false,
                    editor1: false,
                    editor2: false,
                    editor3: false
                },
                users: {
                    composer: "composerUser",
                    editor1: "editor1User",
                    editor2: "editor2User",
                    editor3: "editor3User"
                }
            })
        )
        localStorage.removeItem("role");
    }

    return (  
        <div className="content">
            <div className="login">
                <input type="text" onChange={(e)=>onUsernameChange(e)} placeholder="Username"/>
                <input type="password" onChange={(e)=>onPasswordChange(e)} placeholder="Password"/>
                <Button variant="primary" onClick={(e)=>login(e)} type="submit">Login</Button>
                <Button variant="primary" onClick={(e)=>logout(e)} type="submit">Logout</Button>
            </div>
        </div>
    );
}
 
export default LoginComponent;