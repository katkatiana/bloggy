import Spinner from 'react-bootstrap/Spinner';

const NotFound = () => {
    return(
        <>
            <Spinner animation="border" variant="danger" />
            <div>Sorry, this page does not exist yet...</div>
        </>
    )
}

export default NotFound;