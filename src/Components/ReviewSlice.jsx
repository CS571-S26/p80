import { Card, Badge } from "react-bootstrap";

const STAR_CATEGORIES = ["Rating", "Art", "Gameplay", "Story"];

function StarDisplay({ label, value }) {
    return (
        <div className="d-flex align-items-center gap-2 mb-1">
            <span style={{ minWidth: "80px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{label}</span>
            <div className="d-flex">
                {[0, 1, 2, 3, 4].map(i => {
                    const filled = value >= i + 1;
                    const half = !filled && value >= i + 0.5;
                    return (
                        <span key={i} style={{ fontSize: "1.1rem", position: "relative", display: "inline-block" }}>
                            {filled && <span style={{ color: "gold" }}>★</span>}
                            {half && (
                                <span style={{ position: "relative", display: "inline-block" }}>
                                    <span style={{ color: "var(--color-border)" }}>★</span>
                                    <span style={{
                                        color: "gold",
                                        position: "absolute",
                                        left: 0, top: 0,
                                        width: "50%",
                                        overflow: "hidden",
                                        display: "inline-block"
                                    }}>★</span>
                                </span>
                            )}
                            {!filled && !half && <span style={{ color: "var(--color-border)" }}>★</span>}
                        </span>
                    );
                })}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{value > 0 ? value : "—"}</span>
        </div>
    );
}

function ReviewSlice({ review }) {
    const {
        username,
        title,
        description,
        console: platform,
        playtime,
        genres,
        ratings,
        postedAt
    } = review;

    const date = postedAt?.toDate
        ? postedAt.toDate().toLocaleDateString()
        : null;

    return (
        <Card className="mb-3">
            <Card.Body>
                <Card.Title style={{ fontSize: "1.1rem" }}>
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>{username}'s review of </span>
                    {title}
                </Card.Title>

                <div className="mb-3">
                    {STAR_CATEGORIES.map(cat => (
                        <StarDisplay key={cat} label={cat} value={ratings?.[cat] ?? 0} />
                    ))}
                </div>

                {description && (
                    <p style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>{description}</p>
                )}

                <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    {platform && <span>Platform: <strong>{platform}</strong></span>}
                    {playtime != null && <span>Playtime: <strong>{playtime}h</strong></span>}
                    {date && <span>Posted: <strong>{date}</strong></span>}
                </div>

                {genres?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mt-2">
                        {genres.map(g => (
                            <Badge
                                key={g}
                                bg="secondary"
                                style={{ fontWeight: 400, fontSize: "0.8rem" }}
                            >
                                {g}
                            </Badge>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

export default ReviewSlice;
