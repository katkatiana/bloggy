import React from 'react'
import { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { jwtDecode } from "jwt-decode";


function AddBlogPostComment({blogPostId, commentUpdated}) {
  
    const [show, setShow] = useState(false);

    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [formData, setFormData] = useState({});
    const [isCommentValid, setIsCommentValid] = useState(false);

    const session = JSON.parse(localStorage.getItem('auth'));
    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
     * This function performs a fetch operation against
     * the configured API to post the new comment in the remote database.
     * The function gets the inputs from the formData state.
     * @param None
     * @returns None
     * On a successfull fetch, commentUpdated prop is called to notify
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
     * @returns None
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
   * handleUpdate
   * This function is triggered when the Save button is pressed.
   * It starts the POST request if the required inputs are valid.
   * @param None
   * @returns None
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