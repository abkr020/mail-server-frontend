import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MailInbox from "./pages/MailInbox";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
console.log("__GIT_COMMIT__",__GIT_COMMIT__);
console.log("__GIT_BRANCH__",__GIT_BRANCH__);
console.log("__GIT_COMMIT_DATE__",__GIT_COMMIT_DATE__);
console.log("__BUILD_DATE__",__BUILD_DATE__);

  return (
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
  );
}

export default App;