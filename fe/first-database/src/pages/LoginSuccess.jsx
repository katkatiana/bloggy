import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginSuccess = () => {

  const params  = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const navigate = useNavigate();

  useEffect(() => {

    console.log(token);

    if(token) {
      localStorage.setItem('auth', JSON.stringify(token))
      navigate('/home')
    } else {
      alert('Login failed. Please, try again.')
      navigate('/')
    }
  }, [])
  

  return (
    <div>You are being redirected...</div>
  )
}

export default LoginSuccess;