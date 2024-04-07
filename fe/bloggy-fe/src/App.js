import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ProtectedRoutes from "./middleware/ProtectedRoutes"
import SignupPage from "./pages/SignupPage";
import LoginSuccess from "./pages/LoginSuccess";
import SelectedBlogPost from "./pages/SelectedBlogPost";

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
