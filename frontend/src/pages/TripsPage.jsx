import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  Plus,
  Compass,
} from "lucide-react";

import "../styles/TripsPage.css";
import { getExploreTrips } from "../api/tripApi";
const TODAY = new Date();

const daysUntil = (dateStr) =>
  Math.round(
    (new Date(dateStr) - TODAY) / (1000 * 60 * 60 * 24)
  );



const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "departure", label: "Leaving soonest" }
];

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [sortKey, setSortKey] = useState("newest");

  useEffect(()=>{
    getExploreTrips()
      .then((response) => {
        const mappedTrips = response.data.map(item => ({
          id: item.trip.id,
          sourcePoint: item.trip.source,
           boardingStation: item.trip.boardingStation,
          finalDestination: item.trip.destination || "",
          travelDate: item.trip.travelDateTime.split('T')[0],
          // Grabs just the HH:mm portion of the time
          travelTime: item.trip.travelDateTime.split('T')[1].substring(0, 5), 
          postedBy: item.postedBy,
          rawTrip: item.trip // Keep the raw backend data just in case
        }));
        setTrips(mappedTrips);
      })
      .catch((error)=> {
        console.error("Failed to load explore feed:", error);
      });
  }, []);

  const sortedTrips = useMemo(() => {
    const list = [...trips];

    switch (sortKey) {
      case "departure":
        return list.sort(
          (a, b) => daysUntil(a.travelDate) - daysUntil(b.travelDate)
        );
      case "newest":
      default:
        return list.sort((a, b) => b.id - a.id);
    }
  }, [trips, sortKey]);

  return (
    <div className="trips-page">
      <div className="trips-container">

        {/* Header */}
        <div className="trips-header animate-in">
          <div className="header-content">

            <p className="header-label">
              <Compass size={16} strokeWidth={2.5} />
              Squad trips
            </p>

            <h1 className="header-title">
              Where's everyone headed?
            </h1>

            <p className="header-description">
              Browse trips other squads have posted, or put
              your own plan out there and let people join in.
            </p>

          </div>

          <button
            onClick={() => navigate("/post-trip")}
            className="post-trip-btn"
          >
            <Plus size={18} />
            Post a trip
          </button>
        </div>

        {/* Sort row */}
        <div className="sort-row animate-in" style={{ animationDelay: "0.05s" }}>
          <span className="sort-label">
            Sort by
          </span>

          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`sort-btn ${
                sortKey === opt.key ? "active" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Trip list */}
        <div className="trip-list">

          {sortedTrips.map((trip, index) => {
            return (
              <div
                key={trip.id}
                className="trip-card animate-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >

                {/* Main info */}
                <div className="trip-main">

                  <h2 className="trip-title">
                    {trip.sourcePoint}
                    <ArrowRight
                      size={18}
                      className="trip-arrow"
                    />
                    {trip.boardingStation}
                  </h2>

                  {trip.finalDestination && (
                    <p className="trip-description">
                      Final Destination: {trip.finalDestination}
                    </p>
                  )}

                  <div className="trip-meta">

                    <span className="trip-meta-item">
                      <Calendar size={15} />
                      {fmtDate(trip.travelDate)} at {trip.travelTime}
                    </span>



                    <span>
                      Posted by {trip.postedBy}
                    </span>

                  </div>
                </div>

                {/* Perforation */}
                <div className="trip-perforation">
                  <span className="perforation-circle top" />
                  <span className="perforation-circle bottom" />
                </div>

                {/* Action */}
                <div className="trip-action">
                  <button
                    className="view-trip-btn"
                    onClick={() => navigate("/view-details", { state: { trip } })}
                  >
                    View trip
                  </button>

                </div>
              </div>
            );
          })}

          {sortedTrips.length === 0 && (
            <div className="empty-state animate-in" style={{ animationDelay: "0.1s" }}>
              No trips posted yet. Be the first to plan one.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}