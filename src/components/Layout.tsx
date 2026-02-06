import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex bg-[#f8fafc] min-h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth bg-white">
                {/* Content */}
                <div className="relative z-10 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
