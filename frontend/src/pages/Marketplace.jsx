import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  TrainFront,
  BusFront,
  ArrowDownUp,
  ChevronDown,
  MoveRight,
  Clock,
  ArrowRight,
  Calendar,
  MapPin,
  X,
  SlidersHorizontal,
} from "lucide-react";
import "../styles/Marketplace.css";
import { browseListings, searchListings } from "../api/marketplaceApi";
import { useAuth } from "../contexts/AuthContext";

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
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

function Marketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Data & Pagination
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Sorting
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const dropdownRef = useRef(null);

  // Quick keyword search (client-side text filter on current page)
  const [searchQuery, setSearchQuery] = useState("");

  // Route & Date Server-Side Search (backend searchListings API)
  const [showRouteSearch, setShowRouteSearch] = useState(false);
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isRouteSearchActive, setIsRouteSearchActive] = useState(false);

  // Close sort dropdown when clicking outside
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

  // Fetch listings (either browse or search)
  const loadListings = (pageToFetch = page, useRouteSearch = isRouteSearchActive) => {
    setLoading(true);
    const apiCall =
      useRouteSearch && searchSource && searchDestination && searchDate
        ? searchListings(searchSource.trim(), searchDestination.trim(), searchDate, pageToFetch, 20)
        : browseListings(pageToFetch, 20);

    apiCall
      .then((res) => {
        const data = res.data;
        const items = data?.content || data || [];
        setListings(items);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements ?? items.length);
      })
      .catch((err) => {
        console.error("Failed to load marketplace listings:", err);
        setListings([]);
      })
      .finally(() => setLoading(false));
  };

  // Re-fetch whenever page changes
  useEffect(() => {
    loadListings(page, isRouteSearchActive);
  }, [page]);

  // Handle Server-Side Route Search
  const handleRouteSearch = (e) => {
    e.preventDefault();
    if (!searchSource.trim() || !searchDestination.trim() || !searchDate) {
      alert("Please provide Source, Destination, and Travel Date to search routes.");
      return;
    }
    setIsRouteSearchActive(true);
    setPage(0);
    loadListings(0, true);
  };

  // Clear Route Search and revert to standard browse
  const handleClearRouteSearch = () => {
    setSearchSource("");
    setSearchDestination("");
    setSearchDate("");
    setIsRouteSearchActive(false);
    setPage(0);
    loadListings(0, false);
  };

  return (
    <div className="marketplace-wrapper">
      <div className="marketplace-hero">
        <h1 className="animate-in" style={{ animationDelay: "0.05s" }}>
          Find your next journey
        </h1>
        <p className="animate-in" style={{ animationDelay: "0.1s" }}>
          Buy, sell and discover train and bus tickets within your campus community.
        </p>

        {/* Search Controls Bar */}
        <div className="marketplace-search-row animate-in" style={{ animationDelay: "0.15s" }}>
          <div className="search-container">
            <Search className="search-icon" size={20} strokeWidth={2.5} />
            <input
              type="text"
              className="search-input"
              placeholder="Filter by keyword, station, or train name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`btn ${
              showRouteSearch || isRouteSearchActive ? "btn-primary" : "btn-secondary"
            } route-search-toggle-btn`}
            onClick={() => setShowRouteSearch(!showRouteSearch)}
          >
            <SlidersHorizontal size={16} />
            {isRouteSearchActive ? "Route Search (Active)" : "Route Search"}
          </button>
        </div>

        {/* Collapsible Server-Side Route Search Form */}
        {(showRouteSearch || isRouteSearchActive) && (
          <form className="marketplace-route-search-card animate-in" onSubmit={handleRouteSearch}>
            <div className="route-search-fields">
              <div className="route-input-group">
                <label>From</label>
                <div className="route-input-wrap">
                  <MapPin size={16} className="route-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Noida / New Delhi"
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="route-input-group">
                <label>To</label>
                <div className="route-input-wrap">
                  <MapPin size={16} className="route-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Lucknow / Kanpur"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="route-input-group">
                <label>Date</label>
                <div className="route-input-wrap">
                  <Calendar size={16} className="route-input-icon" />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="route-search-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Searching..." : "Search Routes"}
              </button>
              {isRouteSearchActive && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearRouteSearch}
                  disabled={loading}
                >
                  <X size={15} /> Clear Filter
                </button>
              )}
            </div>
          </form>
        )}

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

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="sort-dropdown" ref={dropdownRef}>
              <button
                className={`sort-btn ${showSortOptions ? "is-open" : ""}`}
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                <div className="sort-btn-left">
                  <ArrowDownUp size={16} className="sort-icon" />
                  <span className="sort-label">
                    {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                  </span>
                </div>
                <ChevronDown size={16} className={`sort-chevron ${showSortOptions ? "rotate" : ""}`} />
              </button>

              {showSortOptions && (
                <div className="sort-options">
                  <button
                    className={`sort-option-btn ${sortOrder === "newest" ? "selected" : ""}`}
                    onClick={() => {
                      setSortOrder("newest");
                      setShowSortOptions(false);
                    }}
                  >
                    Newest First
                  </button>
                  <button
                    className={`sort-option-btn ${sortOrder === "oldest" ? "selected" : ""}`}
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

            <button className="btn btn-primary" onClick={() => navigate("/marketplace/create")}>
              + Sell Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="list-card-container" style={{ marginTop: "40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
            Loading tickets...
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              {isRouteSearchActive
                ? "No tickets found matching this route and date."
                : "No tickets currently listed in the marketplace."}
            </p>
            {isRouteSearchActive ? (
              <button className="btn btn-secondary" onClick={handleClearRouteSearch}>
                View All Listings
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate("/marketplace/create")}>
                + Sell the first ticket
              </button>
            )}
          </div>
        ) : (
          <>
            {listings
              .filter((item) => {
                const searchStr = `${item.source} ${item.destination} ${item.description}`.toLowerCase();
                const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
                if (currentUserId && item.postedByUserId === currentUserId) {
                  return false;
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
                  style={{ animationDelay: `${0.1 + (index * 0.05)}s`, cursor: "pointer" }}
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
                      <span>Posted {formatTimeAgo(item.postedAt)}</span>
                    </div>
                  </div>

                  <div className="trip-perforation">
                    <span className="perforation-circle top" />
                    <span className="perforation-circle bottom" />
                  </div>

                  <div className="trip-action">
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "var(--stone-900)",
                        fontFamily:
                          'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                      }}
                    >
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
              ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="marketplace-pagination animate-in">
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0 || loading}
                >
                  Previous
                </button>
                <span className="pagination-text">
                  Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
                  {totalElements > 0 && ` (${totalElements} tickets)`}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Marketplace;