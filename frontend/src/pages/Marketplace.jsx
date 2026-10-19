import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, TrainFront, BusFront, ArrowDownUp, ChevronDown, MoveRight, Clock, ArrowRight, Calendar } from "lucide-react";
import "../styles/Marketplace.css";
import { browseListings } from "../api/marketplaceApi";
import { useAuth } from "../contexts/AuthContext";

function formatTimeAgo(dateString){
    if(!dateString) return "Recently";
    const date = new Date(dateString);
    const diffMs = Date.now()-date.getTime();
    const diffHours = Math.floor(diffMs / (1000*60*60));
    if(diffHours<1) return "Just now";
    if(diffHours<24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours/24);
    return `${diffDays}d ago`;
}
function formatTravelDate(dateString) {
    if (!dateString) return "";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch {
        return dateString;
    }
}
function Marketplace(){
    const[searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const[activeFilter, setActiveFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");
    const [showSortOptions, setShowSortOptions] = useState(false);
    const dropdownRef = useRef(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const currentUserId = user?.id;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSortOptions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
      // Fetch live listings from backend
    useEffect(() => {
        setLoading(true);
        browseListings()
            .then((res) => {
                // Spring Page object has content in res.data.content or res.data
                const items = res.data?.content || res.data || [];
                setListings(items);
            })
            .catch((err) => {
                console.error("Failed to load marketplace listings:", err);
            })
            .finally(() => setLoading(false));
    }, []);
    
    return(
        <div className="marketplace-wrapper">
            <div className="marketplace-hero">
                <h1 className="animate-in" style={{ animationDelay: "0.05s" }}>Find your next journey</h1>
                <p className="animate-in" style={{ animationDelay: "0.1s" }}>Buy, sell and discover train and bus tickets within your campus community.</p>
                <div className="search-container animate-in" style={{ animationDelay: "0.15s" }}>
                    <Search className="search-icon" size={20} strokeWidth={2.5} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for destination, train, or bus..."
                        value={searchQuery} 
                        onChange={(e)=> setSearchQuery(e.target.value)}
                    />
                </div>

                {/* --- PREMIUM FILTER BAR --- */}
                <div className="filter-container-premium animate-in" style={{ animationDelay: "0.2s" }}>
                    <div className="filter-tabs-group">
                        <button 
                            className={`filter-btn ${activeFilter === "All" ? "active-all" : ""}`}
                            onClick={() => setActiveFilter("All")}
                        >
                            <LayoutGrid size={18} /> All
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === "TRAIN" ? "active-train" : ""}`}
                            onClick={() => setActiveFilter("TRAIN")}
                        >
                            <TrainFront size={18} /> Train
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === "BUS" ? "active-bus" : ""}`}
                            onClick={() => setActiveFilter("BUS")}
                        >
                            <BusFront size={18} /> Bus
                        </button>
                    </div>
                    
                    <div className="filter-divider"></div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div className="sort-dropdown" ref={dropdownRef}>
    <button
        className={`sort-btn ${showSortOptions ? 'is-open' : ''}`}
        onClick={() => setShowSortOptions(!showSortOptions)}
    >
        <div className="sort-btn-left">
            <ArrowDownUp size={16} className="sort-icon" />
            <span className="sort-label">
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </span>
        </div>
        <ChevronDown size={16} className={`sort-chevron ${showSortOptions ? 'rotate' : ''}`} />
    </button>

    {showSortOptions && (
        <div className="sort-options">
            <button
                className={`sort-option-btn ${sortOrder === 'newest' ? 'selected' : ''}`}
                onClick={() => {
                    setSortOrder("newest");
                    setShowSortOptions(false);
                }}
            >
                Newest First
            </button>
            <button
                className={`sort-option-btn ${sortOrder === 'oldest' ? 'selected' : ''}`}
                onClick={() => {
                    setSortOrder("oldest");
                    setShowSortOptions(false);
                }}
            >
                Oldest First
            </button>
        </div>
    )}
</div>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate("/marketplace/create")}
                        >
                            + Sell Ticket
                        </button>
                    </div>
                </div>
            </div>

                    <div className="list-card-container" style={{ marginTop: "40px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
                        Loading tickets...
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                            No tickets currently listed in the marketplace.
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate("/marketplace/create")}>
                            + Sell the first ticket
                        </button>
                    </div>
                ) : (
                    listings
                        .filter((item) => {
                            const searchStr = `${item.source} ${item.destination} ${item.description}`.toLowerCase();
                            const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
                            if (currentUserId && item.postedByUserId === currentUserId) {
                                   return false; // Apni khud ki listing hide ho jayegi
                                }

                            const matchesFilter =
                                activeFilter === "All"
                                    ? true
                                    : activeFilter === "TRAIN"
                                    ? item.listingType === "TRAIN_TICKET" || item.listingType === "TRAIN"
                                    : item.listingType === "BUS_TICKET" || item.listingType === "BUS";

                            return matchesSearch && matchesFilter;
                        })
                        .sort((a, b) => {
                            const timeA = new Date(a.postedAt || 0).getTime();
                            const timeB = new Date(b.postedAt || 0).getTime();
                            return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
                        })
                        .map((item, index) => (
                            <div 
                                className="trip-card animate-in" 
                                key={item.id} 
                                onClick={() => navigate("/marketplace/" + item.id)} 
                                style={{ animationDelay: `${0.25 + (index * 0.1)}s`, cursor: 'pointer' }}
                            >
                                <div className="trip-main">
                                    <h2 className="trip-title">
                                        {item.source}
                                        <ArrowRight size={18} className="trip-arrow" />
                                        {item.destination}
                                    </h2>
                                    
                                    <p className="trip-description">
                                        {item.description} &bull; Class: {item.ticketClass}
                                    </p>

                                    <div className="trip-meta">
                                        <span className="trip-meta-item">
                                            <Calendar size={15} />
                                            {formatTravelDate(item.travelDate)}
                                        </span>
                                        <span>
                                            Posted {formatTimeAgo(item.postedAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="trip-perforation">
                                    <span className="perforation-circle top" />
                                    <span className="perforation-circle bottom" />
                                </div>

                                <div className="trip-action">
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--stone-900)', fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}>
                                        ₹{item.price}
                                    </div>
                                    <button
                                        className="view-trip-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/marketplace/" + item.id);
                                        }}
                                    >
                                        View details
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>
            
        </div>
    );
}
export default Marketplace;