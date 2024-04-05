import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
    
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const [loginForm, setLoginForm] = useState( 
            {
                email: '', 
                password: '',
            }
        );

    const handleOnChange = (ev) => {
        ev.preventDefault();
        const {name, value} = ev.target;
        setLoginForm({
            ...loginForm,
            [name] : value 
        })
    }
    
    const handleOnSubmit = async (ev) => {
        ev.preventDefault()

        await axios
        .post(
            'http://localhost:3030/login',
            loginForm
        )
        .then((res) => {
            console.log(res);
            if(res.status === 200) {
                alert('Login successfull')
                localStorage.setItem('auth', JSON.stringify(res.data.token))
                navigate('/home')
            }
        })
        .catch((err) => {
            console.log("error", err)
            alert("Incorrect email or password. Please, try again.")
        })
    }

    return (
        <Form onSubmit = {handleOnSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
                type = "email" 
                name = 'email' 
                value = {loginForm.email}
                placeholder = "Enter email"
                onChange = {handleOnChange}    
            />
            <Form.Text className="text-muted">
                We'll never share your email with anyone else.
            </Form.Text>
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control 
                type = "password" 
                name = 'password' 
                value = {loginForm.password}
                placeholder = "Password" 
                onChange = {handleOnChange}    
            />
            </Form.Group>

            <Button 
            variant = "primary" 
            type = "submit" >
            Login
            </Button>
        </Form>
        )
}


export default LoginPage;
