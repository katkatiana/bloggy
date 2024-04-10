/**
 * @fileoverview AddBlogPostComment.jsx
 * This component renders the page form in which it is 
 * possible to add new comment(s) to existing blogpost(s).
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react'
import { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { jwtDecode } from "jwt-decode";


/******** Component Definition  *************************************************/

/**
 * This component renders modal containing text areas that can be used to input
 * a new comment to an existing blogpost.
 * @param blogPostId the ID of the blogpost to which we are posting a new comment.
 * @param commentUpdated callback to be called if comment to blogpost get posted
 * @returns the instantiation of the modal component, along with the elements needed for
 * the post process.
 */
function AddBlogPostComment({blogPostId, commentUpdated}) {
  
    /******** Internal Variables  ***************************************************/

    const [show, setShow] = useState(false);
    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [formData, setFormData] = useState({});
    const [isCommentValid, setIsCommentValid] = useState(false);

    const session = JSON.parse(localStorage.getItem('auth'));
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
     * This function decodes the author avatar from the jwt token generated with all authors infos.
     * @returns the author avatar if any token is found in local storage.
     */
    const getAuthorAvatar = () => {
        const token = localStorage.getItem('auth');
        let avatar;
        
        if(token){
            const decoded = jwtDecode(token);
            console.log(decoded)
            avatar = decoded.avatar;
        } else {
            alert('Your token is not valid');
            avatar = ''
        }
    
        return avatar
    }


    /**
     * addData
     * Method: POST
     * This function performs a fetch operation against
     * the configured API to post the new comment in the remote database.
     * The function gets the inputs from the formData state.
     * On a successful fetch, commentUpdated prop is called to notify
     * the upper layers that a comment has been posted.
     * If any kind of error occurs during the Fetch operation,
     * an Exception is raised and the Error is signalled through
     * the error internal state.
     */
    const addData = async () => {
        try{
            const body = {
                "content": formData.comment,
                "blogPostId": blogPostId,
                "commentAuthorName": getAuthorName(),
                "commentAuthorAvatar" : getAuthorAvatar()
            }
            const response = await fetch(process.env.REACT_APP_FRONTEND_SERVER_URL+"/blogPosts/"+blogPostId+"/addComment", {
                method: "POST",
                body : JSON.stringify(body),
                headers: {
                "Authorization": session,
                "Content-Type": "application/json",
                },
            });
            if(response.ok) {
                setIsFetchCompleted(true);
                setError(false);
                commentUpdated(true)
                alert("Your comment was successfully added");
            } else {
                throw new Error(response.status)
            }
        } catch(err) {
            console.log("error: ", err.message);
            setError(true);
            setIsFetchCompleted(false);
            alert("The request was not processed correctly. Please, try again.")
        }
    }

    /**
     * handleOnChange
     * This function just collects all the input parameters and fills the formData
     * accordingly, also checking their value for correctness.
     * @param ev Event object, which can be inspected for target, value, etc.
     */
    const handleOnChange = async (ev) => {
        ev.preventDefault();
        const {name, value} = ev.target;
        
        /** Check for empty value */
        if((name === "comment")){
            if(value === ""){
                setIsCommentValid(false)
            } else {
                setIsCommentValid(true)
                setFormData({
                    ...formData,
                    [name] : value 
                })
            }
        }
    }

  /**
   * handleSave
   * This function is triggered when the Save button is pressed.
   * It starts the POST request if the required inputs are valid.
   */
    const handleSave = () => {
        if(isCommentValid){
            addData()
            handleClose()
        } else {
            alert("Check if any input has invalid value.")
        }
    }  
  
  
  
    return (
        <>
        <Button variant="primary" onClick={handleShow}>
        Add comment
        </Button>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Your comment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                >
                    <Form.Label>Your comment here</Form.Label>
                    <Form.Control
                    as="textarea" 
                    rows={3} 
                    name = "comment"
                    onChange={handleOnChange}
                    />
                </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                Close
                </Button>
                <Button variant="primary" type="submit" onClick={handleSave}>
                Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
  )
}

export default AddBlogPostComment