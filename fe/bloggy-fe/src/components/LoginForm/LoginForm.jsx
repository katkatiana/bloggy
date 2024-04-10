/**
 * @fileoverview LoginForm.jsx
 * This component renders the page in which it is 
 * possible to login after compiling login form.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import './LoginForm.css'

/******** Component Definition  *************************************************/

/**
 * LoginForm
 * This component renders the text areas that can be used to input
 * a new login with already existing users. It also has the new registration
 * option as a button that will redirect to SignUpForm component.
 * @returns Instantiation of the elements that contain the login form.
 */
const LoginForm = () => {

    /******** Internal Variables  ***************************************************/

    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const [loginForm, setLoginForm] = useState( 
            {
                email: '', 
                password: '',
            }
        );

    /**
     * handleOnChange
     * This function just collects all the input parameters and fills the formData
     * accordingly, also checking their value for correctness.
     * @param ev Event object, which can be inspected for target, value, etc.
     */
    const handleOnChange = (ev) => {
        ev.preventDefault();
        const {name, value} = ev.target;
        setLoginForm({
            ...loginForm,
            [name] : value 
        })
    }

    /**
     * handleOnClickGithubLogin
     * This function redirects to the github login
     */
    const handleOnClickGithubLogin = () => {
        window.location.href = process.env.REACT_APP_FRONTEND_SERVER_URL+'/auth/github' 
    }

    /**
     * goToSignUp
     * This function redirects to the sign up page
     */
    const goToSignUp = () => {
        navigate('/signup')
    }
    
    /**
     * handleOnSubmit
     * Method: POST
     * This function performs a fetch operation against
     * the configured API to log the user after checking its data.
     * The function gets the inputs from the formData state.
     * On a successful fetch, a token for the user session is added to local storage
     * and the user is redirected to the home page.
     * If any kind of error occurs during the Fetch operation, 
     * the Error is signalled through the error internal state.
     * @param {*} ev 
     */
    const handleOnSubmit = async (ev) => {
        ev.preventDefault()

        await axios
        .post(
            process.env.REACT_APP_FRONTEND_SERVER_URL+'/login',
            loginForm
        )
        .then((res) => {
            console.log(res);
            if(res.status === 200) {
                alert('Login successful')
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
        <>
            <Navbar />
            <Form 
                className = 'login-form'
                onSubmit = {handleOnSubmit}
            >
                <Form.Group 
                    className="mb-3 single-login-area" 
                    controlId="formBasicEmail"
                >
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
        
                <Form.Group 
                    className = "mb-3 single-login-area" 
                    controlId="formBasicPassword"
                >
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

                <Button 
                    variant = "dark" 
                    type = "button" 
                    onClick = {handleOnClickGithubLogin}
                >
                Login with GitHub
                </Button>

            <p>Not registered yet?</p>
            <Button 
                variant = "warning" 
                type = "button" 
                onClick = {goToSignUp}
                >
                Sign Up
            </Button>
            </Form>
        </>
        )
}

export default LoginForm;