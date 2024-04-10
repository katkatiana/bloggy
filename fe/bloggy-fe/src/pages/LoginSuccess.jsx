/**
 * @fileoverview LoginSuccess.jsx
 * This component renders the message of correct login and 
 * redirection to the homepage.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


/******** Component Definition  *************************************************/

/**
 * LoginSuccess
 * This component renders a message of successful login in case of 
 * detected token key.
 * @returns a div with the above mentioned message.
 */
const LoginSuccess = () => {

  /******** Internal Variables  ***************************************************/

  const params  = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const navigate = useNavigate();

  /** Only at the initial render the token key will be searched in local storage.
   * if found, the user will be redirected to homepage, else it will stay in the login page.
   */

  useEffect(() => {

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