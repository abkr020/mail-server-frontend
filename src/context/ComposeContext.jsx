import { createContext, useContext, useState } from "react";
import { API_BASE_URL } from "../config";

const ComposeContext = createContext(null);

export const ComposeProvider = ({ children }) => {
    const [composeOpen, setComposeOpen] = useState(false);
    const [composeMinimized, setComposeMinimized] = useState(false);
    const [composeMaximized, setComposeMaximized] = useState(false);
    const [compose, setCompose] = useState({ to: "", subject: "", text: "" });
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [sendSuccess, setSendSuccess] = useState(false);

    const openCompose = () => {
        setComposeOpen(true);
        setComposeMinimized(false);
    };

    const closeCompose = () => {
        setComposeOpen(false);
        setCompose({ to: "", subject: "", text: "" });
        setSendError(null);
        setSendSuccess(false);
    };

    // appendSent comes from SentContext — passed in at call site
    const sendMail = async (appendSent, user) => {
        setSending(true);
        setSendError(null);
        setSendSuccess(false);
        try {
            const res = await fetch(`${API_BASE_URL}/mail/send`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(compose),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Send failed");
            }
            appendSent({
                _id: Date.now().toString(),
                from: user?.email || "me",
                to: compose.to,
                subject: compose.subject,
                text: compose.text,
                createdAt: new Date().toISOString(),
            });
            setSendSuccess(true);
            setTimeout(closeCompose, 1200);
        } catch (err) {
            setSendError(err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <ComposeContext.Provider value={{
            composeOpen, composeMinimized, setComposeMinimized,
            composeMaximized, setComposeMaximized,
            compose, setCompose,
            sending, sendError, sendSuccess,
            openCompose, closeCompose, sendMail,
        }}>
            {children}
        </ComposeContext.Provider>
    );
};

export const useCompose = () => useContext(ComposeContext);