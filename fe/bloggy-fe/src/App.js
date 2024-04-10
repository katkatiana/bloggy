/**
 * @fileoverview App.js
 * Main entry point of the application.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ProtectedRoutes from "./middleware/ProtectedRoutes"
import SignupPage from "./pages/SignupPage";
import LoginSuccess from "./pages/LoginSuccess";
import SelectedBlogPost from "./pages/SelectedBlogPost";

/******** Component Definition  *************************************************/

/**
 * App
 * This file represents the main entry point of the application.
 * It acts as a gateway, as it defines the main routes of the application
 * and allows navigating to them.
 * @returns The following routes:
 * - route to the log in page of the application (/)
 * - route to the signup page of the application (/signup)
 * - route to the successful log in page of the application (/success)
 * - route to the home page of the application (/home)
 * - route to the page that shows the details of the selected book (/blogPost/<id_of_the_blogpost>)
 * - route to the default page shown when a bad URL is entered (404 - not found)
 */
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route  exact path = '/' element = {<LoginPage /> } />
          <Route  path = '/signup' element = {<SignupPage /> } />
          <Route  path = '/success' element = {<LoginSuccess /> } />
          <Route element = { <ProtectedRoutes />} >
                <Route path = '/home' element = { <HomePage />} />
                <Route path = '/blogPost/:id' element = {<SelectedBlogPost />} />
          </Route> 
          <Route path = '*' element = {<NotFound />} /> 
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
