
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Clock,
  MessageSquare,
  User,
  ShieldPlus,
} from "lucide-react";
import "../styles/TripMatches.css";
import { createGroup, joinGroup } from "../api/groupApi";


// "Aman Sharma" -> "AS"
function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Format date and time
function formatDateTime(dateTime) {
  const date = new Date(dateTime);

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),

    time: date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function TripMatches() {
  const navigate = useNavigate();
  const location = useLocation();

  const matches = location.state?.matches || [];
  const myTrip = location.state?.myTrip;

  console.log("MATCHES:", matches);
  console.log("MY TRIP:", myTrip);

  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId((current) => (current === id ? null : id));
  };
  const handleCreateGroup = async () => {
    if(!myTrip){
        console.log("Trip data not available");
        return false;
    }
    const groupData = {
        sourcePoint: myTrip.sourcePoint,
        boardingStation: myTrip.boardingStation,
        travelDate: myTrip.travelDateTime.split("T")[0]
    };
    console.log("GROUP DATA:", groupData);
    try {
        const response = await createGroup(groupData);
        console.log("Group Created successfully:", response.data);
        return true;
    } catch (error) {
        console.log(
            "Failed to create group:", error.response?.data || error.message
        );
        return false;
        
    }
  };

  return (
    <div className="tm-match-list" style={{ paddingTop: "24px" }}>
            {/* No matches */}
      {matches.length === 0 ? (
        <div className="tm-no-matches">
          <h2>No matches found</h2>

          <p>
            We couldn't find anyone traveling on a similar trip yet.
          </p>

          <p>
            Create a group and students with a similar trip
            can join it later.
          </p>

          {/* NEW BUTTON ADDED HERE */}
          <button 
            className="tm-post-trip-btn" 
            style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            onClick={async () => {
              const created = await handleCreateGroup();
              if(created){
                navigate("/chats");
              }
            }}
          >
            <ShieldPlus size={16} />
            Create Group
          </button>
        </div>
      ) : (
        /* Matches */
        matches.map((match) => {
          const { date, time } = formatDateTime(
            match.trip.travelDateTime
          );

          return (
            <div
              key={match.trip.id}
              className="tm-match-card"
            >
              {/* Avatar */}
              <div className="tm-match-avatar">
                {getInitials(match.name)}
              </div>

              {/* Match information */}
              <div className="tm-match-body">
                {/* Name + group badge */}
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

                {/* Route */}
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

                {/* Date + time */}
                <div className="tm-match-time">
                  <Clock size={14} />
                  <span>
                    {date} at {time}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="tm-match-actions">
                <button
                  className="tm-chat-btn"
                  aria-expanded={
                    openMenuId === match.trip.id
                  }
                  onClick={() =>
                    toggleMenu(match.trip.id)
                  }
                >
                  <MessageSquare size={16} />
                  Chat
                </button>

                {/* Chat menu */}
                {openMenuId === match.trip.id && (
                  <>
                    <div
                      className="tm-menu-backdrop"
                      onClick={() =>
                        setOpenMenuId(null)
                      }
                    />

                    <div className="tm-action-menu">
                      {/* Personal chat */}
                      <button
                        onClick={async () => {
                        const created = await handleCreateGroup();
                          setOpenMenuId(null);
                          if(created){
                          navigate("/chats");
                          }
                        }}
                      >
                        <User size={14} />
                        Personal chat
                      </button>

                      {/* Join group */}
                      {match.existingGroupId && (
                        <button
                          onClick={async () => {
                            setOpenMenuId(null);
                            try {
                            const join = await joinGroup(match.existingGroupId);
                            if(join){  
                              console.log("Join Group successfully:", join.data);
                            navigate("/chats");  
                            }
                            } catch (error) {
                              console.log("Failed to join group", error.response?.data || error.message);
                            }
                            
                          }}
                        >
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
        })
      )}
    </div>
  );
}

export default TripMatches;



