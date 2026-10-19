import { Route, Clock, MoveRight, Edit, Trash2 } from "lucide-react";
import "../styles/TripCard.css"; 
import { useNavigate } from "react-router-dom";


function TripCard({ trip }) {
  const navigate = useNavigate();
  if (!trip) return null;


  const dateObj = trip.travelDate ? new Date(trip.travelDate) : new Date(trip.travelDateTime);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = trip.travelTime || dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const title = trip.vehicleNumber
    ? `Vehicle: ${trip.vehicleNumber}`
    : trip.destination || trip.finalDestination || trip.boardingStation || "Trip";

  return (
    <div className="tc-card">
      <div className="tc-header">
        <div className="tc-icon-box">
          <Route size={20} />
        </div>
        
        <div className="tc-title">
          {title}
        </div>
        
        <span className="tc-time">
          <Clock size={14} /> {formattedTime}
        </span>
        
        {trip.mode && (
          <div className="tc-price">
            {trip.mode}
          </div>
        )}
      </div>

      <div className="tc-route-section">
        <span className="tc-route-city">{trip.sourcePoint}</span>
        <MoveRight size={14} className="tc-arrow" />
        <span className="tc-route-city">{trip.boardingStation}</span>
        <div className="tc-date-box">{formattedDate}</div>
      </div>

      <div className="tc-footer">
          <button 
    style={{
      background: "var(--primary-color, #2563eb)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "12px",
      cursor: "pointer",
      fontWeight: "500"
    }}
    onClick={() => navigate("/trip-matches", { state: { myTrip: trip } })}
  >
    Check Matches
  </button>
  
        <div className="tc-action-column">
          <button className="tc-icon-btn"><Edit size={14} /></button>
          <button className="tc-icon-btn"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default TripCard;