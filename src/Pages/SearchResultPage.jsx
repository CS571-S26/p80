import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Spinner } from "react-bootstrap";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";
import ProfileSlice from "../Components/ProfileSlice.jsx";

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

    const [reviewResults, setReviewResults] = useState([]);
    const [profileResults, setProfileResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!queryText) {
            setReviewResults([]);
            setProfileResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        async function fetchAndFilter() {
            const lower = queryText.toLowerCase();

            const [reviewSnap, userSnap] = await Promise.all([
                getDocs(query(collection(db, "reviews"), orderBy("postedAt", "desc"), limit(FETCH_POOL))),
                getDocs(collection(db, "users")),
            ]);

            const allReviews = reviewSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const reviewsByUid = {};
            allReviews.forEach(r => {
                if (!reviewsByUid[r.uid]) reviewsByUid[r.uid] = [];
                reviewsByUid[r.uid].push(r);
            });

            const filtered = allReviews
                .filter(r => r.title?.toLowerCase().includes(lower))
                .slice(0, DISPLAY_LIMIT);
            setReviewResults(filtered);

            const matchedUsers = userSnap.docs
                .filter(d => d.data().username?.toLowerCase().includes(lower))
                .map(d => ({ uid: d.id, user: d.data(), reviews: reviewsByUid[d.id] ?? [] }));
            setProfileResults(matchedUsers);

            setLoading(false);
        }

        fetchAndFilter();
    }, [queryText]);

    return (
        <div className="app-search" style={{ padding: "12px 8px 48px" }}>
            <h1>Results</h1>
            <h5 style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
                {queryText ? <>for "<strong>{queryText}</strong>"</> : ""}
            </h5>

            {loading ? <Spinner animation="border" /> : (
                <>
                    <div className="mb-4">
                        <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>Profiles</h5>
                        {profileResults.length === 0
                            ? <p style={{ color: "var(--color-text-muted)" }}>No profiles found.</p>
                            : <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", maxWidth: "1720px" }}>
                                {profileResults.map(({ uid, user, reviews }) => (
                                    <ProfileSlice key={uid} uid={uid} user={user} reviews={reviews} />
                                ))}
                              </div>
                        }
                    </div>

                    <div>
                        <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>Reviews</h5>
                        {reviewResults.length === 0
                            ? <p style={{ color: "var(--color-text-muted)" }}>No reviews found.</p>
                            : <ReviewCarousel
                                reviews={reviewResults}
                                breakpoints={SEARCH_BREAKPOINTS}
                                colProps={SEARCH_COL_PROPS}
                              />
                        }
                    </div>
                </>
            )}
        </div>
    );
}

export default SearchResultPage;
