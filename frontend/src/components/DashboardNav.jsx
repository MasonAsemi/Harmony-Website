import { useEffect, useState } from "react";

const DashboardNav = ({ children }) => {
    const [currentChats, setCurrentChats] = useState([]);

    return <div className="flex flex-col gap-4 w-full">
        <div className="w-full text-center text-white text-xl">Nav</div>
        {children}
    </div>
}

export default DashboardNav;