import { useState, useEffect } from "react";
import { getMyTrips, deleteTrip } from "../api/tripApi";
import { useNavigate } from "react-router-dom";
import { TrainFront, BusFront, Clock, MoveRight, Flame, Trash2, Edit } from "lucide-react";
import "../styles/MyListings.css";
import TripCard from "../components/TripCard";
import { getMyListings, deleteListing } from "../api/marketplaceApi";


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



function MyListings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("listings");
    const [myTrips, setMyTrips] = useState([]);
    const [myTripsPage, setMyTripsPage] = useState(0);
    const [myTripsTotal, setMyTripsTotal] = useState(0);
    const [hasMoreTrips, setHasMoreTrips] = useState(false);
    const [loadingMoreTrips, setLoadingMoreTrips] = useState(false);
     const [myTickets, setMyTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
useEffect(()=>{
    getMyTrips(0, 20)
    .then((res)=> {
        setMyTrips(res.data?.content || []);
        setMyTripsTotal(res.data?.totalElements || 0);
        setHasMoreTrips(res.data?.last === false);
    })
    .catch((err)=>{
        console.error("Failed to load my trips:", err);
    });
    loadMyTickets();
},[]);

  const loadMoreTrips = async () => {
      if (loadingMoreTrips || !hasMoreTrips) return;
      const nextPage = myTripsPage + 1;
      setLoadingMoreTrips(true);
      try {
          const response = await getMyTrips(nextPage, 20);
          setMyTrips((previous) => [...previous, ...(response.data?.content || [])]);
          setMyTripsPage(nextPage);
          setMyTripsTotal(response.data?.totalElements || 0);
          setHasMoreTrips(response.data?.last === false);
      } catch (err) {
          console.error("Failed to load more trips:", err);
      } finally {
          setLoadingMoreTrips(false);
      }
  };

  const loadMyTickets = () => {
        setLoadingTickets(true);
        getMyListings()
            .then((res) => {
                const items = res.data?.content || res.data || [];
                setMyTickets(items);
            })
            .catch((err) => {
                console.error("Failed to load my listings:", err);
            })
            .finally(() => setLoadingTickets(false));
    };
      const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Are you sure you want to remove this ticket listing?")) return;
        try {
            await deleteListing(ticketId);
            setMyTickets((prev) => prev.filter((item) => item.id !== ticketId));
        } catch (err) {
            console.error("Failed to delete ticket listing:", err);
            alert(err.response?.data?.message || "Failed to delete ticket listing");
        }
    };

    const handleDeleteTrip = async (tripId) => {
        if (!window.confirm("Are you sure you want to cancel and remove this trip?")) return;
        try {
            await deleteTrip(tripId);
            setMyTrips((prev) => prev.filter((item) => item.id !== tripId));
        } catch (err) {
            console.error("Failed to delete trip:", err);
            alert(err.response?.data?.message || "Failed to delete trip");
        }
    };

    return (
        <div className="pr-page">
             <h1 style={{ marginBottom: "var(--space-6)" }}>My Dashboard</h1>
             <div className="pr-tabs animate-in">
                <button className={`pr-tab ${activeTab === "listings" ? "active" : ""}`} onClick={() => setActiveTab("listings")}>
                    My Listings ({myTickets.length})
                </button>
                <button className={`pr-tab ${activeTab === 'trips' ? 'active' : ''}`}
                onClick={() => setActiveTab('trips')}>
                    My Trips ({myTripsTotal})
                </button>
                {/* TODO: Re-enable when interest feature is ready
                <button className={`pr-tab ${activeTab === 'interests' ? 'active' :''}`}
                onClick={() => setActiveTab('interests')}>
                    My Interests (0)
                </button>
                */}
             </div>
             
             <div className="pr-content animate-in" style={{animationDelay: '0.1s'}}>
                              {activeTab === 'listings' && (
                  <div className="pr-listings-grid">
                      {loadingTickets ? (
                          <div style={{ padding: "30px", color: "var(--text-tertiary)" }}>
                              Loading your tickets...
                          </div>
                      ) : myTickets.length === 0 ? (
                          <div className="pr-empty-state">
                              <p>You haven't posted any tickets yet.</p>
                              <button className="pr-btn-primary" onClick={() => navigate("/marketplace/create")}>
                                  Sell a Ticket
                              </button>
                          </div>
                      ) : (
                          myTickets.map((item) => {
                              const isTrain = item.listingType === "TRAIN_TICKET" || item.listingType === "TRAIN";
                              return (
                                  <div key={item.id} className="pr-ticket-card">
                                      <div className="pr-ticket-top">
                                          <div className={`pr-ticket-icon ${isTrain ? 'bg-blue' : 'bg-green'}`}>
                                              {isTrain ? <TrainFront size={20} className="text-blue" /> : <BusFront size={20} className="text-green" />}
                                          </div>
                                          <div className="pr-ticket-title">
                                              <h3>{item.description}</h3>
                                              <span className="pr-time"><Clock size={12} /> {formatTimeAgo(item.postedAt)}</span>
                                          </div>
                                          <div className="pr-ticket-price">
                                              {item.price ? `₹${item.price}` : "Varies"}
                                          </div>
                                      </div>
                                      <div className="pr-ticket-route">
                                          <span className="route-city">{item.source}</span>
                                          <MoveRight size={14} className="text-gray" />
                                          <span className="route-city">{item.destination}</span>
                                          <div className="pr-ticket-date">{formatTravelDate(item.travelDate)}</div>
                                      </div>
                                      <div className="pr-ticket-actions">
                                          {/* TODO: Re-enable when interest feature is ready
                                          <div 
                                              className={`pr-interest-badge ${item.interestCount > 0 ? 'has-interest' : ''}`}
                                              onClick={() => navigate(`/marketplace/${item.id}`)}
                                              style={{ cursor: "pointer" }}
                                          >
                                              <Flame size={14} /> {item.interestCount || 0} Interested
                                          </div>
                                          */}
                                          
                                          <div className="pr-action-btns">
                                              <button 
                                                  className="pr-icon-btn delete" 
                                                  title="Delete Listing"
                                                  onClick={() => handleDeleteTicket(item.id)}
                                              >
                                                  <Trash2 size={16} />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>
              )}
                
                {activeTab === 'trips' && (
                    <div className="pr-listings-grid" style={{ marginTop: '24px' }}>
                        {myTrips.length === 0 ? (
                            <div className="pr-empty-state">
                                <p>You haven't posted any trips yet.</p>
                            </div>
                        ) : (
                            myTrips.map(tripItem => (
                                <TripCard key={tripItem.id} trip={tripItem} onDelete={handleDeleteTrip} />
                            ))
                        )}
                        {hasMoreTrips && (
                            <button className="pr-btn-primary" onClick={loadMoreTrips} disabled={loadingMoreTrips}>
                                {loadingMoreTrips ? "Loading…" : "Load more trips"}
                            </button>
                        )}
                    </div>
                )}
                
                {/* TODO: Re-enable when interest feature is ready
                {activeTab === 'interests' && (
                    <div className="pr-empty-state">
                        <p>You haven't expressed interest in any tickets yet.</p>
                        <button className="pr-btn-primary" onClick={() => navigate("/marketplace")}>Browse Marketplace</button>
                    </div>
                )}
                */}
            </div>
        </div>
    );
}

export default MyListings;
