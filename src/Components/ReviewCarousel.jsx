import { useState, useEffect, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import ReviewSlice from "./ReviewSlice.jsx";

// breakpoints: sorted array of [minWidth, perPageCount]
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

const DEFAULT_BREAKPOINTS = [[0, 1], [768, 2], [992, 3]];
const DEFAULT_COL_PROPS = { xs: 12, md: 6, lg: 4 };

function ReviewCarousel({ reviews, breakpoints = DEFAULT_BREAKPOINTS, colProps = DEFAULT_COL_PROPS }) {
    const perPage = usePerPage(breakpoints);
    const [page, setPage] = useState(0);
    const [animState, setAnimState] = useState(null);
    const timerRef = useRef(null);

    const totalPages = Math.ceil(reviews.length / perPage);
    const pageReviews = reviews.slice(page * perPage, page * perPage + perPage);

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
                    aria-label="Newer reviews"
                >
                    ‹
                </button>
                <div className="carousel-viewport">
                    <div className={`carousel-track ${animState || ""}`}>
                        <Row className="g-3">
                            {pageReviews.map(r => (
                                <Col key={r.id} {...colProps}>
                                    <ReviewSlice review={r} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
                <button
                    className={`carousel-arrow ${canRight ? "carousel-arrow-active" : "carousel-arrow-disabled"}`}
                    onClick={() => canRight && navigate("right")}
                    disabled={!canRight}
                    aria-label="Older reviews"
                >
                    ›
                </button>
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

export default ReviewCarousel;
