/**
 * @fileoverview AddBlogPost.jsx
 * This component renders the page in which it is 
 * possible to add new blogpost(s).
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */


/******** Import Section  *******************************************************/

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

/******** Component Definition  *************************************************/

/**
 * This component renders modal containing text areas that can be used to input
 * a new blogpost.
 * @param {*} postAdded the callback to be called if blogpost get posted
 * @returns the instantiation of the modal component, along with the elements needed for
 * the post process.
 */
function AddBlogPost({ postAdded }) {

/******** Internal Variables  ***************************************************/

  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [isFetchCompleted, setIsFetchCompleted] = useState(false);
  const [formData, setFormData] = useState(
    {
        title: '',
        cover: '',
        content: ''
    }
);


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  /**
   * handleOnChange
   * This function just collects all the input parameters and fills the formData
   * accordingly, also checking their value for correctness.
   * @param ev Event object, which can be inspected for target, value, etc.
   */
  const handleOnChange = async (ev) => {
    ev.preventDefault();
    const {name, value} = ev.target;
    setFormData({
        ...formData,
        [name] : value
    })
    console.log(formData)
  }
  
  /**
   * This function decodes the author name from the jwt token generated with all authors infos.
   * @returns the author name if any token is found in local storage.
   */
  const getAuthorName = () => {
    
    const token = localStorage.getItem('auth');
    let name;
    
    if(token){
        const decoded = jwtDecode(token);

        const firstName = decoded.firstName;
        const lastName = decoded.lastName;
        name = firstName + ' ' + lastName;
    } else {
        alert('Your token is not valid');
        name = ''
    }

    return name
  }

    /**
   * This function decodes the author email from the jwt token generated with all authors infos.
   * @returns the author email if any token is found in local storage.
   */
  const getAuthorEmail = () => {
    const token = localStorage.getItem('auth');
    let email;
    
    if(token){
        const decoded = jwtDecode(token);

        email = decoded.email
    } else {
        alert('Your token is not valid');
        email = ''
    }

    return email
  }

  /**
   * This function calculates the reading time of a blogpost based
   * on the number of words detected.
   * @param text. the content of any blogpost passed to the function.
   * @returns the reading time calculated dividing the number of words detected and the number of 
   * word read in a minute according to average.
   */
  const calculateReadingTime = (text) => {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);

    return time
  }
   /**
   * This function submits the body of a blogpost and sends it to the server 
   * in order to add it.
   * Method: POST
   * @param ev Event object, which prevents default.
   * On a successful fetch, pastAdded prop is called to notify
   * the upper layers that a blogpost has been posted.
   * If any kind of error occurs during the Fetch operation,
   * an Exception is raised and the Error is signalled through
   * the error internal state.
   */
  const handleOnSubmit = async (ev) => {
    ev.preventDefault()    

    const authorName = getAuthorName() 
    const authorEmail = getAuthorEmail() 

    const readingTime = calculateReadingTime(formData.content)

    const body = {
                    "title": formData.title,
                    "cover": formData.cover,
                    "readTime": {
                        "value": readingTime,
                        "unit": 'min'
                    },
                    "author": {
                        "name": authorName,
                        "email": authorEmail
                    },
                    "content": formData.content
                }

    await axios(
        {
            method: 'post',
            url: process.env.REACT_APP_FRONTEND_SERVER_URL+'/addBlogPost',
            data: body,
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        }
)
    .then((res) => {
        console.log(res);
        if(res.status === 201) {
            alert('Your blog post was added!')
            postAdded(true)
            handleClose()
        }
    })
    .catch((err) => {
        console.log("error", err)
        postAdded(false)
        alert("Please, try again.")
    })
      
} 

//   const addData = async () => {
//     try{
//         const body = {
//             "title": formData.title,
//             "cover": formData.cover,
//             "readTime": {
//                 "value": formData.readTime.value,
//                 "unit": formData.readTime.unit
//             },
//             "author": {
//                 "name": formData.author.name
//             },
//             "content": formData.content
//         }
//         console.log(body)
//         const response = await fetch( "http://localhost:3030/addBlogPost", {
//             method: "POST",
//             body : JSON.stringify(body),
//             headers: {
//             "Content-Type": "application/json",
//             },
//         });
//         if(response.ok) {
//             setIsFetchCompleted(true);
//             setError(false);
//             alert("Your post was successfully added");
//         } else {
//             throw new Error(response.status)
//         }
//         } catch(err) {
//             console.log("error: ", err.message);
//             setError(true);
//             setIsFetchCompleted(false);
//             alert("The request was not processed correctly. Please, try again.")
//         }
//     }

  return (
    <>
        <Button 
            variant = "primary" 
            onClick = {handleShow}
            className = 'my-4'
        >
        Add new post
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Title</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter your title" 
                        name = "title"
                        onChange={handleOnChange}
                        />
                </Form.Group>

                <Form.Group 
                    className = "mb-3" 
                    controlId="formBasicAvatar"
                >
                <Form.Label>Cover</Form.Label>
                <Form.Control 
                    type = "file" 
                    name = 'cover' 
                    accept = '.png, .jpg, .jpeg'
                    //value = {signupForm.avatar}
                    placeholder = "Cover" 
                    onChange = { ev => setFormData({...formData, cover: ev.target.files[0]}) }    
                />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Post</Form.Label>
                    <Form.Control 
                        as = 'textarea'
                        rows = {4}
                        type="text" 
                        placeholder = "write here your post"
                        name = "content"
                        onChange={handleOnChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Accept terms and conditions" />
                </Form.Group>
                <Button 
                    variant="primary" 
                    type="submit"
                    onClick={handleOnSubmit}
                >
                    Submit
                </Button>
            </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddBlogPost;