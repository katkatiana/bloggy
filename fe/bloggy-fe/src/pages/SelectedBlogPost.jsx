/**
 * @fileoverview SelectedBlogPost.jsx
 * This component renders the message of correct login and 
 * redirection to the homepage.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react';
import BlogPostDetails from '../components/BlogPostDetails/BlogPostDetails';
import Navbar from '../components/Navbar/Navbar'

/******** Component Definition  *************************************************/

/**
 * SelectedBlogPost
 * This component renders the NavBar and BlogPostDetails components.
 * This component is rendered when the route /blogPost/id gets triggered, when the user
 * clicks on the button that redirects to the blogpost specific page.
 * @returns the instantiation of NavBar and BlogPostDetails component.
 */
const SelectedBlogPost = () => {
  return (
    
    <>
        <Navbar/>
        <BlogPostDetails/>
    </>
  )
}

export default SelectedBlogPost;