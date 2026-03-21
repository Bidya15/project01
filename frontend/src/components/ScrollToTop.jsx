import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Navigation Utility Component.
 * Forces the window to scroll to top on every route change.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
