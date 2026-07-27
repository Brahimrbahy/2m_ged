import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/2m_logo.svg"
            alt="2M Logo"
            {...props}
        />
    );
}
