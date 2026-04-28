import { Card, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";

function WelcomeCard() {
    const navigate = useNavigate();
    return (
        <Row className="justify-content-center mt-3">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                <Card>
                    <Card.Body className="p-3 p-md-4 p-lg-5 text-center">
                        <Card.Title className="fs-4 fs-md-3 fs-lg-2 mb-3">Welcome</Card.Title>
                        <Card.Text style={{ color: "var(--color-text-muted)" }} className="fs-6 fs-lg-5 mb-4">
                            Log in to write reviews and get personalized recommendations.
                        </Card.Text>
                        <div className="d-flex gap-2 justify-content-center">
                            <Button variant="primary" onClick={() => navigate("/login")}>Log In</Button>
                            <Button variant="outline-secondary" onClick={() => navigate("/register")}>Register</Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default WelcomeCard;
