import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


function AddBlogPost({ postAdded }) {
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

  const handleOnChange = async (ev) => {
    ev.preventDefault();
    const {name, value} = ev.target;
    setFormData({
        ...formData,
        [name] : value
    })
    console.log(formData)
  }

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

  const calculateReadingTime = (text) => {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);

    return time
  }

  const handleOnSubmit = async (ev) => {
    ev.preventDefault()

    if(/*!checkInput()*/false) {
        alert("Please, check that your passwords match.")
    } else{

        const authorName = getAuthorName() /* todo: check author name */
        const authorEmail = getAuthorEmail() /* todo: check author email */

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
                url: 'http://localhost:3030/addBlogPost',
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