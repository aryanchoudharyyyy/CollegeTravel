import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Clock, MessageSquare, User, ShieldPlus, Compass } from "lucide-react";
import "../styles/TripMatches.css";

// Mock data based on the requirements


// "Aman Sharma" -> "AS"
function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
function formatDateTime(dateTime){
  const date  = new Date(dateTime);
  return {
    date: date.toLocaleDateString("en-IN",{
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    time: date.toLocaleDateString("en-IN", {
      hour:  "numeric",
      minute: "2-digit",
      hour12: true
    })
  }
}

function TripMatches() {
  const navigate = useNavigate();
  const location = useLocation();
  const matches = location.state?.matches || [];
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  };

  <div className="tm-match-list" style={{ paddingTop: "24px" }}>
    {matches.map((match) => {
        const { date, time } = formatDateTime(
            match.trip.travelDateTime
        );

        return (
            <div key={match.trip.id} className="tm-match-card">

                <div className="tm-match-avatar">
                    {getInitials(match.name)}
                </div>

                <div className="tm-match-body">

                    <div className="tm-match-top">
                        <h2 className="tm-match-name">
                            {match.name}
                        </h2>

                        {match.existingGroupId && (
                            <span className="tm-match-badge">
                                In a group
                            </span>
                        )}
                    </div>

                    <div className="tm-match-route">

                        <span className="tm-route-place">
                            {match.trip.sourcePoint || "Campus"}
                        </span>

                        <span className="tm-route-track">
                            <span className="tm-route-dot" />
                            <span className="tm-route-line" />
                            <span className="tm-route-dot end" />
                        </span>

                        <span className="tm-route-place">
                            {match.trip.boardingStation || "Station"}
                        </span>

                    </div>

                    <div className="tm-match-time">
                        <Clock size={14} />
                        {date} at {time}
                    </div>

                </div>

                <div className="tm-match-actions">

                    <button
                        className="tm-chat-btn"
                        aria-expanded={openMenuId === match.trip.id}
                        onClick={() => toggleMenu(match.trip.id)}
                    >
                        <MessageSquare size={16} />
                        Chat
                    </button>

                    {openMenuId === match.trip.id && (
                        <>
                            <div
                                className="tm-menu-backdrop"
                                onClick={() => setOpenMenuId(null)}
                            />

                            <div className="tm-action-menu">

                                <button onClick={() => navigate("/chats")}>
                                    <User size={14} />
                                    Personal chat
                                </button>

                                {match.existingGroupId && (
                                    <button onClick={() => navigate("/chats")}>
                                        <ShieldPlus size={14} />
                                        Join group
                                    </button>
                                )}

                            </div>
                        </>
                    )}

                </div>

            </div>
        );
    })}
</div>
}

export default TripMatches;