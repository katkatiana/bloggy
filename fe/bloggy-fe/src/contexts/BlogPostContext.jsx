/**
 * @fileoverview BookContext.js
 * Defines the context that holds the book object which are passed
 * down to the other components.
 * @author Mariakatia Santangelo
 * @date   01-03-2024
 */

/******** Import Section  *******************************************************/
import React, { createContext, useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
/******** Internal Variables  ***************************************************/

/**
 * Context used to pass down the books retrieved from the API
 * to whichever component may need to access them.
 * This is the variable which is actually exported.
 */
const BlogPostContext = createContext([]);

/******** Component Definition  *************************************************/

/**
 * BooksProvider
 * Component that is intended to define a context usable by all the other
 * children components. 
 * This context provides all the children elements with information on
 * the initial book-list as obtained from the configured API. 
 * @param {*} children The children elements which are to be contained in BooksProvider element.
 * @returns If the fetch operation is successfully completed, returns the BooksProvider
 * element along with the children components.
 */
const BlogPostsProvider = ({ children }) => {

    /** Holds the book objects retrieved from the configured API. */
    const [blogPostsFromApi, setBlogPostsFromApi] = useState([]);
    const session = JSON.parse(localStorage.getItem('auth'));

    /**
     * getBooks
     * This function performs a fetch operation against
     * the configured API to retrieve the initial list of books.
     * @param None
     * @returns On a successfull fetch, the booksFromApi state is 
     * filled with the book-objects to show.
     * If any kind of error occurs during the Fetch operation,
     * an Exception is raised and the Error is signalled through
     * the error internal state.
     */
    const getBlogPosts =  async () => {    
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
                  setBlogPostsFromApi(data)
                } else {
                  throw new Error(response.status)
                }
          } catch(e) {
              console.error('Error fetching blog posts:', e);
          }
    };

    /** The retrieved books are passed down as a context only when the fetch has been correctly completed. */
    return (
      <>
        {
          <BlogPostContext.Provider value = { {blogPostsFromApi, getBlogPosts} } >
            {children}
          </BlogPostContext.Provider>       
        }
      </> 
    )
  }
    
    export { BlogPostContext, BlogPostsProvider };
    