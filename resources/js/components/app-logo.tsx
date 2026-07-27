import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex h-10 w-20 items-center justify-center overflow-hidden">
                <AppLogoIcon className="h-full w-full object-contain" />
            </div>
        </>
    );
}
