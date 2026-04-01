import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [view, setView] = useState("inbox");       // "inbox" | "sent"
    const [searchQuery, setSearchQuery] = useState("");

    const switchView = (v) => {
        setView(v);
        setSearchQuery("");   // clear search when switching tabs
    };

    return (
        <SidebarContext.Provider value={{ view, switchView, searchQuery, setSearchQuery }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => useContext(SidebarContext);