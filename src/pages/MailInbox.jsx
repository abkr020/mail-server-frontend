import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

export default function MailInbox() {
    const { logout } = useAuth();

    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);

    const [mode, setMode] = useState("inbox"); // inbox | detail | compose
    const [selected, setSelected] = useState(null);

    const [compose, setCompose] = useState({
        to: "",
        subject: "",
        text: "",
    });

    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    /* ───────── FETCH INBOX ───────── */
    useEffect(() => {
        fetch(`${API_BASE_URL}/mail/my`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setMails(data.mails || []))
            .finally(() => setLoading(false));
    }, []);

    /* ───────── SEND MAIL ───────── */
    const sendMail = async () => {
        setSending(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/mail/send`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(compose),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Send failed");
            }

            // reset + go back to inbox
            setCompose({ to: "", subject: "", text: "" });
            setMode("inbox");
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    /* ───────── LOADING ───────── */
    if (loading) {
        return <p style={{ padding: 20 }}>Loading mails…</p>;
    }

    /* ───────── COMPOSE VIEW ───────── */
    if (mode === "compose") {
        return (
            <div style={styles.page}>
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => setMode("inbox")}>
                        ← Back
                    </button>
                    <button onClick={logout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>

                <div style={styles.composeWrap}>
                    <h2>New Message</h2>

                    <input
                        placeholder="To"
                        value={compose.to}
                        onChange={(e) =>
                            setCompose({ ...compose, to: e.target.value })
                        }
                        style={styles.input}
                    />

                    <input
                        placeholder="Subject"
                        value={compose.subject}
                        onChange={(e) =>
                            setCompose({ ...compose, subject: e.target.value })
                        }
                        style={styles.input}
                    />

                    <textarea
                        placeholder="Write your message…"
                        value={compose.text}
                        onChange={(e) =>
                            setCompose({ ...compose, text: e.target.value })
                        }
                        style={styles.textarea}
                    />

                    {error && <p style={{ color: "#f87171" }}>{error}</p>}

                    <button
                        onClick={sendMail}
                        disabled={sending}
                        style={styles.sendBtn}
                    >
                        {sending ? "Sending…" : "Send"}
                    </button>
                </div>
            </div>
        );
    }

    /* ───────── DETAIL VIEW ───────── */
    if (mode === "detail" && selected) {
        return (
            <div style={styles.page}>
                <div style={styles.header}>
                    <button
                        onClick={() => {
                            setSelected(null);
                            setMode("inbox");
                        }}
                        style={styles.backBtn}
                    >
                        ← Back
                    </button>
                    <button onClick={logout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>

                <div style={styles.detailContainer}>
                    <h2 style={styles.detailSubject}>
                        {selected.subject || "(no subject)"}
                    </h2>

                    <div style={styles.metaCard}>
                        <div style={styles.avatar}>
                            {(selected.from?.[0] || "?").toUpperCase()}
                        </div>

                        <div style={styles.metaInfo}>
                            <div style={styles.metaRow}>
                                <span style={styles.metaFrom}>{selected.from}</span>
                                <span style={styles.metaDate}>
                                    {new Date(
                                        selected.date || selected.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div style={styles.metaTo}>
                                to <span>{selected.to}</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.bodyWrap}>
                        {selected.html ? (
                            <iframe
                                srcDoc={selected.html}
                                style={styles.iframe}
                                title="mail"
                            />
                        ) : (
                            <pre style={styles.plainText}>
                                {selected.text || "(empty)"}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ───────── INBOX VIEW ───────── */
    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2>Inbox</h2>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        style={styles.sendBtn}
                        onClick={() => setMode("compose")}
                    >
                        Compose
                    </button>
                    <button onClick={logout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.list}>
                {mails.length === 0 && (
                    <p style={{ padding: 20, opacity: 0.6 }}>No mails</p>
                )}

                {mails.map((mail) => (
                    <div
                        key={mail._id}
                        style={styles.mailRow}
                        onClick={() => {
                            setSelected(mail);
                            setMode("detail");
                        }}
                    >
                        <strong>{mail.from || "Unknown"}</strong>
                        <span>{mail.subject || "(no subject)"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───────── STYLES ───────── */

const styles = {
    page: {
        height: "100vh",
        background: "#0f172a",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        padding: "12px 20px",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logoutBtn: {
        background: "transparent",
        border: "1px solid #334155",
        color: "#e5e7eb",
        padding: "6px 14px",
        borderRadius: 6,
    },
    backBtn: {
        background: "transparent",
        border: "1px solid #334155",
        color: "#e5e7eb",
        padding: "6px 14px",
        borderRadius: 6,
    },
    sendBtn: {
        background: "#3b82f6",
        border: "none",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: 6,
        cursor: "pointer",
    },
    list: {
        flex: 1,
        overflowY: "auto",
    },
    mailRow: {
        padding: "12px 20px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
    },

    composeWrap: {
        maxWidth: 700,
        margin: "30px auto",
        width: "100%",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    input: {
        padding: 10,
        borderRadius: 6,
        border: "1px solid #334155",
        background: "#020617",
        color: "#e5e7eb",
    },
    textarea: {
        minHeight: 200,
        padding: 10,
        borderRadius: 6,
        border: "1px solid #334155",
        background: "#020617",
        color: "#e5e7eb",
    },

    /* detail styles reused */
    detailContainer: {
        padding: 28,
        maxWidth: 860,
        margin: "0 auto",
    },
    detailSubject: {
        fontSize: 22,
        marginBottom: 20,
    },
    metaCard: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#3b82f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
    },
    metaInfo: { flex: 1 },
    metaRow: {
        display: "flex",
        justifyContent: "space-between",
    },
    metaFrom: { fontWeight: 600 },
    metaDate: { fontSize: 12, opacity: 0.6 },
    metaTo: { fontSize: 13, opacity: 0.6 },
    bodyWrap: {
        background: "#1e293b",
        padding: 20,
        borderRadius: 8,
    },
    plainText: { whiteSpace: "pre-wrap" },
    iframe: { width: "100%", minHeight: 400, border: "none" },
};