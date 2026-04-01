import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MailInbox from "./pages/MailInbox";
import { useAuth } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { InboxProvider } from "./context/InboxContext";
import { SentProvider } from "./context/SentContext";
import { ComposeProvider } from "./context/ComposeContext";

function App2() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (

    <SidebarProvider>
      <InboxProvider>
        <SentProvider>
          <ComposeProvider>
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route
                  path="/login"
                  element={!user ? <Login /> : <Navigate to="/mails" />}
                />

                {/* Protected */}
                <Route
                  path="/mails"
                  element={user ? <MailInbox /> : <Navigate to="/login" />}
                />

                {/* Default */}
                <Route path="/" element={<Navigate to="/mails" />} />
                <Route path="*" element={<Navigate to="/mails" />} />
              </Routes>
            </BrowserRouter>
          </ComposeProvider>
        </SentProvider>
      </InboxProvider>
    </SidebarProvider>


  );
}

export default App2;