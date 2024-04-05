import { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import AddBlogPost from '../AddBlogPost/AddBlogPost';


const Main = () => {

    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [blogPosts, setBlogPosts] = useState([]);
    const session = JSON.parse(localStorage.getItem('auth'));


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
    }, [])


    return (
        <>
            <Navbar />
            <Container>
                <AddBlogPost />
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
                                            <Card.Img variant="top" src = {blogPost.cover} />
                                            <Card.Body>
                                                <Card.Title>
                                                    {blogPost.title}
                                                </Card.Title>
                                                <Card.Text>
                                                    {blogPost.content}
                                                </Card.Text>
                                                <Button variant="primary">Read more</Button>
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