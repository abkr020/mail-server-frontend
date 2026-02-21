import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./Login";
// import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        {/* Protected Route */}
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

/* Simple dashboard component */
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome {user.name}</h1>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}