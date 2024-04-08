/**
 * @fileoverview BlogPostCommentArea.jsx
 * This component renders the page in which all
 * comments to selected blogpost are shown.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

import React from 'react'
import { useEffect, useState } from 'react';
import { Button, ListGroup } from "react-bootstrap";
import AddBlogPostComment from '../AddBlogPostComment/AddBlogPostComment';


const BlogPostCommentArea = ({blogPostId, commentsArray, setUpdateCommentFlag}) => {
    
    /** Those states are used to track comment update/delete: 
     *  set functions are passed down to child components, so that they can trigger
     *  a refresh of the comment list whenever a new comment gets updated/deleted
    */
    const [isCommentUpdated, setIsCommentUpdated] = useState(false);    
    const [isCommentDeleted, setIsCommentDeleted] = useState(false);

    const session = JSON.parse(localStorage.getItem('auth'));

    const handleDelete = (ev, commentId) => {
        deleteComment(commentId)
    }
    
    /**
     * deleteComment
     * This function performs a fetch operation against
     * the configured API to delete the specified comment from the remote database.
     */
    const deleteComment = async (commentId) => {
          try {
              const res = await fetch(process.env.REACT_APP_FRONTEND_SERVER_URL+"/blogPosts/"+blogPostId+"/comment/" + commentId, {
                method: "DELETE",
                headers: {
                  Authorization: session,
                },
              });
              if(res.ok) {
                setIsCommentDeleted(true)
                alert("Comment was successfully deleted.")
              } else {
                throw new Error(res.status)
              }
             
            } catch (err) {
              console.log(err.message);
              alert("The request was not processed correctly. Please, try again.")
            }
  
      }

    /** Any change in the isCommentAdded, isCommentDeleted states should trigger a refresh of the comments */
    useEffect(() => {
        if((isCommentUpdated || isCommentDeleted))
        {
            setUpdateCommentFlag(true)
            setIsCommentDeleted(false);
            setIsCommentUpdated(false);
        }
    }, [isCommentUpdated, isCommentDeleted])
    
    return (
        <ListGroup as = "ol">
            {
                
                commentsArray ? 
                (
                    commentsArray.map(comment => 
                    <ListGroup.Item
                        as="li"
                        key={comment.commentId}
                        className="d-flex justify-content-between align-items-start"
                        variant = "primary"
                    >
                        <>
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">
                                    {comment.commentAuthorName} says:
                                </div>
                                {/* <div className="fw-bold">
                                    {comment.commentAuthorAvatar}
                                </div> */}
                                {comment.content}
                            </div>
                        </>         
                        <Button variant = "secondary" style={{marginInlineStart: '3px'}} onClick={ev => handleDelete(ev, comment.commentId)}>X</Button>
                    </ListGroup.Item>)                    
                ) : 
                ("")
            }
            <AddBlogPostComment blogPostId = {blogPostId} commentUpdated = {setIsCommentUpdated}/>
        </ListGroup>        
    )
}

export default BlogPostCommentArea