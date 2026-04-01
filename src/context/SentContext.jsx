import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const SentContext = createContext(null);

export const SentProvider = ({ children }) => {
    const [sentMails, setSentMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/mail/sent`, { credentials: "include" })
            .then(r => r.json())
            .then(data => setSentMails(data.mails || []))
            .finally(() => setLoading(false));
    }, []);

    const appendSent = (mail) => setSentMails(prev => [mail, ...prev]);

    return (
        <SentContext.Provider value={{ sentMails, loading, selected, setSelected, appendSent }}>
            {children}
        </SentContext.Provider>
    );
};

export const useSent = () => useContext(SentContext);