import { useState, useEffect, useRef } from "react";
import ProfileSlice from "./ProfileSlice.jsx";

const GAP = 12;

function usePerPage(breakpoints) {
    function calc() {
        const w = window.innerWidth;
        let result = breakpoints[0][1];
        for (const [minW, count] of breakpoints) {
            if (w >= minW) result = count;
        }
        return result;
    }
    const [perPage, setPerPage] = useState(calc);
    useEffect(() => {
        const handler = () => setPerPage(calc());
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return perPage;
}

function ProfileCarousel({ profiles, breakpoints }) {
    const perPage = usePerPage(breakpoints);
    const [page, setPage] = useState(0);
    const [animState, setAnimState] = useState(null);
    const timerRef = useRef(null);

    const totalPages = Math.ceil(profiles.length / perPage);
    const pageProfiles = profiles.slice(page * perPage, page * perPage + perPage);

    useEffect(() => {
        setPage(0);
        setAnimState(null);
    }, [perPage]);

    function navigate(dir) {
        if (animState) return;
        const next = dir === "right" ? page + 1 : page - 1;
        const exitClass = dir === "right" ? "carousel-exit-left" : "carousel-exit-right";
        const enterClass = dir === "right" ? "carousel-enter-right" : "carousel-enter-left";
        setAnimState(exitClass);
        timerRef.current = setTimeout(() => {
            setPage(next);
            setAnimState(enterClass);
            timerRef.current = setTimeout(() => setAnimState(null), 280);
        }, 280);
    }

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const canLeft = page > 0;
    const canRight = page < totalPages - 1;

    return (
        <div className="review-carousel-wrapper">
            <div className="review-carousel-inner">
                <button
                    className={`carousel-arrow ${canLeft ? "carousel-arrow-active" : "carousel-arrow-disabled"}`}
                    onClick={() => canLeft && navigate("left")}
                    disabled={!canLeft}
                    aria-label="Previous profiles"
                >‹</button>
                <div className="carousel-viewport">
                    <div className={`carousel-track ${animState || ""}`}>
                        <div style={{ display: "flex", gap: `${GAP}px` }}>
                            {pageProfiles.map(({ uid, user, reviews }) => (
                                <div
                                    key={uid}
                                    style={{
                                        flex: `0 0 calc((100% - ${(perPage - 1) * GAP}px) / ${perPage})`,
                                        minWidth: 0,
                                    }}
                                >
                                    <ProfileSlice uid={uid} user={user} reviews={reviews} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button
                    className={`carousel-arrow ${canRight ? "carousel-arrow-active" : "carousel-arrow-disabled"}`}
                    onClick={() => canRight && navigate("right")}
                    disabled={!canRight}
                    aria-label="Next profiles"
                >›</button>
            </div>
            {totalPages > 1 && (
                <div className="carousel-dots">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <span key={i} className={`carousel-dot ${i === page ? "carousel-dot-active" : ""}`} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfileCarousel;
