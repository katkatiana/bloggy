import { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import AddBlogPost from '../AddBlogPost/AddBlogPost';
import './Main.css'


const Main = () => {

    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [isPostAdded , setIsPostAdded] = useState(false);
    const [blogPosts, setBlogPosts] = useState([]);
    const session = JSON.parse(localStorage.getItem('auth'));

    window.onpopstate = () => {
        alert("You will be logged out.")
        localStorage.removeItem('auth');
    }

    const getBlogPosts = async () => {
        try{
            const response = await fetch("http://localhost:3030/blogPosts", {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                    "authorization": session
                }
            })
            if(response.ok) {
                const data = await response.json();
                setIsFetchCompleted(true)
                setError(false)
                setBlogPosts(data)
              } else {
                throw new Error(response.status)
              }
        } catch(e) {
            console.error('Error fetching blog posts:', e);
            setError(true)
            setIsFetchCompleted(false)
        }
    }


    useEffect( () => {
        getBlogPosts()
        setIsPostAdded(false)
    }, [isPostAdded])


    return (
        <>
            <Navbar />
            <Container>
                <AddBlogPost postAdded = {setIsPostAdded} />
                <Row>
                    {
                        error || !isFetchCompleted ? <Spinner animation="border" variant="warning" /> : ""
                    }
                    {
                        !error && isFetchCompleted ? 
                        blogPosts.map(blogPost => {
                                return(
                                    <Col key = {blogPost._id} style={{display: 'flex'}}> 
                                        <Card style={{ width: '12rem' }}>
                                            <Card.Img variant="top" src = {blogPost.cover} className = 'card-img' />
                                            <Card.Body>
                                                <Card.Title className = 'title-blog-post truncate'>
                                                    {blogPost.title}
                                                </Card.Title>
                                                <Card.Text
                                                    className='truncate'
                                                >
                                                    {blogPost.content}
                                                </Card.Text>
                                                <Link to = {`/blogPost/${blogPost._id}`}>
                                                    <Button data-testid="btn-link" variant="primary">Read more</Button>
                                                </Link>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                )
                        }) : ""
                        
                    }
                </Row>
            </Container>
               
        </>
    )
}

export default Main;