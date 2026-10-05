import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Ticket, User, Settings, LogOut, ChevronDown} from "lucide-react";
import "../styles/Navbar.css";
import { useState, useEffect, useRef } from "react";
import { getRefreshToken, clearTokens } from "../utils/token";
import { logout } from "../api/authApi";



function Navbar(){
    const {setIsLoggedIn}= useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
async function handleLogout(){
        try {
            const refreshToken = getRefreshToken();
            await logout(refreshToken);
            clearTokens();
            setIsLoggedIn(false);
            navigate("/login");
        } catch (error) {
            console.log("Logout failed:", error.response?.data);
        }
    }

    useEffect(()=>{
        function handleClickOutSide(event){
            if(isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutSide);
        return ()=>{
            document.removeEventListener("mousedown", handleClickOutSide);
        };
    }, [isDropdownOpen]);
    return (
    <nav className="navbar">
       <div className="nav-brand" onClick={() => navigate("/home")}>
                <div className="brand-icon-wrapper">
                    <Ticket size={20} strokeWidth={2.5} />
                </div>
                College Travel
            </div>
        <div className="nav-center-links">
            <button className="nav-link" onClick={()=> navigate("/trips")}>
                Trips
            </button>
             <button className="nav-link" onClick={()=> navigate("/chats")}>
                Chats
            </button>
            <button className="nav-link" onClick={()=>
                navigate("/marketplace")}>Marketplace</button>
            <button className="nav-link" onClick={()=> navigate("/marketplace/chats")}>Marketplace Chats</button>
            <button className="nav-link" onClick={()=> navigate("/my-listings")}>My Listings</button>
            </div>
           <div className="nav-profile-container" ref={dropdownRef}>
            <button className="profile-btn" onClick={()=> setIsDropdownOpen(!isDropdownOpen)}>
                <div className="profile-avatar">
                    <User size={16} />
                </div>
                Aryan 
                <ChevronDown size={14} style={{marginLeft:"4px", color: "var(--text-tertiary)"}} />
            </button>
            {isDropdownOpen && (
                <div className="profile-menu">
                    <button className="menu-item" onClick={()=> {navigate("/profile"); setIsDropdownOpen(false);}}>
                        Profile
                    </button>
                    <button className="menu-item" onClick={()=> {navigate("/settings"); setIsDropdownOpen(false);}}>
                        <Settings size={16} /> Settings
                    </button>

                    <div className="menu-divider"></div>
                    <button className="menu-item menu-logout" onClick={handleLogout}>
                        <LogOut size={16} /> Log out
                    </button>
                </div>
            )}
           </div>
       
        
    </nav>
    );
}
export default Navbar;