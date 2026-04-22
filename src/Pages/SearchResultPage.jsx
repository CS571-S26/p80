import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Spinner } from "react-bootstrap";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";

// Fetch a generous pool so filtering by substring still yields up to 30 results
const FETCH_POOL = 300;
const DISPLAY_LIMIT = 30;

const SEARCH_BREAKPOINTS = [
    [0,    1],
    [576,  2],
    [768,  3],
    [992,  4],
    [1200, 6],
];

const SEARCH_COL_PROPS = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };

function SearchResultPage() {
    const [searchParams] = useSearchParams();
    const queryText = searchParams.get("q") || "";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!queryText) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        async function fetchAndFilter() {
            const q = query(
                collection(db, "reviews"),
                orderBy("postedAt", "desc"),
                limit(FETCH_POOL)
            );
            const snap = await getDocs(q);
            const lower = queryText.toLowerCase();
            const filtered = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(r => r.title?.toLowerCase().includes(lower))
                .slice(0, DISPLAY_LIMIT);
            setResults(filtered);
            setLoading(false);
        }
        fetchAndFilter();
    }, [queryText]);

    return (
        <div className="app-search" style={{ padding: "12px 8px" }}>
            <h1>Results</h1>
            <h5 style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
                {queryText ? <>for "<strong>{queryText}</strong>"</> : ""}
            </h5>
            {loading
                ? <Spinner animation="border" />
                : results.length === 0
                    ? <p style={{ color: "var(--color-text-muted)" }}>No reviews found.</p>
                    : <ReviewCarousel
                        reviews={results}
                        breakpoints={SEARCH_BREAKPOINTS}
                        colProps={SEARCH_COL_PROPS}
                      />
            }
        </div>
    );
}

export default SearchResultPage;
