import { useRef, useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { setCookie } from "../cookies.js";
import { useNavigate, Link } from "react-router";

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        try {
            const cred = await signInWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value);
            setCookie("uid", cred.user.uid);
            navigate("/");
        } catch (err) {
            if("Firebase: Error (auth/invalid-credential)." === err.message) {
                setError("Invalid email or password.");
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    }

    return (
        <Container className="d-flex justify-content-center mt-5">
            <Card style={{ width: "400px" }} className="p-4">
                <h3 className="mb-3">Login</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 mb-2">
                        Login
                    </Button>
                    <div className="text-center">
                        <small>No account? <Link to="/register">Register</Link></small>
                    </div>
                </Form>
            </Card>
        </Container>
    );
}

export default Login;
