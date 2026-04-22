import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Outlet } from "react-router";
import { getCookie } from "../cookies.js";
import { Navbar, Nav, Form, Button, Container } from "react-bootstrap";
import logo from "../assets/HighscoreLogo.png";

function Layout() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
    const [loggedIn, setLoggedIn] = useState(() => !!getCookie("uid"));
    const location = useLocation();
    const navigate = useNavigate();
    const searchRef = useRef();

    useEffect(() => {
        setLoggedIn(!!getCookie("uid"));
    }, [location]);

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    function handleSearch(e) {
        if (e.key !== "Enter") return;
        const val = searchRef.current.value.trim();
        if (!val) return;
        navigate(`/search?q=${encodeURIComponent(val)}`);
        searchRef.current.value = "";
    }

    function toggleDarkMode() {
        const mode = !darkMode;
        setDarkMode(mode);
        localStorage.setItem("darkMode", mode);
    }

    return (
        <div style={{ minHeight: "100vh" }}>
            <Navbar expand="lg" className="px-3 app-navbar">
                <Navbar.Brand as={Link} to="/">
                    <img
                        src={logo}
                        alt="Logo"
                        width="60"
                        height="60"
                        className="me-2"
                    />
                    <span className="navbar-brand-text">Highscore</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                    <Nav className="me-auto align-items-center gap-2">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/browse">Browse</Nav.Link>
                        <Form className="d-flex ms-2">
                            <Form.Control
                                type="search"
                                placeholder="Search..."
                                aria-label="Search"
                                ref={searchRef}
                                onKeyDown={handleSearch}
                            />
                        </Form>
                    </Nav>

                    <div className="d-flex align-items-center gap-2">
                        {loggedIn
                            ? <Nav className="me-auto align-items-center gap-2">
                                <Nav.Link as={Link} to="/write-review">Write Review</Nav.Link>
                            </Nav>
                            : null
                        }
                        <Button
                            variant="outline-secondary"
                            onClick={toggleDarkMode}
                        >
                            {darkMode ? "Dark" : "Light"}
                        </Button>
                        {loggedIn
                            ? <Button variant="outline-primary" as={Link} to="/profile">Profile</Button>
                            : <Button variant="outline-success" as={Link} to="/login">Login</Button>
                        }
                    </div>
                </Navbar.Collapse>
            </Navbar>

            <Container fluid className="mt-4">
                <Outlet />
            </Container>
        </div>
    );
}

export default Layout;
