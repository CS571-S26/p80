import { useRef, useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { setCookie } from "../cookies.js";
import { useNavigate } from "react-router";

function Register() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        setError("");
        try {
            const email = emailRef.current.value;
            const cred = await createUserWithEmailAndPassword(auth, email, passwordRef.current.value);
            await setDoc(doc(db, "users", cred.user.uid), {
                email,
                username: email,
                following: []
            });
            setCookie("uid", cred.user.uid);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <Container className="d-flex justify-content-center mt-5">
            <Card style={{ width: "400px" }} className="p-4">
                <h3 className="mb-3">Register</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} required />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">
                        Register
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default Register;
