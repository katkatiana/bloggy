import { jwtDecode } from "jwt-decode";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "../pages/LoginPage";


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

const ProtectedRoutes = () => {

    const isAuthorized = auth()

    return isAuthorized ? <Outlet /> : <LoginPage />
  
}

export default ProtectedRoutes;