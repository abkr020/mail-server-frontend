import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

export default function MailInbox() {
    const { logout } = useAuth();
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/mail/my`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setMails(data.mails || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ padding: 20 }}>Loading mails…</p>;

    if (selected) {
        return (
            <div style={styles.page}>
                {/* Detail Top Bar */}
                <div style={styles.header}>
                    <button
                        onClick={() => setSelected(null)}
                        style={styles.backBtn}
                    >
                        ← Back
                    </button>
                    <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                </div>

                {/* Mail Detail */}
                <div style={styles.detailContainer}>
                    {/* Subject */}
                    <h2 style={styles.detailSubject}>
                        {selected.subject || "(no subject)"}
                    </h2>

                    {/* Meta Card */}
                    <div style={styles.metaCard}>
                        <div style={styles.avatarWrap}>
                            <div style={styles.avatar}>
                                {(selected.from?.[0] || "?").toUpperCase()}
                            </div>
                        </div>

                        <div style={styles.metaInfo}>
                            <div style={styles.metaRow}>
                                <span style={styles.metaFrom}>
                                    {selected.from || "Unknown"}
                                </span>
                                <span style={styles.metaDate}>
                                    {new Date(
                                        selected.date || selected.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <div style={styles.metaTo}>
                                to <span style={{ color: "#94a3b8" }}>{selected.to || "me"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={styles.bodyWrap}>
                        {selected.html ? (
                            <iframe
                                srcDoc={selected.html}
                                style={styles.iframe}
                                title="mail-body"
                                sandbox="allow-same-origin"
                            />
                        ) : (
                            <pre style={styles.plainText}>{selected.text || "(empty)"}</pre>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Top Bar */}
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Inbox</h2>
                <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </div>

            {/* Mail List */}
            <div style={styles.list}>
                {mails.length === 0 && (
                    <p style={{ opacity: 0.6, padding: "20px" }}>No mails</p>
                )}

                {mails.map((mail) => (
                    <div
                        key={mail._id}
                        style={styles.mailRow}
                        onClick={() => setSelected(mail)}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#1e293b")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        <div style={styles.left}>
                            <strong>{mail.from || "Unknown"}</strong>
                        </div>

                        <div style={styles.middle}>
                            <strong>{mail.subject || "(no subject)"}</strong>
                            <span style={styles.preview}>{mail.text?.slice(0, 80)}</span>
                        </div>

                        <div style={styles.right}>
                            {new Date(
                                mail.date || mail.createdAt
                            ).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
        cursor: "pointer",
    },
    backBtn: {
        background: "transparent",
        border: "1px solid #334155",
        color: "#e5e7eb",
        padding: "6px 14px",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    list: {
        flex: 1,
        overflowY: "auto",
    },
    mailRow: {
        display: "grid",
        gridTemplateColumns: "200px 1fr 100px",
        gap: 12,
        padding: "12px 20px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        transition: "background 0.15s",
    },
    left: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    middle: {
        display: "flex",
        gap: 8,
        overflow: "hidden",
    },
    preview: {
        opacity: 0.6,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    right: {
        textAlign: "right",
        opacity: 0.6,
        fontSize: 12,
    },

    // ── Detail view ──────────────────────────────────────────
    detailContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "28px 32px",
        maxWidth: 860,
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
    },
    detailSubject: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 20,
        color: "#f1f5f9",
    },
    metaCard: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: "1px solid #1e293b",
    },
    avatarWrap: {
        flexShrink: 0,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#3b82f6",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 16,
    },
    metaInfo: {
        flex: 1,
        minWidth: 0,
    },
    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        flexWrap: "wrap",
    },
    metaFrom: {
        fontWeight: 600,
        fontSize: 15,
        color: "#f1f5f9",
    },
    metaDate: {
        fontSize: 12,
        opacity: 0.55,
        whiteSpace: "nowrap",
    },
    metaTo: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 2,
    },
    bodyWrap: {
        background: "#1e293b",
        borderRadius: 10,
        padding: 24,
        minHeight: 200,
    },
    plainText: {
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "inherit",
        fontSize: 14,
        lineHeight: 1.7,
        color: "#cbd5e1",
    },
    iframe: {
        width: "100%",
        minHeight: 400,
        border: "none",
        borderRadius: 6,
        background: "#fff",
    },
};