import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { getCookie } from "../cookies.js";
import ProfileCarousel from "../Components/ProfileCarousel.jsx";
import ReviewCarousel from "../Components/ReviewCarousel.jsx";
import WelcomeCard from "../Components/WelcomeCard.jsx";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";

const REVIEW_BREAKPOINTS = [[0, 1], [576, 2], [768, 3], [992, 4], [1200, 6]];
const REVIEW_COL_PROPS = { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 };

const PROFILE_BREAKPOINTS = [[0, 2], [576, 3], [768, 4], [992, 5]];

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
                <WelcomeCard />
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
                    ? <ReviewCarousel reviews={followedReviews} breakpoints={REVIEW_BREAKPOINTS} colProps={REVIEW_COL_PROPS} />
                    : <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                        {hasFollowing ? "No reviews yet from people you follow." : "Follow some users to see their reviews here."}
                      </p>
                }
            </div>

            {recommendedUsers.length > 0 && (
                <div className="mt-4">
                    <h5 style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>Recommended Profiles</h5>
                    <ProfileCarousel profiles={recommendedUsers} breakpoints={PROFILE_BREAKPOINTS} />
                </div>
            )}
        </div>
    );
}

export default Home;
