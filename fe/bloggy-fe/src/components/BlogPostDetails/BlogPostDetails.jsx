/**
 * @fileoverview BookDetails.jsx
 * This component renders the page in which the
 * details of the specified book are shown.
 * @author Mariakatia Santangelo
 * @date   01-03-2024
 */

/******** Import Section  *******************************************************/

import { Container, Row, Col } from 'react-bootstrap';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import BlogPostCommentArea from '../BlogPostCommentArea/BlogPostCommentArea';




/******** Internal Variables  ***************************************************/

/******** Component Definition  *************************************************/

/**
 * BookDetails
 * This component renders the layout of the page built to show
 * the details of the specified book object.
 * The layout also includes a separated component, MyCommentArea, which
 * renders the comments associated to the selected book.
 * @param {*} None 
 * No parameters are given through props, anyway the component reads the asin
 * of the selected book through url params (useParams).
 * @returns Instantiation of the elements that contain the book details,
 * and also the instantiation of MyCommentArea component.
 */
const BlogPostDetails = () => {

    /** id of the selected post, passed through url Params */
    let { id } = useParams();
    const session = JSON.parse(localStorage.getItem('auth'));

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
        getBlogPost();
    }, [])

    useEffect( () => {
      getBlogPost();
      setUpdateCommentFlag(false);
  }, [updateCommentFlag])

    const selectedBlogPost = blogPost;

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