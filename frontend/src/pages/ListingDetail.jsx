import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  TrainFront,
  BusFront,
  MapPin,
  Calendar,
  Clock,
  MoveRight,
  Users,
  ShieldAlert,
  Trash2,
  ChevronRight,
  Share2,
  Package,
  User,
  MessageCircle,
} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import { getListingById, expressInterest, deleteListing, startListingConversation } from "../api/marketplaceApi";
import "../styles/ListingDetail.css";

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

function ListingDetail() {
  const {id} = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
 const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);


    useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListingById(id)
      .then((res) => {
        setListing(res.data);
      })
      .catch((err) => {
        console.error("Failed to load listing details:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);
  const currentUserId = user?.id;
  const isOwner = listing && currentUserId === listing.postedByUserId;
  const isTrain = listing?.listingType === "TRAIN_TICKET" || listing?.listingType === "TRAIN";
    const handleExpressInterest = async () => {
    try {
      setActionLoading(true);
      await expressInterest(id);
      setInterestSuccess(true);
      setListing((prev) => ({ ...prev, interestCount: (prev.interestCount || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to express interest");
    } finally {
      setActionLoading(false);
    }
  };
    const handleChatWithSeller = async () => {
    try {
      setActionLoading(true);
      const res = await startListingConversation(id);
      // Backend returns ListingConversation { id, listingId, buyerId, ... }
      const conversationId = res.data.id;
      navigate(`/marketplace/chats?conversation=${conversationId}`);
    } catch (err) {
      console.error("Failed to start chat with seller:", err);
      alert(err.response?.data?.message || "Could not start chat with seller");
    } finally {
      setActionLoading(false);
    }
  };
   // Delete listing handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteListing(id);
      navigate("/marketplace");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing");
    }
  };
    if (loading) {
    return (
      <div className="ld-page" style={{ textAlign: "center", padding: "80px" }}>
        <p>Loading ticket details...</p>
      </div>
    );
  }
    if (!listing) {
    return (
      <div className="ld-page" style={{ textAlign: "center", padding: "80px" }}>
        <h2>Ticket Not Found</h2>
        <p style={{ color: "var(--text-secondary)", margin: "16px 0" }}>
          This ticket may have been sold or removed.
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </button>
      </div>
    );
  }
  return (
    <div className="ld-page">
      {/* ── Breadcrumb ── */}
      <nav className="ld-breadcrumb">
        <span className="ld-breadcrumb-link" onClick={() => navigate("/marketplace")}>
          Marketplace
        </span>
        <ChevronRight size={14} className="ld-breadcrumb-sep" />
        <span className="ld-breadcrumb-current">{listing.description}</span>

      </nav>

      <div className="ld-layout">
        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div className="ld-main-col">
          {/* ── Hero Ticket Card ── */}
          <div className={`ld-hero-card ${isTrain ? "ld-accent-train" : "ld-accent-bus"}`}>
            <div className="ld-hero-top">
              <div className="ld-hero-icon-wrap">
                {isTrain ? <TrainFront size={28} /> : <BusFront size={28} />}
              </div>
              <div className="ld-hero-info">
                <div className="ld-hero-title-row">
                  <h1 className="ld-hero-title">{listing.description}</h1>
                  <span className={`ld-status-badge ld-status-${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="ld-hero-tags">
                  <span className="ld-tag">{listing.ticketClass}</span>
                  <span className="ld-tag ld-tag-type">
                    {isTrain ? <TrainFront size={12} /> : <BusFront size={12} />}
                    {listing.listingType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Route Timeline ── */}
          <div className="ld-route-card animate-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="ld-section-label">Journey Route</h2>
            <div className="ld-route-timeline">
              <div className="ld-route-point">
                <div className="ld-route-dot ld-dot-origin"></div>
                <div className="ld-route-point-info">
                  <h3>{listing.source}</h3>
                  <span>Origin</span>
                </div>
              </div>

              <div className="ld-route-line">
                <div className="ld-route-dash"></div>
                <MoveRight size={18} className="ld-route-arrow" />
                <div className="ld-route-dash"></div>
              </div>

              <div className="ld-route-point">
                <div className="ld-route-dot ld-dot-dest"></div>
                <div className="ld-route-point-info">
                  <h3>{listing.destination}</h3>
                  <span>Destination</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Meta Info Grid ── */}
          <div className="ld-meta-grid animate-in" style={{ animationDelay: "0.2s" }}>
            <div className="ld-meta-card">
              <div className="ld-meta-icon-wrap">
                <Calendar size={20} />
              </div>
              <div>
                <p className="ld-meta-label">Travel Date</p>
                <p className="ld-meta-value">{listing.travelDate}</p>
              </div>
            </div>
            <div className="ld-meta-card">
              <div className="ld-meta-icon-wrap">
                <Clock size={20} />
              </div>
              <div>
                <p className="ld-meta-label">Posted</p>
                <p className="ld-meta-value">{listing.postedAt}</p>
              </div>
            </div>
            <div className="ld-meta-card">
              <div className="ld-meta-icon-wrap">
                <Package size={20} />
              </div>
              <div>
                <p className="ld-meta-label">Quantity</p>
                <p className="ld-meta-value">
                  {listing.quantity} {listing.quantity > 1 ? "tickets" : "ticket"}
                </p>
              </div>
            </div>
            <div className="ld-meta-card">
              <div className="ld-meta-icon-wrap">
                <Users size={20} />
              </div>
              <div>
                <p className="ld-meta-label">Interested</p>
                <p className="ld-meta-value">{listing.interestCount} people</p>
              </div>
            </div>
          </div>

          {/* ── Seller Info ── */}
          <div className="ld-seller-card animate-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="ld-section-label">Listed By</h2>
            <div className="ld-seller-row">
              <div className="ld-seller-avatar">
                <User size={20} />
              </div>
              <div className="ld-seller-info">
                <p className="ld-seller-name">User #{listing.postedByUserId}</p>
                <p className="ld-seller-time">Posted {listing.postedAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div className="ld-side-col">
          <div className="ld-price-card animate-in" style={{ animationDelay: "0.15s" }}>
            <p className="ld-price-label">Asking Price</p>
            <h2 className="ld-price-value">₹{listing.price}</h2>
            <p className="ld-price-sub">per ticket</p>

            <div className="ld-price-divider"></div>

                       {isOwner ? (
              <div className="ld-owner-actions">
                <div className="ld-interest-box">
                  <h3>{listing.interestCount || 0} users interested</h3>
                  <p>Check your messages or manage your ticket.</p>
                </div>
                <button className="ld-btn-delete" onClick={handleDelete}>
                  <Trash2 size={18} />
                  Delete Listing
                </button>
              </div>
            ) : (
              <div className="ld-buyer-actions">
                <button 
                  className="ld-btn-primary" 
                  onClick={handleExpressInterest}
                  disabled={actionLoading || interestSuccess}
                >
                  {interestSuccess ? "Interest Expressed!" : "Express Interest"}
                </button>
                <button 
                  className="ld-btn-secondary" 
                  onClick={handleChatWithSeller}
                  disabled={actionLoading}
                >
                  <MessageCircle size={18} />
                  Chat with Seller
                </button>
                <p className="ld-safety-tip">
                  <ShieldAlert size={14} />
                  Only pay after verifying the ticket in person.
                </p>
              </div>
            )}

            <div className="ld-price-divider"></div>

            <button className="ld-btn-share">
              <Share2 size={16} />
              Share Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;