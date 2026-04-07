import { useState, useEffect, useRef } from "react";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase.js";
import { getCookie, deleteCookie } from "../cookies.js";
import { useNavigate } from "react-router";
import ReviewSlice from "../Components/ReviewSlice.jsx";

const PAGE_SIZE = 3;

function AverageStars({ reviews }) {
    const rated = reviews.filter(r => r.ratings?.Rating > 0);
    if (rated.length === 0) return <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>No ratings yet</p>;

    const avg = rated.reduce((sum, r) => sum + r.ratings.Rating, 0) / rated.length;
    const display = Math.round(avg * 2) / 2;

    return (
        <div className="d-flex align-items-center gap-2 mb-2">
            {[0, 1, 2, 3, 4].map(i => {
                const filled = display >= i + 1;
                const half = !filled && display >= i + 0.5;
                return (
                    <span key={i} style={{ fontSize: "1.4rem", position: "relative", display: "inline-block" }}>
                        {filled && <span style={{ color: "gold" }}>★</span>}
                        {half && (
                            <span style={{ position: "relative", display: "inline-block" }}>
                                <span style={{ color: "var(--color-border)" }}>★</span>
                                <span style={{ color: "gold", position: "absolute", left: 0, top: 0, width: "50%", overflow: "hidden", display: "inline-block" }}>★</span>
                            </span>
                        )}
                        {!filled && !half && <span style={{ color: "var(--color-border)" }}>★</span>}
                    </span>
                );
            })}
            <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                {avg.toFixed(1)} avg · {rated.length} review{rated.length !== 1 ? "s" : ""}
            </span>
        </div>
    );
}

function Profile() {
    const [username, setUsername] = useState(null);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const usernameRef = useRef();
    const navigate = useNavigate();

    const uid = getCookie("uid");

    async function fetchData() {
        setLoading(true);
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) setUsername(userSnap.data().username);

        const q = query(
            collection(db, "reviews"),
            where("uid", "==", uid),
            orderBy("postedAt", "desc")
        );
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleUsernameSubmit(e) {
        e.preventDefault();
        setError("");
        const newUsername = usernameRef.current.value.trim();
        if (newUsername.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }
        await updateDoc(doc(db, "users", uid), { username: newUsername });
        setEditing(false);
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) setUsername(snap.data().username);
    }

    async function handleLogout() {
        await signOut(auth);
        deleteCookie("uid");
        sessionStorage.clear();
        navigate("/");
    }

    const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
    const pageReviews = reviews.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    if (loading) return <div className="app-profile"><Spinner animation="border" /></div>;

    return (
        <div className="app-profile" style={{ padding: "20px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
            <div>
                <h1 style={{ fontSize: "64px" }}>{username}</h1>
                <AverageStars reviews={reviews} />

                {!editing && (
                    <Button variant="outline-secondary" size="sm" className="mt-1" onClick={() => setEditing(true)}>
                        Change Username
                    </Button>
                )}
                {editing && (
                    <Form onSubmit={handleUsernameSubmit} className="mt-2" style={{ maxWidth: "300px" }}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-2">
                            <Form.Control
                                type="text"
                                ref={usernameRef}
                                defaultValue={username}
                                minLength={3}
                                maxLength={22}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Button type="submit" variant="primary" size="sm">Submit</Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => { setEditing(false); setError(""); }}>Cancel</Button>
                        </div>
                    </Form>
                )}

                {reviews.length > 0 && (
                    <div className="mt-4">
                        <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>My Reviews</h5>
                        {pageReviews.map(r => <ReviewSlice key={r.id} review={r} />)}
                        {totalPages > 1 && (
                            <div className="d-flex align-items-center gap-3 mt-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    ← Prev
                                </Button>
                                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                                    {page + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next →
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginTop: "auto", paddingBottom: "24px" }}>
                {!confirmLogout
                    ? <Button variant="danger" onClick={() => setConfirmLogout(true)}>Log Out</Button>
                    : <Button variant="danger" onClick={handleLogout}>Are You Sure?</Button>
                }
            </div>
        </div>
    );
}

export default Profile;
