import React from 'react';
import LoginForm from '../components/LoginForm/LoginForm';
import { useEffect, useState } from 'react';

const LoginPage = () => {

    useEffect( () => {
        if(localStorage.getItem("auth")){
            localStorage.removeItem('auth');
        }        
    }, [])

    return (
        <LoginForm />
        )
}


export default LoginPage;
