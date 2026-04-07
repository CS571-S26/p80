import { HashRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./Layout.jsx";
import Home from "../Pages/Home.jsx";
import Browse from "../Pages/Browse.jsx";
import Login from "../Pages/Login.jsx";
import Register from "../Pages/Register.jsx";
import Profile from "../Pages/Profile.jsx";
import Review from "../Pages/Review.jsx";

function App(){
    return (
        <HashRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/write-review" element={<Review />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App