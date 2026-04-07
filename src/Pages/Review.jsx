import { useRef, useState, useEffect } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";

const STAR_CATEGORIES = ["Rating", "Art", "Gameplay", "Story"];

function StarRating({ label, value, onChange }) {
    const [hovered, setHovered] = useState(null);

    function getStarFill(starIndex, currentValue) {
        const filled = currentValue >= starIndex + 1;
        const half = !filled && currentValue >= starIndex + 0.5;
        if (filled) return "full";
        if (half) return "half";
        return "empty";
    }

    function handleMouseMove(e, starIndex) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setHovered(x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1);
    }

    function handleClick(e, starIndex) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        onChange(x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1);
    }

    const display = hovered ?? value;

    return (
        <div className="mb-3">
            <Form.Label className="d-block mb-1">{label}</Form.Label>
            <div className="d-flex gap-1" onMouseLeave={() => setHovered(null)}>
                {[0, 1, 2, 3, 4].map(i => {
                    const fill = getStarFill(i, display);
                    return (
                        <span
                            key={i}
                            style={{ fontSize: "1.8rem", cursor: "pointer", position: "relative", userSelect: "none" }}
                            onMouseMove={e => handleMouseMove(e, i)}
                            onClick={e => handleClick(e, i)}
                        >
                            {fill === "empty" && <span style={{ color: "var(--color-border)" }}>★</span>}
                            {fill === "full" && <span style={{ color: "gold" }}>★</span>}
                            {fill === "half" && (
                                <span style={{ position: "relative", display: "inline-block" }}>
                                    <span style={{ color: "var(--color-border)" }}>★</span>
                                    <span style={{
                                        color: "gold",
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        width: "50%",
                                        overflow: "hidden",
                                        display: "inline-block"
                                    }}>★</span>
                                </span>
                            )}
                        </span>
                    );
                })}
                <span className="ms-2 align-self-center" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    {value > 0 ? value : "—"}
                </span>
            </div>
        </div>
    );
}

function Review() {
    const titleRef = useRef();
    const descriptionRef = useRef();
    const consoleRef = useRef();
    const playtimeRef = useRef();
    const genreInputRef = useRef();

    const [ratings, setRatings] = useState({ Rating: 0, Art: 0, Gameplay: 0, Story: 0 });
    const [genres, setGenres] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => setAuthReady(true));
        return unsubscribe;
    }, []);

    function handleGenreKeyDown(e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const val = genreInputRef.current.value.trim();
        if (!val || genres.includes(val) || genres.length >= 5) return;
        setGenres(prev => [...prev, val]);
        genreInputRef.current.value = "";
    }

    function removeGenre(genre) {
        setGenres(prev => prev.filter(g => g !== genre));
    }

    function handlePlaytimeInput(e) {
        const val = e.target.value;
        // Allow only numbers and one decimal with at most 1 digit after
        if (!/^\d*\.?\d?$/.test(val)) {
            e.target.value = val.slice(0, -1);
        }
    }

    async function handleSubmit() {
        setError("");
        setSuccess(false);

        const title = titleRef.current.value.trim();
        if (!title) { setError("Game title is required."); return; }

        const currentUser = auth.currentUser;
        if (!currentUser) { setError("You must be logged in to submit a review."); return; }
        const uid = currentUser.uid;

        setSubmitting(true);
        try {
            const userSnap = await getDoc(doc(db, "users", uid));
            const username = userSnap.exists() ? userSnap.data().username : "";

            const playtimeRaw = playtimeRef.current.value;
            const playtime = playtimeRaw !== "" ? parseFloat(parseFloat(playtimeRaw).toFixed(1)) : null;

            await addDoc(collection(db, "reviews"), {
                title,
                description: descriptionRef.current.value.trim(),
                console: consoleRef.current.value.trim(),
                playtime,
                genres,
                ratings,
                username,
                uid,
                postedAt: serverTimestamp()
            });

            setSuccess(true);
            titleRef.current.value = "";
            descriptionRef.current.value = "";
            consoleRef.current.value = "";
            playtimeRef.current.value = "";
            genreInputRef.current.value = "";
            setGenres([]);
            setRatings({ Rating: 0, Art: 0, Gameplay: 0, Story: 0 });
        } catch (err) {
            setError(err.message);
        }
        setSubmitting(false);
    }

    return (
        <div className="app-review" style={{ padding: "20px" }}>
            <Card style={{ maxWidth: "640px" }}>
                <Card.Body>
                    <Card.Title className="mb-3" style={{ fontSize: "1.4rem" }}>Write a Review</Card.Title>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Review submitted!</Alert>}

                    {/* Game Title */}
                    <Form.Group className="mb-4">
                        <Form.Control
                            type="text"
                            placeholder="Game Title"
                            ref={titleRef}
                            style={{ fontSize: "1.6rem", fontWeight: 700 }}
                        />
                    </Form.Group>

                    {/* Star Ratings */}
                    {STAR_CATEGORIES.map(cat => (
                        <StarRating
                            key={cat}
                            label={cat}
                            value={ratings[cat]}
                            onChange={val => setRatings(prev => ({ ...prev, [cat]: val }))}
                        />
                    ))}

                    {/* Description */}
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            maxLength={255}
                            placeholder="Write your review..."
                            ref={descriptionRef}
                        />
                    </Form.Group>

                    {/* Console */}
                    <Form.Group className="mb-3">
                        <Form.Label>Console</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. PC, PS5, Switch"
                            ref={consoleRef}
                        />
                    </Form.Group>

                    {/* Playtime */}
                    <Form.Group className="mb-3">
                        <Form.Label>Playtime (hours)</Form.Label>
                        <Form.Control
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 42.5"
                            ref={playtimeRef}
                            onInput={handlePlaytimeInput}
                            style={{ maxWidth: "160px" }}
                        />
                    </Form.Group>

                    {/* Genres */}
                    <Form.Group className="mb-4">
                        <Form.Label>Genres <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>({genres.length}/5 — press Enter to add)</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. RPG"
                            ref={genreInputRef}
                            onKeyDown={handleGenreKeyDown}
                            disabled={genres.length >= 5}
                        />
                        {genres.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {genres.map(g => (
                                    <span
                                        key={g}
                                        onClick={() => removeGenre(g)}
                                        title="Click to remove"
                                        style={{
                                            cursor: "pointer",
                                            padding: "2px 10px",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "12px",
                                            fontSize: "0.85rem",
                                            backgroundColor: "var(--color-bg-secondary)"
                                        }}
                                    >
                                        {g} ×
                                    </span>
                                ))}
                            </div>
                        )}
                    </Form.Group>

                    <Button variant="primary" onClick={handleSubmit} disabled={submitting || !authReady}>
                        {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
}

export default Review;
