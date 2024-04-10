/**
 * @fileoverview BlogPostDetails.jsx
 * This component renders the page in which the
 * details of the specified blogpost are shown.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import { Container, Row, Col } from 'react-bootstrap';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import BlogPostCommentArea from '../BlogPostCommentArea/BlogPostCommentArea';


/******** Component Definition  *************************************************/

/**
 * BlogPostDetails
 * This component renders the layout of the page built to show
 * the details of the specified blogpost object.
 * The layout also includes a separated component, BlogPostCommentArea, which
 * renders the comments associated to the selected book.
 * No parameters are given through props, anyway the component reads the ID
 * of the selected blogpost through url params (useParams).
 * @returns Instantiation of the elements that contain the blogpost details,
 * and also the instantiation of BlogPostCommentArea component.
 */
const BlogPostDetails = () => {

    /** id of the selected post, passed through url Params */
    let { id } = useParams();
    const session = JSON.parse(localStorage.getItem('auth'));

    /******** Internal Variables  ***************************************************/

    const [blogPost, setBlogPost] = useState({
      title: '',
      author : { name: '' , avatar : ''} ,
      readTime : { value: '', unit: ''} ,
      content: '',
      cover: '',
      comments: []
    });

    const [isFetchCompleted, setIsFetchCompleted] = useState(false);
    const [updateCommentFlag, setUpdateCommentFlag] = useState(false);
    const [error, setError] = useState(false);

    /**
     * getBlogPost
     * Method: GET
     * This function performs a fetch operation against
     * the configured API to retrieve the initial list of blogposts.
     * @returns On a successful fetch, the blogPost state is filled with 
     * the blogpost-objects to show.
     * If any kind of error occurs during the Fetch operation,
     * an Exception is raised and the Error is signalled through
     * the error internal state.
     */
    const getBlogPost = async () => {
      try{
          const response = await fetch(process.env.REACT_APP_FRONTEND_SERVER_URL+"/blogPosts/"+id, {
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
              setBlogPost(data)
            } else {
              throw new Error(response.status)
            }
      } catch(e) {
          console.error('Error fetching blog posts:', e);
          setError(true)
          setIsFetchCompleted(false)
          setBlogPost({});
      }
    }

    useEffect( () => {
      /** Retrieve the initial set of blogposts and populate the blogpost  state: only done on first render */
        getBlogPost();
    }, [])

    useEffect( () => {
      /** Retrieve the initial set of blogposts and populate the blogpost state: on updatedBlogPostFlag change */
      getBlogPost();
      setUpdateCommentFlag(false);
  }, [updateCommentFlag])

    const selectedBlogPost = blogPost;

    /** The retrieved blogposts are shown only when the fetch has been correctly completed. */
    return (
        <>
        {
          (error || !isFetchCompleted) ? 
          <Spinner animation="border" variant="warning" /> : 
          <Container className='blog-post-details-container'>
          <Row>
            <Col>              
              <img src = {`${selectedBlogPost.cover}`} alt = "post-img" />
              <p>Written by: {`${selectedBlogPost.author.name}`}</p>
              <h4>{`${selectedBlogPost.title}`}</h4>
              <p>{`${selectedBlogPost.readTime.value} ${selectedBlogPost.readTime.unit}`} read</p>
              <p>{`${selectedBlogPost.content}`}</p>              
            </Col>
            <Col>
              <BlogPostCommentArea blogPostId = {selectedBlogPost._id} commentsArray = {selectedBlogPost.comments} setUpdateCommentFlag={setUpdateCommentFlag}/>
            </Col>
          </Row>
        </Container>
        }
        </>
      )
}

export default BlogPostDetails