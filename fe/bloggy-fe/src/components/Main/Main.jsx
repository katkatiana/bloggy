/**
 * @fileoverview Main.jsx
 * This component renders the page in which all
 * blogposts are shown.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

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

/******** Component Definition  *************************************************/

/**
 * Main
 * This component defines the layout of the blogposts to show and 
 * renders the AddBlogPost and Navbar components.
 * @returns the blogposts list and the instantiation of the components mentioned above.
 */
const Main = () => {

    /******** Internal Variables  ***************************************************/

    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [error, setError] = useState(false);
    const [isPostAdded , setIsPostAdded] = useState(false);
    const [blogPosts, setBlogPosts] = useState([]);
    const session = JSON.parse(localStorage.getItem('auth'));

    /**
     * This function performs a fetch operation against the configured
     * API to get all blogposts to be shown.
     * Method: GET
     * On a successful fetch, blogPosts status is filled with all blogposts.
     * If any kind of error occurs during the Fetch operation,
     * an Exception is raised and the Error is signalled through
     * the error internal state.
     */
    const getBlogPosts = async () => {
        try{
            const response = await fetch(process.env.REACT_APP_FRONTEND_SERVER_URL+"/blogPosts", {
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

    /** Any change in the isPostAdded state should trigger a refresh of the blogposts */
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