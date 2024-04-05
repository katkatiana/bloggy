import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import ProtectedRoutes from "./middleware/ProtectedRoutes"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route  exact path = '/' element = {<LoginPage /> } />
          <Route element = { <ProtectedRoutes />} >
                <Route path = '/home' element = { <HomePage />} />
          </Route> 
          <Route path = '*' element = {<NotFound />} /> 
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
