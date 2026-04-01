import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useInbox } from "../context/InboxContext";
import { useSent } from "../context/SentContext";
import { theme } from "../styles/theme";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function Main() {
    const { dark } = useTheme();
    const { view, searchQuery } = useSidebar();
    const { mails, loading: inboxLoading, selected: inboxSelected, setSelected: setInboxSelected } = useInbox();
    const { sentMails, loading: sentLoading, selected: sentSelected, setSelected: setSentSelected } = useSent();
    const t = theme(dark);

    const isInbox = view === "inbox";
    const currentMails = isInbox ? mails : sentMails;
    const loading = isInbox ? inboxLoading : sentLoading;
    const selected = isInbox ? inboxSelected : sentSelected;
    const setSelected = isInbox ? setInboxSelected : setSentSelected;

    const filtered = currentMails.filter(m =>
        !searchQuery ||
        (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.to || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selected) {
        return (
            <div style={t.detail}>
                <button style={t.backBtn} onClick={() => setSelected(null)}>
                    ← Back to {isInbox ? "Inbox" : "Sent"}
                </button>
                <h2 style={t.detailSubject}>{selected.subject || "(no subject)"}</h2>
                <div style={t.metaCard}>
                    <div style={t.metaAvatar}>
                        {((isInbox ? selected.from : selected.to)?.[0] || "?").toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={t.metaFrom}>
                                {isInbox ? selected.from : `To: ${selected.to}`}
                            </span>
                            <span style={t.metaDate}>
                                {new Date(selected.date || selected.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div style={t.metaTo}>
                            {isInbox
                                ? <>to <span>{selected.to}</span></>
                                : <>from <span>{selected.from}</span></>
                            }
                        </div>
                    </div>
                </div>
                <div style={t.bodyWrap}>
                    {selected.html ? (
                        <iframe srcDoc={selected.html} style={t.iframe} title="mail" sandbox="allow-same-origin" />
                    ) : (
                        <pre style={t.plainText}>{selected.text || "(empty)"}</pre>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={t.listArea}>
            <div style={t.listHeader}>
                <span style={t.listTitle}>{isInbox ? "Inbox" : "Sent"}</span>
            </div>
            {loading ? (
                <div style={t.emptyState}>Loading…</div>
            ) : filtered.length === 0 ? (
                <div style={t.emptyState}>
                    {searchQuery ? "No results found." : `No ${isInbox ? "inbox" : "sent"} mails.`}
                </div>
            ) : (
                filtered.map((mail) => (
                    <div
                        key={mail._id}
                        style={t.mailRow}
                        onClick={() => setSelected(mail)}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? "#2a2d31" : "#f2f6fc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <div style={t.mailAvatar}>
                            {((isInbox ? mail.from : mail.to)?.[0] || "?").toUpperCase()}
                        </div>
                        <div style={t.mailContent}>
                            <div style={t.mailTop}>
                                <span style={t.mailFrom}>
                                    {isInbox ? (mail.from || "Unknown") : (mail.to || "Unknown")}
                                </span>
                                <span style={t.mailDate}>{formatDate(mail.date || mail.createdAt)}</span>
                            </div>
                            <div style={t.mailSubject}>{mail.subject || "(no subject)"}</div>
                            <div style={t.mailSnippet}>
                                {(mail.text || "").slice(0, 100) || "(no preview)"}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}