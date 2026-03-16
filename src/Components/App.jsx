import { HashRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./Layout.jsx";
import Home from "../Pages/Home.jsx";

function App(){
    return (
        <HashRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App