import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";

/* ─── Icons (inline SVG components) ─── */
const Icon = ({ d, size = 20, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d={d} />
    </svg>
);

const InboxIcon = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const SendIcon = () => <Icon d="M22 2L11 13 M22 2L15 22l-4-9-9-4 18-7z" />;
const PencilIcon = () => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const ChevronDown = () => <Icon d="M6 9l6 6 6-6" size={16} />;
const XIcon = () => <Icon d="M18 6L6 18 M6 6l12 12" size={18} />;
const SearchIcon = () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />;
const MinimizeIcon = () => <Icon d="M5 12h14" size={16} />;
const MaximizeIcon = () => <Icon d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" size={16} />;

export default function MailInbox() {
    const { logout, user } = useAuth();

    const [mails, setMails] = useState([]);
    const [sentMails, setSentMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("inbox"); // inbox | sent
    const [selected, setSelected] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [composeOpen, setComposeOpen] = useState(false);
    const [composeMinimized, setComposeMinimized] = useState(false);
    const [composeMaximized, setComposeMaximized] = useState(false);
    const [compose, setCompose] = useState({ to: "", subject: "", text: "" });
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [sendSuccess, setSendSuccess] = useState(false);
    const userMenuRef = useRef(null);

    /* ── Fetch inbox ── */
    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE_URL}/mail/my`, { credentials: "include" }).then(r => r.json()),
            fetch(`${API_BASE_URL}/mail/sent`, { credentials: "include" }).then(r => r.json()),
        ]).then(([inboxData, sentData]) => {
            setMails(inboxData.mails || []);
            setSentMails(sentData.mails || []);
        }).finally(() => setLoading(false));
    }, []);

    /* ── Close user menu on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const sendMail = async () => {
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
            const newSent = {
                _id: Date.now().toString(),
                from: user?.email || "me",
                to: compose.to,
                subject: compose.subject,
                text: compose.text,
                createdAt: new Date().toISOString(),
            };
            setSentMails(prev => [newSent, ...prev]);
            setSendSuccess(true);
            setTimeout(() => {
                setCompose({ to: "", subject: "", text: "" });
                setComposeOpen(false);
                setSendSuccess(false);
            }, 1200);
        } catch (err) {
            setSendError(err.message);
        } finally {
            setSending(false);
        }
    };

    const currentMails = view === "inbox" ? mails : sentMails;
    const filtered = currentMails.filter(m =>
        !searchQuery ||
        (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.to || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const userInitial = (user?.email?.[0] || user?.name?.[0] || "U").toUpperCase();
    const userEmail = user?.email || "user@example.com";
    const userName = user?.name || userEmail.split("@")[0];

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        return isToday
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <div style={s.root}>
            {/* ── TOP BAR ── */}
            <header style={s.topbar}>
                <div style={s.logoArea}>
                    <div style={s.hamburger}>
                        <span style={s.bar} />
                        <span style={s.bar} />
                        <span style={s.bar} />
                    </div>
                    <span style={s.logoMailPrefix}>SLV</span>
                    <span style={s.logoMail}>SLVM</span>
                    <span style={s.logoText}>ail</span>
                </div>

                <div style={s.searchWrap}>
                    <SearchIcon />
                    <input
                        style={s.searchInput}
                        placeholder="Search mail"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* User Menu */}
                <div style={s.topRight} ref={userMenuRef}>
                    <div style={s.userAvatar} onClick={() => setShowUserMenu(v => !v)}>
                        {userInitial}
                        <ChevronDown />
                    </div>
                    {showUserMenu && (
                        <div style={s.userMenu}>
                            <div style={s.userMenuHeader}>
                                <div style={s.userMenuAvatar}>{userInitial}</div>
                                <div>
                                    <div style={s.userMenuName}>{userName}</div>
                                    <div style={s.userMenuEmail}>{userEmail}</div>
                                </div>
                            </div>
                            <div style={s.userMenuDivider} />
                            <button style={s.userMenuBtn} onClick={logout}>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div style={s.body}>
                {/* ── SIDEBAR ── */}
                <aside style={s.sidebar}>
                    <button style={s.composeBtn} onClick={() => { setComposeOpen(true); setComposeMinimized(false); }}>
                        <PencilIcon />
                        <span>Compose</span>
                    </button>

                    <nav style={s.nav}>
                        <button
                            style={{ ...s.navItem, ...(view === "inbox" ? s.navItemActive : {}) }}
                            onClick={() => { setView("inbox"); setSelected(null); }}
                        >
                            <InboxIcon />
                            <span>Inbox</span>
                            {mails.length > 0 && <span style={s.badge}>{mails.length}</span>}
                        </button>
                        <button
                            style={{ ...s.navItem, ...(view === "sent" ? s.navItemActive : {}) }}
                            onClick={() => { setView("sent"); setSelected(null); }}
                        >
                            <SendIcon />
                            <span>Sent</span>
                        </button>
                    </nav>
                </aside>

                {/* ── MAIL LIST + DETAIL ── */}
                <main style={s.main}>
                    {selected ? (
                        /* ── DETAIL ── */
                        <div style={s.detail}>
                            <button style={s.backBtn} onClick={() => setSelected(null)}>
                                ← Back to {view === "inbox" ? "Inbox" : "Sent"}
                            </button>
                            <h2 style={s.detailSubject}>{selected.subject || "(no subject)"}</h2>
                            <div style={s.metaCard}>
                                <div style={s.metaAvatar}>
                                    {((view === "inbox" ? selected.from : selected.to)?.[0] || "?").toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={s.metaFrom}>
                                            {view === "inbox" ? selected.from : `To: ${selected.to}`}
                                        </span>
                                        <span style={s.metaDate}>
                                            {new Date(selected.date || selected.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={s.metaTo}>
                                        {view === "inbox"
                                            ? <>to <span>{selected.to}</span></>
                                            : <>from <span>{selected.from}</span></>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div style={s.bodyWrap}>
                                {selected.html ? (
                                    <iframe srcDoc={selected.html} style={s.iframe} title="mail" sandbox="allow-same-origin" />
                                ) : (
                                    <pre style={s.plainText}>{selected.text || "(empty)"}</pre>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ── LIST ── */
                        <div style={s.listArea}>
                            <div style={s.listHeader}>
                                <span style={s.listTitle}>{view === "inbox" ? "Inbox" : "Sent"}</span>
                            </div>
                            {loading ? (
                                <div style={s.emptyState}>Loading…</div>
                            ) : filtered.length === 0 ? (
                                <div style={s.emptyState}>
                                    {searchQuery ? "No results found." : `No ${view === "inbox" ? "inbox" : "sent"} mails.`}
                                </div>
                            ) : (
                                filtered.map((mail) => (
                                    <div
                                        key={mail._id}
                                        style={s.mailRow}
                                        onClick={() => setSelected(mail)}
                                        onMouseEnter={e => e.currentTarget.style.background = "#f2f6fc"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={s.mailAvatar}>
                                            {((view === "inbox" ? mail.from : mail.to)?.[0] || "?").toUpperCase()}
                                        </div>
                                        <div style={s.mailContent}>
                                            <div style={s.mailTop}>
                                                <span style={s.mailFrom}>
                                                    {view === "inbox" ? (mail.from || "Unknown") : (mail.to || "Unknown")}
                                                </span>
                                                <span style={s.mailDate}>{formatDate(mail.date || mail.createdAt)}</span>
                                            </div>
                                            <div style={s.mailSubject}>{mail.subject || "(no subject)"}</div>
                                            <div style={s.mailSnippet}>
                                                {(mail.text || "").slice(0, 100) || "(no preview)"}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ── COMPOSE WINDOW ── */}
            {composeOpen && (
                <div style={{
                    ...s.composeWindow,
                    ...(composeMaximized ? s.composeMaximized : {}),
                    ...(composeMinimized ? s.composeMinimized : {}),
                }}>
                    {/* Compose Header */}
                    <div style={s.composeHeader}>
                        <span style={s.composeTitle}>New Message</span>
                        <div style={s.composeActions}>
                            <button style={s.composeIconBtn} onClick={() => setComposeMinimized(v => !v)} title="Minimize">
                                <MinimizeIcon />
                            </button>
                            <button style={s.composeIconBtn} onClick={() => setComposeMaximized(v => !v)} title="Full screen">
                                <MaximizeIcon />
                            </button>
                            <button style={s.composeIconBtn} onClick={() => { setComposeOpen(false); setCompose({ to: "", subject: "", text: "" }); setSendError(null); }} title="Close">
                                <XIcon />
                            </button>
                        </div>
                    </div>

                    {!composeMinimized && (
                        <>
                            <div style={s.composeFields}>
                                <div style={s.composeField}>
                                    <input
                                        placeholder="To"
                                        value={compose.to}
                                        onChange={e => setCompose({ ...compose, to: e.target.value })}
                                        style={s.composeInput}
                                    />
                                </div>
                                <div style={s.composeField}>
                                    <input
                                        placeholder="Subject"
                                        value={compose.subject}
                                        onChange={e => setCompose({ ...compose, subject: e.target.value })}
                                        style={s.composeInput}
                                    />
                                </div>
                            </div>
                            <textarea
                                placeholder=""
                                value={compose.text}
                                onChange={e => setCompose({ ...compose, text: e.target.value })}
                                style={s.composeTextarea}
                            />
                            <div style={s.composeFooter}>
                                {sendError && <span style={s.errorMsg}>{sendError}</span>}
                                {sendSuccess && <span style={s.successMsg}>✓ Sent!</span>}
                                <button
                                    style={{ ...s.sendBtn, ...(sending ? { opacity: 0.7 } : {}) }}
                                    onClick={sendMail}
                                    disabled={sending || !compose.to}
                                >
                                    {sending ? "Sending…" : "Send"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────── STYLES ─────────── */
const s = {
    root: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f6f8fc",
        fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
        color: "#202124",
        overflow: "hidden",
    },
    /* Topbar */
    topbar: {
        height: 64,
        background: "#f6f8fc",
        display: "flex",
        alignItems: "center",
        padding: "0 16px 0 8px",
        gap: 16,
        position: "relative",
        zIndex: 10,
    },
    logoArea: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        minWidth: 220,
        paddingLeft: 8,
    },
    hamburger: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "8px 12px",
        cursor: "pointer",
        borderRadius: "50%",
        marginRight: 4,
    },
    bar: {
        display: "block",
        width: 18,
        height: 2,
        background: "#5f6368",
        borderRadius: 2,
    },
    logoMailPrefix: {
        fontSize: 28,
        fontWeight: 700,
        background: "linear-gradient(90deg, #EA4335, #FBBC05)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: 1,
        letterSpacing: -1,
    },
    logoMail: {
        fontSize: 28,
        fontWeight: 700,
        color: "#EA4335",
        lineHeight: 1,
        letterSpacing: -1,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 400,
        color: "#5f6368",
        letterSpacing: -0.5,
        marginTop: 2,
    },
    searchWrap: {
        flex: 1,
        maxWidth: 720,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#eaf1fb",
        borderRadius: 24,
        padding: "0 20px",
        height: 46,
        color: "#5f6368",
        transition: "box-shadow 0.2s",
    },
    searchInput: {
        flex: 1,
        border: "none",
        background: "transparent",
        fontSize: 16,
        color: "#202124",
        outline: "none",
        fontFamily: "inherit",
    },
    topRight: {
        marginLeft: "auto",
        position: "relative",
    },
    userAvatar: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#EA4335",
        color: "#fff",
        width: 36,
        height: 36,
        borderRadius: "50%",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        justifyContent: "center",
        userSelect: "none",
    },
    userMenu: {
        position: "absolute",
        top: 44,
        right: 0,
        width: 280,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        overflow: "hidden",
        zIndex: 100,
        border: "1px solid #e0e0e0",
    },
    userMenuHeader: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 16px 12px",
    },
    userMenuAvatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#EA4335",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 18,
        flexShrink: 0,
    },
    userMenuName: {
        fontWeight: 600,
        fontSize: 14,
        color: "#202124",
    },
    userMenuEmail: {
        fontSize: 12,
        color: "#5f6368",
        marginTop: 2,
    },
    userMenuDivider: {
        height: 1,
        background: "#e0e0e0",
        margin: "0 0 4px",
    },
    userMenuBtn: {
        display: "block",
        width: "100%",
        padding: "10px 16px",
        textAlign: "left",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        color: "#202124",
        fontFamily: "inherit",
        borderRadius: 0,
    },
    /* Body */
    body: {
        flex: 1,
        display: "flex",
        overflow: "hidden",
    },
    /* Sidebar */
    sidebar: {
        width: 256,
        padding: "8px 0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflowY: "auto",
    },
    composeBtn: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "8px 8px 16px 16px",
        padding: "16px 24px 16px 20px",
        background: "#C2E7FF",
        border: "none",
        borderRadius: 16,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        color: "#001d35",
        fontFamily: "inherit",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.2s, background 0.2s",
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "0 8px",
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 16px",
        borderRadius: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 14,
        color: "#202124",
        fontFamily: "inherit",
        fontWeight: 500,
        borderRadius: 24,
        width: "100%",
        textAlign: "left",
        transition: "background 0.15s",
    },
    navItemActive: {
        background: "#D3E3FD",
        fontWeight: 700,
    },
    badge: {
        marginLeft: "auto",
        background: "transparent",
        fontSize: 12,
        fontWeight: 700,
        color: "#202124",
    },
    /* Main */
    main: {
        flex: 1,
        overflowY: "auto",
        background: "#fff",
        borderRadius: 16,
        margin: "0 16px 16px 0",
        border: "1px solid #e0e0e0",
    },
    listArea: {
        display: "flex",
        flexDirection: "column",
    },
    listHeader: {
        padding: "16px 24px 12px",
        borderBottom: "1px solid #f1f3f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    listTitle: {
        fontSize: 14,
        color: "#444746",
        fontWeight: 500,
    },
    emptyState: {
        padding: 40,
        textAlign: "center",
        color: "#5f6368",
        fontSize: 14,
    },
    mailRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 20px",
        borderBottom: "1px solid #f1f3f4",
        cursor: "pointer",
        transition: "background 0.15s",
        background: "transparent",
    },
    mailAvatar: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#5f6368",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 14,
        flexShrink: 0,
        marginTop: 2,
    },
    mailContent: {
        flex: 1,
        minWidth: 0,
    },
    mailTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },
    mailFrom: {
        fontWeight: 700,
        fontSize: 14,
        color: "#202124",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    mailDate: {
        fontSize: 12,
        color: "#5f6368",
        flexShrink: 0,
        marginLeft: 8,
    },
    mailSubject: {
        fontSize: 14,
        color: "#202124",
        fontWeight: 500,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        marginBottom: 2,
    },
    mailSnippet: {
        fontSize: 13,
        color: "#5f6368",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    /* Detail */
    detail: {
        padding: "24px 40px",
        maxWidth: 800,
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "#1a73e8",
        cursor: "pointer",
        fontSize: 14,
        padding: "0 0 16px",
        fontFamily: "inherit",
        display: "block",
    },
    detailSubject: {
        fontSize: 24,
        fontWeight: 400,
        marginBottom: 20,
        color: "#202124",
    },
    metaCard: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
        alignItems: "flex-start",
    },
    metaAvatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#5f6368",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 16,
        flexShrink: 0,
    },
    metaFrom: {
        fontWeight: 600,
        fontSize: 14,
        color: "#202124",
    },
    metaDate: {
        fontSize: 12,
        color: "#5f6368",
    },
    metaTo: {
        fontSize: 13,
        color: "#5f6368",
        marginTop: 2,
    },
    bodyWrap: {
        padding: "20px 0",
        borderTop: "1px solid #e0e0e0",
        marginTop: 8,
    },
    plainText: {
        whiteSpace: "pre-wrap",
        fontSize: 14,
        color: "#202124",
        lineHeight: 1.6,
        fontFamily: "inherit",
        margin: 0,
    },
    iframe: {
        width: "100%",
        minHeight: 400,
        border: "none",
    },
    /* Compose Window */
    composeWindow: {
        position: "fixed",
        bottom: 0,
        right: 24,
        width: 500,
        background: "#fff",
        borderRadius: "12px 12px 0 0",
        boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    composeMaximized: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        borderRadius: 0,
    },
    composeMinimized: {
        height: 48,
    },
    composeHeader: {
        background: "#404040",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        flexShrink: 0,
    },
    composeTitle: {
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
    },
    composeActions: {
        display: "flex",
        gap: 4,
    },
    composeIconBtn: {
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        opacity: 0.8,
    },
    composeFields: {
        borderBottom: "1px solid #e0e0e0",
    },
    composeField: {
        borderBottom: "1px solid #e0e0e0",
    },
    composeInput: {
        width: "100%",
        border: "none",
        padding: "10px 16px",
        fontSize: 14,
        color: "#202124",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
    },
    composeTextarea: {
        flex: 1,
        width: "100%",
        border: "none",
        padding: "12px 16px",
        fontSize: 14,
        color: "#202124",
        outline: "none",
        fontFamily: "inherit",
        resize: "none",
        minHeight: 260,
        boxSizing: "border-box",
    },
    composeFooter: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderTop: "1px solid #e0e0e0",
    },
    sendBtn: {
        background: "#0b57d0",
        color: "#fff",
        border: "none",
        borderRadius: 20,
        padding: "10px 24px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
    },
    errorMsg: {
        color: "#EA4335",
        fontSize: 13,
        flex: 1,
    },
    successMsg: {
        color: "#34a853",
        fontSize: 13,
        flex: 1,
        fontWeight: 600,
    },
};