import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // Set initial value
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

        // Add event listener
        if (mql.addEventListener) {
            mql.addEventListener('change', onChange);
        } else {
            // Fallback for older browsers
            mql.addListener(onChange);
        }

        return () => {
            if (mql.removeEventListener) {
                mql.removeEventListener('change', onChange);
            } else {
                // Fallback for older browsers
                mql.removeListener(onChange);
            }
        };
    }, []);

    return isMobile;
}
