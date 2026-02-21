import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔄 Restore auth on refresh
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${API_BASE_URL}/auth/me`, {
            credentials: "include", // cookie still used
            headers: {
                Authorization: `Bearer ${token}`, // optional if backend supports it
            },
        })
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem("token");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // 🔐 Login
    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // 🔥 Store token in localStorage
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        setUser(data.user);
        return data;
    };

    // 🚪 Logout
    const logout = async () => {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);