import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { getCookie } from "../cookies.js";
import ProfileSlice from "../Components/ProfileSlice.jsx";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";
import { Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";

const BROWSE_BREAKPOINTS = [[0, 1], [576, 2], [768, 3], [992, 4], [1200, 6]];
const BROWSE_COL_PROPS = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };

function Home() {
    const uid = getCookie("uid");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!!uid);
    const [followedReviews, setFollowedReviews] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [hasFollowing, setHasFollowing] = useState(false);

    useEffect(() => {
        if (!uid) return;

        async function fetchAll() {
            const [mySnap, userSnap, reviewSnap] = await Promise.all([
                getDoc(doc(db, "users", uid)),
                getDocs(collection(db, "users")),
                getDocs(collection(db, "reviews")),
            ]);

            const following = mySnap.data()?.following ?? [];
            setHasFollowing(following.length > 0);

            const followingSet = new Set(following);
            const reviewsByUid = {};
            const followed = [];

            reviewSnap.docs.forEach(d => {
                const data = d.data();
                const review = { id: d.id, ...data };
                if (!reviewsByUid[data.uid]) reviewsByUid[data.uid] = [];
                reviewsByUid[data.uid].push(review);
                if (followingSet.has(data.uid)) followed.push(review);
            });

            followed.sort((a, b) => (b.postedAt?.toMillis?.() ?? 0) - (a.postedAt?.toMillis?.() ?? 0));
            setFollowedReviews(followed);

            const others = userSnap.docs
                .filter(d => d.id !== uid && !followingSet.has(d.id))
                .map(d => ({ uid: d.id, user: d.data(), reviews: reviewsByUid[d.id] ?? [] }));

            others.sort((a, b) => b.reviews.length - a.reviews.length);
            setRecommendedUsers(others.slice(0, 10));
            setLoading(false);
        }

        fetchAll();
    }, []);

    if (!uid) {
        return (
            <div className="app-home">
                <h1>Home</h1>
                <Card className="mt-3" style={{ maxWidth: "380px" }}>
                    <Card.Body>
                        <Card.Title>Welcome</Card.Title>
                        <Card.Text style={{ color: "var(--color-text-muted)" }}>
                            Log in to write reviews and get personalized recommendations.
                        </Card.Text>
                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => navigate("/login")}>Log In</Button>
                            <Button variant="outline-secondary" onClick={() => navigate("/register")}>Register</Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (loading) return <div className="app-home"><Spinner animation="border" /></div>;

    return (
        <div className="app-home">
            <h1>Home</h1>

            <div className="mt-3">
                <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>Following's Reviews</h5>
                {followedReviews.length > 0
                    ? <ReviewCarousel reviews={followedReviews} breakpoints={BROWSE_BREAKPOINTS} colProps={BROWSE_COL_PROPS} />
                    : <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        {hasFollowing ? "No reviews yet from people you follow." : "Follow some users to see their reviews here."}
                      </p>
                }
            </div>

            {recommendedUsers.length > 0 && (
                <div className="mt-4">
                    <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>Recommended Profiles</h5>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", maxWidth: "1720px" }}>
                        {recommendedUsers.map(({ uid: rUid, user, reviews }) => (
                            <ProfileSlice key={rUid} uid={rUid} user={user} reviews={reviews} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
