import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';


function AddBlogPost() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [isFetchCompleted, setIsFetchCompleted] = useState(false);
  const [formData, setFormData] = useState({});


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

  const addData = async () => {
    try{
        const body = {
            "title": formData.title,
            "cover": formData.image,
            "readTime": {
                "value": formData.readTime.value,
                "unit": formData.readTime.unit
            },
            "author": {
                "name": formData.author.name
            },
            "content": formData.content
        }
        console.log(body)
        const response = await fetch( "http://localhost:3030/addBlogPost", {
            method: "POST",
            body : JSON.stringify(body),
            headers: {
            "Content-Type": "application/json",
            },
        });
        if(response.ok) {
            setIsFetchCompleted(true);
            setError(false);
            alert("Your post was successfully added");
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

    const handleSave = () => {
            addData()
    }

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

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Image Link</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder = "add link to your image"
                        name = "image"
                        onChange={handleOnChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Read time</Form.Label>
                    <Form.Control 
                        type="number" 
                        placeholder = "how long does it take to read this?"
                        name = "read-time-value"
                        onChange={handleOnChange} 
                    />
                    <Form.Control 
                        type="text" 
                        placeholder = "seconds, minutes, hours...days?"
                        name = "read-time-unit"
                        onChange={handleOnChange} 
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Author</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder = "add author's name"
                        name = "author" 
                        onChange={handleOnChange}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Post</Form.Label>
                    <Form.Control 
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
                    onClick={handleSave}
                >
                    Submit
                </Button>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddBlogPost;