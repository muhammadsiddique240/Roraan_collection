import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Force immediate scroll to top on any route or filter change
        window.scrollTo(0, 0);
    }, [pathname, search]);

    return null;
}
