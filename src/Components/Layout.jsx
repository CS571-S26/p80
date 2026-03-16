import { useState } from "react";
import { Link } from "react-router";
import { Outlet } from "react-router";
import { Navbar, Nav, Form, Button, Container } from "react-bootstrap";

function Layout() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

    function toggleDarkMode() {
        const mode = !darkMode;
        setDarkMode(mode);
        localStorage.setItem("darkMode", mode);
    }

    return (
        <div data-bs-theme={darkMode ? "dark" : "light"} style={{ minHeight: "100vh" }}>
            <Navbar expand="lg" className="px-3 app-navbar">
                <Navbar.Brand as={Link} to="/">
                    <img
                        src="https://placehold.co/40x40"
                        alt="Logo"
                        width="40"
                        height="40"
                        className="me-2"
                    />
                    <span className="navbar-brand-text">MyApp</span>
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
                            />
                        </Form>
                    </Nav>

                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            onClick={toggleDarkMode}
                        >
                            {darkMode ? "Dark" : "Light"}
                        </Button>
                        <Button variant="outline-primary">Login</Button>
                    </div>
                </Navbar.Collapse>
            </Navbar>

            <Container className="mt-4">
                <Outlet />
            </Container>
        </div>
    );
}

export default Layout;
