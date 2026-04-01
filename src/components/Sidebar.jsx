import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { useCompose } from "../context/ComposeContext";
import { useInbox } from "../context/InboxContext";
import { theme } from "../styles/theme";
import { PencilIcon, InboxIcon, SendIcon } from "./Icons";

export default function Sidebar() {
    const { dark } = useTheme();
    const { view, switchView } = useSidebar();
    const { openCompose } = useCompose();
    const { mails } = useInbox();
    const t = theme(dark);

    return (
        <aside style={t.sidebar}>
            <button style={t.composeBtn} onClick={openCompose}>
                <PencilIcon />
                <span>Compose</span>
            </button>

            <nav style={t.nav}>
                <button
                    style={{ ...t.navItem, ...(view === "inbox" ? t.navItemActive : {}) }}
                    onClick={() => switchView("inbox")}
                >
                    <InboxIcon />
                    <span>Inbox</span>
                    {mails.length > 0 && <span style={t.badge}>{mails.length}</span>}
                </button>
                <button
                    style={{ ...t.navItem, ...(view === "sent" ? t.navItemActive : {}) }}
                    onClick={() => switchView("sent")}
                >
                    <SendIcon />
                    <span>Sent</span>
                </button>
            </nav>
        </aside>
    );
}