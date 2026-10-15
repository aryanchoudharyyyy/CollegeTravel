import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrainFront,
  BusFront,
  MapPin,
  Calendar,
  IndianRupee,
  Hash,
  CheckCircle2,
  ChevronRight,
  Info,
  ArrowLeft,
} from "lucide-react";
import "../styles/CreateListing.css";
import { createListing } from "../api/marketplaceApi";


function CreateListing() {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState("TRAIN");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [ticketClass, setTicketClass] = useState("Sleeper");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [ticketStatus, setTicketStatus] =  useState("CONFIRMED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleTypeSelect = (type) => {
    setListingType(type);
    setTicketClass(type === "TRAIN" ? "Sleeper" : "AC Seater");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payLoad = {
        listingType: listingType === "TRAIN" ? "TRAIN_TICKET" : "BUS_TICKET",
        status: ticketStatus,
        ticketClass: ticketClass,
        source: source.trim(),
        destination: destination.trim(),
        travelDate: travelDate,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        description: description.trim(),
      };
      await createListing(payLoad);
      navigate("/marketplace");


    } catch (err) {
      console.error("Failed to post ticket:", err);
      setError(
        err.response?.data?.message || 
        "Failed to post ticket listing. Please make sure all details are correct."
      );
      
    }finally{
      setSubmitting(false);
    }
  
  };

  return (
    <div className="cl-page">
      {/* ── Breadcrumb ── */}
      <nav className="cl-breadcrumb animate-in">
        <span className="cl-breadcrumb-link" onClick={() => navigate("/marketplace")}>
          Marketplace
        </span>
        <ChevronRight size={14} className="cl-breadcrumb-sep" />
        <span className="cl-breadcrumb-current">Sell a Ticket</span>
      </nav>

      {/* ── Page Header ── */}
      <div className="cl-header animate-in">
        <h1>Sell a Ticket</h1>
        <p>List your train or bus ticket in the campus marketplace.</p>
      </div>

      {/* ── Step Progress Bar ── */}
      <div className="cl-steps animate-in" style={{ animationDelay: "0.05s" }}>
        <div className="cl-step cl-step-active">
          <div className="cl-step-dot">1</div>
          <span>Transport</span>
        </div>
        <div className="cl-step-line-filled"></div>
        <div className="cl-step cl-step-active">
          <div className="cl-step-dot">2</div>
          <span>Details</span>
        </div>
        <div className="cl-step-line-filled"></div>
        <div className="cl-step cl-step-active">
          <div className="cl-step-dot">3</div>
          <span>Pricing</span>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="cl-form-card animate-in" style={{ animationDelay: "0.1s" }}>
        <form onSubmit={handleSubmit}>

          {/* ── Section 1: Ticket Type ── */}
          <div className="cl-section">
            <div className="cl-section-header">
              <h3 className="cl-section-title">Transport Type</h3>
              <p className="cl-section-hint">Select the type of ticket you want to sell</p>
            </div>
            <div className="cl-type-selector">
              <button
                type="button"
                className={`cl-type-btn ${listingType === "TRAIN" ? "active-train" : ""}`}
                onClick={() => handleTypeSelect("TRAIN")}
              >
                <div className="cl-type-icon-wrap">
                  <TrainFront size={22} />
                </div>
                <div className="cl-type-text">
                  <span className="cl-type-name">Train</span>
                  <span className="cl-type-desc">Railway ticket</span>
                </div>
                {listingType === "TRAIN" && <CheckCircle2 size={18} className="cl-check" />}
              </button>
              <button
                type="button"
                className={`cl-type-btn ${listingType === "BUS" ? "active-bus" : ""}`}
                onClick={() => handleTypeSelect("BUS")}
              >
                <div className="cl-type-icon-wrap">
                  <BusFront size={22} />
                </div>
                <div className="cl-type-text">
                  <span className="cl-type-name">Bus</span>
                  <span className="cl-type-desc">Bus ticket</span>
                </div>
                {listingType === "BUS" && <CheckCircle2 size={18} className="cl-check" />}
              </button>
            </div>
          </div>

          <div className="cl-divider"></div>

          {/* ── Section 2: Route ── */}
          <div className="cl-section">
            <div className="cl-section-header">
              <h3 className="cl-section-title">Route Details</h3>
              <p className="cl-section-hint">Where does this journey go?</p>
            </div>
            <div className="cl-grid-2">
              <div className="cl-input-group">
                <label className="cl-label">Source City</label>
                <div className="cl-input-wrapper">
                  <MapPin size={18} className="cl-input-icon text-blue" />
                  <input type="text" placeholder="e.g., Noida (NDLS)" className="cl-input"
                  value={source} onChange={(e) => setSource(e.target.value)} required />
                </div>
              </div>
              <div className="cl-input-group">
                <label className="cl-label">Destination City</label>
                <div className="cl-input-wrapper">
                  <MapPin size={18} className="cl-input-icon text-green" />
                  <input type="text" placeholder="e.g., Delhi" className="cl-input" 
                  value={destination} onChange={(e) => setDestination(e.target.value)}  required />
                </div>
              </div>
            </div>
          </div>

          <div className="cl-divider"></div>

          {/* ── Section 3: Journey Details ── */}
          <div className="cl-section">
            <div className="cl-section-header">
              <h3 className="cl-section-title">Journey &amp; Ticket Details</h3>
              <p className="cl-section-hint">Provide specific ticket information</p>
            </div>

            <div className="cl-input-group">
              <label className="cl-label">
                {listingType === "TRAIN" ? "Train Name & Number" : "Bus Name/Operator"}
              </label>
              <input
                type="text"
                placeholder="e.g., Vande Bharat Express (22439)"
                className="cl-input"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="cl-grid-3">
              <div className="cl-input-group">
                <label className="cl-label">Travel Date</label>
                <div className="cl-input-wrapper">
                  <Calendar size={18} className="cl-input-icon" />
                  <input type="date" className="cl-input" 
                  value={travelDate}

                  onChange={(e)=> setTravelDate(e.target.value)} required />
                </div>
              </div>

              <div className="cl-input-group">
                <label className="cl-label">Ticket Class</label>
                <select className="cl-input cl-select"
                 value={ticketClass}
                  onChange={(e) => setTicketClass(e.target.value)}
                >
                  {listingType === "TRAIN" ? (
                    <>
                      <option value="Sleeper">Sleeper (SL)</option>
                      <option value="3AC">3 Tier AC (3A)</option>
                      <option value="2AC">2 Tier AC (2A)</option>
                      <option value="1AC">1st Class AC (1A)</option>
                      <option value="CC">AC Chair Car (CC)</option>
                    </>
                  ) : (
                    <>
                      <option value="AC Seater">AC Seater</option>
                      <option value="AC Sleeper">AC Sleeper</option>
                      <option value="Non-AC">Non-AC</option>
                    </>
                  )}
                </select>
              </div>

              <div className="cl-input-group">
                <label className="cl-label">Quantity</label>
                <div className="cl-input-wrapper">
                  <Hash size={18} className="cl-input-icon" />
                  <input type="number" min="1" max="10" defaultValue="1" className="cl-input" onWheel={(e) => e.target.blur()}
                  value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          <div className="cl-divider"></div>

          {/* ── Section 4: Price ── */}
          <div className="cl-section">
            <div className="cl-section-header">
              <h3 className="cl-section-title">Asking Price</h3>
              <p className="cl-section-hint">Set a fair price per ticket</p>
            </div>
            <div className="cl-price-row">
              <div className="cl-input-group cl-price-input-group">
                <label className="cl-label">Price Per Ticket</label>
                <div className="cl-input-wrapper cl-price-wrapper">
                  <IndianRupee size={24} className="cl-price-icon" />
                  <input 
                    type="number"  
                    placeholder="e.g., 500" 
                    className="cl-price-input" 
                    min="1"
                    onWheel={(e) => e.target.blur()} 
                    onKeyDown={(e) => {
                      // Prevent typing minus, 'e' (math symbol)
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                      // Prevent starting with 0
                      if (e.key === '0' && e.target.value.length === 0) {
                        e.preventDefault();
                      }
                    }}
                    value={price} onChange={(e)=> setPrice(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Info Banner ── */}
          <div className="cl-info-banner">
            <Info size={16} className="cl-info-icon" />
            <p>Your listing will be visible to all campus students. You'll be notified when someone expresses interest.</p>
          </div>
          

          {error && <div style={{ color: "var(--status-danger, #ef4444)", marginBottom: "16px", fontWeight: "500", fontSize: "14px" }}>{error}</div>}
          {/* ── Action Buttons ── */}

          <div className="cl-actions">
            <button type="button" className="cl-btn-cancel" onClick={() => navigate("/marketplace")}>
              <ArrowLeft size={16} />
              Cancel
            </button>
          <button type="submit" className="cl-btn-submit" disabled={submitting}>
              {submitting? "Posting..." : "Post Listing"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateListing;