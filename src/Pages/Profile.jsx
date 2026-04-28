import { useState, useEffect, useRef } from "react";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, writeBatch, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase.js";
import { getCookie, deleteCookie } from "../cookies.js";
import { useNavigate, useParams } from "react-router";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";

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
    const { profileUid: paramUid } = useParams();
    const myUid = getCookie("uid");
    const profileUid = paramUid ?? myUid;
    const isOwn = profileUid === myUid;

    const [username, setUsername] = useState(null);
    const [favoriteGame, setFavoriteGame] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const confirmBtnRef = useRef();
    const [reviews, setReviews] = useState([]);
    const usernameRef = useRef();
    const favoriteGameRef = useRef();
    const navigate = useNavigate();

    async function fetchData() {
        setLoading(true);
        const userSnap = await getDoc(doc(db, "users", profileUid));
        if (userSnap.exists()) {
            setUsername(userSnap.data().username);
            setFavoriteGame(userSnap.data().favoriteGame ?? "");
        }

        if (!isOwn && myUid) {
            const mySnap = await getDoc(doc(db, "users", myUid));
            const following = mySnap.data()?.following ?? [];
            setIsFollowing(following.includes(profileUid));
        }

        const q = query(
            collection(db, "reviews"),
            where("uid", "==", profileUid),
            orderBy("postedAt", "desc")
        );
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [profileUid]);

    async function handleUsernameSubmit(e) {
        e.preventDefault();
        setError("");
        const newUsername = usernameRef.current.value.trim();
        if (newUsername.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }
        const newFavoriteGame = favoriteGameRef.current.value.trim();
        await updateDoc(doc(db, "users", myUid), { username: newUsername, favoriteGame: newFavoriteGame });

        const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("uid", "==", myUid)));
        if (!reviewsSnap.empty) {
            const batch = writeBatch(db);
            reviewsSnap.docs.forEach(d => batch.update(d.ref, { username: newUsername }));
            await batch.commit();
        }

        setEditing(false);
        setUsername(newUsername);
        setFavoriteGame(newFavoriteGame);
        setReviews(prev => prev.map(r => ({ ...r, username: newUsername })));
    }

    useEffect(() => {
        if (!confirmLogout) return;
        function cancel(e) {
            if (confirmBtnRef.current && confirmBtnRef.current.contains(e.target)) return;
            setConfirmLogout(false);
        }
        document.addEventListener("mousedown", cancel);
        document.addEventListener("keydown", cancel);
        return () => {
            document.removeEventListener("mousedown", cancel);
            document.removeEventListener("keydown", cancel);
        };
    }, [confirmLogout]);

    useEffect(() => {
        if (!confirmDeleteId) return;
        function cancel(e) {
            if (e.target.closest("[data-delete-btn]")) return;
            setConfirmDeleteId(null);
        }
        document.addEventListener("mousedown", cancel);
        return () => document.removeEventListener("mousedown", cancel);
    }, [confirmDeleteId]);

    async function handleDeleteReview(id) {
        await deleteDoc(doc(db, "reviews", id));
        setReviews(prev => prev.filter(r => r.id !== id));
        setConfirmDeleteId(null);
    }

    async function handleFollowToggle() {
        const update = isFollowing
            ? arrayRemove(profileUid)
            : arrayUnion(profileUid);
        await updateDoc(doc(db, "users", myUid), { following: update });
        setIsFollowing(prev => !prev);
    }

    async function handleLogout() {
        await signOut(auth);
        deleteCookie("uid");
        sessionStorage.clear();
        navigate("/");
    }

    if (loading) return <div className="app-profile"><Spinner animation="border" /></div>;

    return (
        <div className="app-profile" style={{ padding: "12px 8px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
            <div>
                <h1 style={{ fontSize: "64px" }}>{username}</h1>
                <AverageStars reviews={reviews} />

                {!isOwn && myUid && (
                    <Button
                        variant={isFollowing ? "secondary" : "primary"}
                        size="sm"
                        className="mt-1 mb-2"
                        onClick={handleFollowToggle}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                )}

                {favoriteGame && (
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", marginBottom: "8px" }}>
                        Favorite Game: <strong style={{ color: "var(--color-text)" }}>{favoriteGame}</strong>
                    </p>
                )}

                {isOwn && !editing && (
                    <Button variant="outline-secondary" size="sm" className="mt-1" onClick={() => setEditing(true)}>
                        Edit Profile
                    </Button>
                )}
                {isOwn && editing && (
                    <Form onSubmit={handleUsernameSubmit} className="mt-2" style={{ maxWidth: "300px" }}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group className="mb-2">
                            <Form.Label style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "2px" }}>Username</Form.Label>
                            <Form.Control
                                type="text"
                                ref={usernameRef}
                                defaultValue={username}
                                minLength={3}
                                maxLength={22}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "2px" }}>Favorite Game</Form.Label>
                            <Form.Control
                                type="text"
                                ref={favoriteGameRef}
                                defaultValue={favoriteGame}
                                maxLength={60}
                                placeholder="Leave blank to hide"
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
                        <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>
                            {isOwn ? "My Reviews" : `${username}'s Reviews`}
                        </h5>
                        <ReviewCarousel
                            reviews={reviews}
                            disableNavigation
                            onDelete={isOwn ? (id) => {
                                if (confirmDeleteId === id) {
                                    handleDeleteReview(id);
                                } else {
                                    setConfirmDeleteId(id);
                                }
                            } : null}
                            confirmDeleteId={confirmDeleteId}
                        />
                    </div>
                )}
            </div>

            {isOwn && (
                <div style={{ marginTop: "auto", paddingBottom: "24px" }}>
                    {!confirmLogout
                        ? <Button variant="danger" onClick={() => setConfirmLogout(true)}>Log Out</Button>
                        : <Button ref={confirmBtnRef} variant="danger" onClick={handleLogout}>Are You Sure?</Button>
                    }
                </div>
            )}
        </div>
    );
}

export default Profile;
