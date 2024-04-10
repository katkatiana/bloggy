/**
 * @fileoverview ProtectedRoutes.js
 * This component protects the Homepage and SelectedBlogPost pages in order to check 
 * if the user is authorized by token key to access these routes.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

/**
 * This function check if any token is stored in the local storage.
 * @returns bool
 */
const auth = () => {

    let token = JSON.parse(localStorage.getItem('auth'));
    if(!token) {
        return false
    } else {
        return true;
    }
}

// const useSession = () => {
    
//     const location = useLocation()
//     const navigate = useNavigate()
//     const token = auth();

//     useEffect(() => {
        
//         if (location.pathname !== '/home') {
//             console.log("Taking you to /")
//             navigate('/')
//         } else {
//             console.log("Taking you to /home")
//             navigate('/home', {replace: true})
//         }
//     }, [navigate, token]);
// }

/**
 * This function check the eventual authorization to navigate the Homepage. 
 * If not so, the user will be redirected to LoginPage.
 */
const ProtectedRoutes = () => {

    const isAuthorized = auth()

    return isAuthorized ? <Outlet /> : <LoginPage />
  
}

export default ProtectedRoutes;