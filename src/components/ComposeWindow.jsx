import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCompose } from "../context/ComposeContext";
import { useSent } from "../context/SentContext";
import { theme } from "../styles/theme";
import { MinimizeIcon, MaximizeIcon, XIcon } from "./Icons";

export default function ComposeWindow() {
    const { user } = useAuth();
    const { dark } = useTheme();
    const { appendSent } = useSent();
    const {
        composeOpen, composeMinimized, setComposeMinimized,
        composeMaximized, setComposeMaximized,
        compose, setCompose,
        sending, sendError, sendSuccess,
        closeCompose, sendMail,
    } = useCompose();
    const t = theme(dark);

    if (!composeOpen) return null;

    return (
        <div style={{
            ...t.composeWindow,
            ...(composeMaximized ? t.composeMaximized : {}),
            ...(composeMinimized ? t.composeMinimized : {}),
        }}>
            <div style={t.composeHeader}>
                <span style={t.composeTitle}>New Message</span>
                <div style={t.composeActions}>
                    <button
                        style={t.composeIconBtn}
                        onClick={() => setComposeMinimized(v => !v)}
                        title="Minimize"
                    >
                        <MinimizeIcon />
                    </button>
                    <button
                        style={t.composeIconBtn}
                        onClick={() => setComposeMaximized(v => !v)}
                        title="Full screen"
                    >
                        <MaximizeIcon />
                    </button>
                    <button
                        style={t.composeIconBtn}
                        onClick={closeCompose}
                        title="Close"
                    >
                        <XIcon />
                    </button>
                </div>
            </div>

            {!composeMinimized && (
                <>
                    <div style={t.composeFields}>
                        <div style={t.composeField}>
                            <input
                                placeholder="To"
                                value={compose.to}
                                onChange={e => setCompose({ ...compose, to: e.target.value })}
                                style={t.composeInput}
                            />
                        </div>
                        <div style={t.composeField}>
                            <input
                                placeholder="Subject"
                                value={compose.subject}
                                onChange={e => setCompose({ ...compose, subject: e.target.value })}
                                style={t.composeInput}
                            />
                        </div>
                    </div>
                    <textarea
                        placeholder=""
                        value={compose.text}
                        onChange={e => setCompose({ ...compose, text: e.target.value })}
                        style={t.composeTextarea}
                    />
                    <div style={t.composeFooter}>
                        {sendError && <span style={t.errorMsg}>{sendError}</span>}
                        {sendSuccess && <span style={t.successMsg}>✓ Sent!</span>}
                        <button
                            style={{ ...t.sendBtn, ...(sending ? { opacity: 0.7 } : {}) }}
                            onClick={() => sendMail(appendSent, user)}
                            disabled={sending || !compose.to}
                        >
                            {sending ? "Sending…" : "Send"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}