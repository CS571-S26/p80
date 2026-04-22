import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { getCookie } from "../cookies.js";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";

const DISPLAY_LIMIT = 30;  // 5 pages × 6 per page at max width
const FETCH_BUFFER = 60;   // fetch extra to account for filtering out own reviews

const BROWSE_BREAKPOINTS = [
    [0,    1],
    [576,  2],
    [768,  3],
    [992,  4],
    [1200, 6],
];

const BROWSE_COL_PROPS = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };

function Browse() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            const uid = getCookie("uid");
            const q = query(
                collection(db, "reviews"),
                orderBy("postedAt", "desc"),
                limit(FETCH_BUFFER)
            );
            const snap = await getDocs(q);
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const filtered = uid ? all.filter(r => r.uid !== uid) : all;
            setReviews(filtered.slice(0, DISPLAY_LIMIT));
            setLoading(false);
        }
        fetchReviews();
    }, []);

    return (
        <div className="app-browse" style={{ padding: "12px 8px" }}>
            <h1>Browse Games</h1>
            <h5 style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>Recent Reviews</h5>
            {loading
                ? <Spinner animation="border" />
                : reviews.length === 0
                    ? <p style={{ color: "var(--color-text-muted)" }}>No reviews yet.</p>
                    : <ReviewCarousel
                        reviews={reviews}
                        breakpoints={BROWSE_BREAKPOINTS}
                        colProps={BROWSE_COL_PROPS}
                      />
            }
        </div>
    );
}

export default Browse;
