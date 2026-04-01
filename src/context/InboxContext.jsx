import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const InboxContext = createContext(null);

export const InboxProvider = ({ children }) => {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/mail/my`, { credentials: "include" })
            .then(r => r.json())
            .then(data => setMails(data.mails || []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <InboxContext.Provider value={{ mails, loading, selected, setSelected }}>
            {children}
        </InboxContext.Provider>
    );
};

export const useInbox = () => useContext(InboxContext);