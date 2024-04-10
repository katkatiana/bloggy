/**
 * @fileoverview NotFound.jsx
 * This component renders any page which does not exist as route
 * of the application.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import Spinner from 'react-bootstrap/Spinner';

/******** Component Definition  *************************************************/

/**
 * NotFound
 * This component renders a message of not found along with a Spinner.
 * @returns the message mentioned above.
 */
const NotFound = () => {
    return(
        <>
            <Spinner animation="border" variant="danger" />
            <div>Sorry, this page does not exist yet...</div>
        </>
    )
}

export default NotFound;