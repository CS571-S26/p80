import { Card } from "react-bootstrap";
import { useNavigate } from "react-router";

function MiniStars({ avg, count }) {
    if (count === 0) return <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>No reviews yet</span>;
    const display = Math.round(avg * 2) / 2;
    return (
        <div className="d-flex align-items-center gap-1 flex-wrap">
            <div className="d-flex">
                {[0, 1, 2, 3, 4].map(i => {
                    const filled = display >= i + 1;
                    const half = !filled && display >= i + 0.5;
                    return (
                        <span key={i} style={{ fontSize: "0.9rem", position: "relative", display: "inline-block" }}>
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
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {avg.toFixed(1)} · {count} review{count !== 1 ? "s" : ""}
            </span>
        </div>
    );
}

function ProfileSlice({ uid, user, reviews = [] }) {
    const { username, favoriteGame } = user;
    const navigate = useNavigate();
    const rated = reviews.filter(r => r.ratings?.Rating > 0);
    const avg = rated.length > 0
        ? rated.reduce((s, r) => s + r.ratings.Rating, 0) / rated.length
        : 0;

    return (
        <Card
            style={{ width: "100%", cursor: "pointer" }}
            onClick={() => navigate(`/profile/${uid}`)}
        >
            <Card.Body style={{ padding: "12px" }}>
                <Card.Title style={{ fontSize: "1rem", marginBottom: "6px", wordBreak: "break-word" }}>
                    {username}
                </Card.Title>
                <MiniStars avg={avg} count={rated.length} />
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "8px", marginBottom: 0 }}>
                    Favorite Game:{" "}
                    <strong style={{ color: "var(--color-text)" }}>{favoriteGame || "None"}</strong>
                </p>
            </Card.Body>
        </Card>
    );
}

export default ProfileSlice;
