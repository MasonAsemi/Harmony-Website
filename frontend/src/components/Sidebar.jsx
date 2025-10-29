import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const menuItems = [
        { 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            ), 
            label: "Home", 
            path: "/" 
        },
        { 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            ), 
            label: "Profile", 
            path: "/profile" 
        },
        { 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            ), 
            label: "Settings", 
            path: "#" 
        }
    ];

    return (
        <div
            className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 shadow-lg"
            style={{ width: isExpanded ? "200px" : "64px" }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex flex-col h-full py-6">
                <div className="mb-8 px-4">
                    <h2 className={`text-xl font-bold text-gray-800 whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                        Harmony
                    </h2>
                </div>

                <nav className="flex-1">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex items-center px-4 py-4 text-gray-700 hover:bg-rose-100 transition-colors duration-200"
                        >
                            <div className="w-6 h-6 flex-shrink-0">
                                {item.icon}
                            </div>
                            <span
                                className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${
                                    isExpanded ? "opacity-100" : "opacity-0"
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;