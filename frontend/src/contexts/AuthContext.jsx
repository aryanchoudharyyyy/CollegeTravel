import { createContext, useState, useContext, useEffect } from "react";
import { getAccessToken } from "../utils/token";
import { getCurrentUser } from "../api/authApi";
import { response } from "express";
const AuthContext = createContext();
export function AuthProvider({ children }){
    const [isLoggedIn, setIsLoggedIn] = useState(!!getAccessToken());

    const [email, setEmail] = useState("");
    const [user, setUser] = useState(null);   // { id, name, email }

    useEffect(()=>{
        const token = getAccessToken();
        if(token){
            getCurrentUser()
            .then((response) => {
                setUser(response.data);
            })
            .catch((error)=>{
                console.log("There is an error while fetching the data of user:", error);
            });

        }
    }, []);
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, email, setEmail, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Create a Custom Hook (A quick way to turn on the tap)

export function useAuth(){
    return useContext(AuthContext);
}