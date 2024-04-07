import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { jwtDecode } from "jwt-decode";
import './Navbar.css';
import { useNavigate } from 'react-router-dom';


function MyNav() {

  const [currentUser, setCurrentUser] = useState('')
  const [loggedIn, setLoggedIn] = useState(false);
  const token = localStorage.getItem('auth');
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('auth');
    alert('Logout succesful');
    navigate('/');
  }

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
        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
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