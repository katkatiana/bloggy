import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'


const SignupForm = () => {

    const navigate = useNavigate();
    const [signupForm, setSignupForm] = useState( 
            {   
                firstName: '',
                lastName: '',
                email: '', 
                password: '',
                passwordConf: '',
                avatar: '',
                dateOfBirth: new Date().toLocaleDateString()
            }
        );
        console.log(signupForm.dateOfBirth)
    
    
    const handleOnChange = (ev) => {
        ev.preventDefault();
        
        const {name, value} = ev.target;
        setSignupForm({
            ...signupForm,
            [name] : value 
        })
    }

    const checkInput = () => {
        let retFlag = true;
        if(signupForm.password !== signupForm.passwordConf) {
            retFlag = false
        }

        return retFlag
    }

     const handleOnSubmit = async (ev) => {
        ev.preventDefault()

        if(!checkInput()) {
            alert("Please, check that your passwords match.")
        } else{
            await axios(
                {
                    method: 'post',
                    url: process.env.REACT_APP_FRONTEND_SERVER_URL+'/createUser',
                    data: signupForm,
                    headers: {
                        "Content-Type": 'multipart/form-data'
                    }
                }
        )
            .then((res) => {
                console.log(res);
                if(res.status === 201) {
                    alert('Sign up successfull.')
                    navigate('/')
                }
            })
            .catch((err) => {
                console.log("error", err)
                if(err.response.status === 409) {
                    alert('Email already existing.')
                } else {
                    alert("Please, try again.")
                }            
            })
        }       
    } 

    return (
        <>
            <Navbar />
            <Form 
                className = 'signup-form'
                onSubmit = {handleOnSubmit}
            >
                <Form.Group 
                    className="mb-3" 
                    controlId="formBasicFirstName"
                >
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                    type = "string" 
                    name = 'firstName' 
                    value = {signupForm.firstName}
                    placeholder = "Enter your first name"
                    onChange = {handleOnChange}    
                />
                </Form.Group>

                <Form.Group 
                    className="mb-3" 
                    controlId="formBasicLastname"
                >
                <Form.Label>Last Name</Form.Label>
                <Form.Control 
                    type = "string" 
                    name = 'lastName' 
                    value = {signupForm.lastName}
                    placeholder = "Enter your last name"
                    onChange = {handleOnChange}    
                />
                </Form.Group>

                <Form.Group 
                    className="mb-3" 
                    controlId="formBasicEmail"
                >
                <Form.Label>Email address</Form.Label>
                <Form.Control 
                    type = "email" 
                    name = 'email' 
                    value = {signupForm.email}
                    placeholder = "Enter email"
                    onChange = {handleOnChange}    
                />
                <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                </Form.Text>
                </Form.Group>
        
                <Form.Group 
                    className = "mb-3" 
                    controlId="formBasicPassword"
                >
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type = "password" 
                    name = 'password' 
                    value = {signupForm.password}
                    placeholder = "Password" 
                    onChange = {handleOnChange}    
                />
                </Form.Group>

                <Form.Group 
                    className = "mb-3" 
                    controlId="formBasicPasswordConf"
                >
                <Form.Label>Repeat your password</Form.Label>
                <Form.Control 
                    type = "password" 
                    name = 'passwordConf' 
                    value = {signupForm.passwordConf}
                    placeholder = "Repeat your password" 
                    onChange = {handleOnChange}    
                />
                </Form.Group>

                <Form.Group 
                    className = "mb-3" 
                    controlId="formBasicAvatar"
                >
                <Form.Label>Avatar</Form.Label>
                <Form.Control 
                    type = "file" 
                    name = 'avatar' 
                    accept = '.png, .jpg, .jpeg'
                    //value = {signupForm.avatar}
                    placeholder = "Avatar" 
                    onChange = { ev => setSignupForm({...signupForm, avatar: ev.target.files[0]}) }    
                />
                </Form.Group>

                <Form.Group 
                    className = "mb-3" 
                    controlId="formBasicDateOfBirth"
                >
                <Form.Label>Date of Birth</Form.Label>
                <DatePicker
                    dateFormat = 'dd-MM-yyyy'
                    onChange = { date => setSignupForm({...signupForm, dateOfBirth : date.toLocaleDateString()})} 
                    selected = { signupForm.dateOfBirth }
                />
                </Form.Group>

                <Button 
                    variant = "primary" 
                    type = "submit" 
                >
                    Sign up
                </Button>
            </Form>
        </>
        )
}

export default SignupForm;