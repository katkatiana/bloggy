/**
 * @fileoverview Navbar.jsx
 * This component renders the NavBar of the application.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { jwtDecode } from "jwt-decode";
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

/******** Component Definition  *************************************************/

/**
 * Navbar
 * This component defines the layout of the navigation bar and allows 
 * the user to log out.
 */
function MyNav() {

  /******** Internal Variables  ***************************************************/

  const [currentUser, setCurrentUser] = useState('')
  const [loggedIn, setLoggedIn] = useState(false);
  const token = localStorage.getItem('auth');
  const navigate = useNavigate();

  /**
   * This function decodes the author name from the jwt token generated with all authors infos.
   * @returns the author name if any token is found in local storage.
   */
  const getAuthorName = () => {
    let name;
    
    if(token){
        const decoded = jwtDecode(token);
        const firstName = decoded.firstName;
        const lastName = decoded.lastName;
        name = firstName + ' ' + lastName;
    } else {
        name = ''
    }

    return name
  }

  /**
   * This functions is triggered anytime a user presses the Log out button and removes
   * the authorization token while redirecting to the login page.
   */
  const handleLogout = () => {
    localStorage.removeItem('auth');
    alert('Logout succesful');
    navigate('/');
  }

  /** When token key is detected, the function to get the author name is triggered 
   * in order to show it in the navbar section and the loggedIn state is updated. 
   * If no token is found, the user is logged out.
   */

  useEffect( () => {
    if(token){
      setLoggedIn(true)
      const authorName = getAuthorName();
      if(authorName.length > 0) {
        setCurrentUser(authorName)
      } else {
        setCurrentUser('unknown')
      }
    } else {
      setLoggedIn(false)
    }
  }, [token])

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container className = "navbar">
        <Navbar.Brand href="#home">Bloggy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="me-auto user-name-welcome">
            {
              loggedIn ? <div>  Hi, {`${currentUser}`}  <button type = "button" onClick = {handleLogout}>Log out</button></div> : ''
            }
          </Nav>
      </Container>
    </Navbar>
  );
}

export default MyNav;