import React, {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext = createContext(null);

function getStoredUser() {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}

function getStoredToken() {
    return localStorage.getItem("token");
}

function normalizeUser(userData) {
    if (!userData) {
        return null;
    }

    return {
        ...userData,
        role:
            typeof userData.role === "string"
                ? userData.role.trim().toLowerCase()
                : "customer"
    };
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(getStoredToken);
    const [user, setUser] = useState(() =>
        normalizeUser(getStoredUser())
    );

    const isLoggedIn = Boolean(token && user);

    const login = (response) => {
        const newToken =
            response?.token ||
            response?.accessToken ||
            response?.data?.token;

        const newUser =
            response?.user ||
            response?.data?.user;

        if (!newToken || !newUser) {
            throw new Error(
                "Login response must contain a token and user."
            );
        }

        const normalizedUser = normalizeUser(newUser);

        localStorage.setItem("token", newToken);
        localStorage.setItem(
            "user",
            JSON.stringify(normalizedUser)
        );

        setToken(newToken);
        setUser(normalizedUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
}