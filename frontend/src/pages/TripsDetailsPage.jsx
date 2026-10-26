import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  UserPlus,
  Check,
  MessageCircle,
  Compass,
  Loader,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { getTripById } from "../api/tripApi";
import {
  findExistingGroup,
  getGroupMembers,
  joinGroup,
  checkIsMember,
  createGroup
} from "../api/groupApi";

import "../styles/TripsDetailsPage.css";

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Trip state ──────────────────────────────────────────
  const [trip, setTrip] = useState(location.state?.trip || null);
  const [loading, setLoading] = useState(!location.state?.trip);
  const [error, setError] = useState(null);

  // ── Group state ─────────────────────────────────────────
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // ── 1. Fetch trip if not passed via state (direct URL visit) ──
  useEffect(() => {
    if (trip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getTripById(tripId)
      .then((res) => {
        const found = res.data;
        setTrip({
          id: found.trip.id,
          sourcePoint: found.trip.sourcePoint || found.trip.source,
          boardingStation: found.trip.boardingStation,
          finalDestination: found.trip.destination || "",
          travelDate: found.trip.travelDateTime.split("T")[0],
          travelTime: found.trip.travelDateTime.split("T")[1].substring(0, 5),
          postedBy: found.postedBy,
          rawTrip: found.trip,
        });
      })
      .catch(() => setError("Failed to load trip details."))
      .finally(() => setLoading(false));
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Fetch group + members once we have the trip ──
  useEffect(() => {
    if (!trip) return;

    const source =
      trip.rawTrip?.sourcePoint || trip.rawTrip?.source || trip.sourcePoint;
    const station = trip.rawTrip?.boardingStation || trip.boardingStation;
    const date = trip.travelDate;

    if (!source || !station || !date) return;

    setGroupLoading(true);

    findExistingGroup(source, station, date)
      .then(async (res) => {
        // 204 No Content → no group created yet
        if (res.status === 204 || !res.data) {
          setGroupLoading(false);
          return;
        }

        const groupData = res.data;
        setGroup(groupData);

        // Fetch members + membership check in parallel
        const promises = [getGroupMembers(groupData.id)];
        if (user?.id) {
          promises.push(checkIsMember(groupData.id, user.id));
        }

        const results = await Promise.allSettled(promises);

        // Members
        if (results[0].status === "fulfilled") {
          setMembers(results[0].value.data);
        }

        // Membership
        if (results[1]?.status === "fulfilled") {
          setIsMember(results[1].value.data === true);
        }
      })
      .catch((err) => {
        console.error("Failed to load group info:", err);
      })
      .finally(() => setGroupLoading(false));
  }, [trip, user]); 
  const[chatLoading, setChatLoading] = useState(false);
  const handleChatClick = async () => {
    if(!trip) return;
    setChatLoading(true);
    const source = trip.rawTrip?.sourcePoint || trip.sourcePoint;
    const station = trip.rawTrip?.boardingStation || trip.boardingStation;
    const date = trip.travelDate;
    try{
      const existingRes = await findExistingGroup(source, station, date);
      if(existingRes.status === 200 && existingRes.data?.id){
        const existingGroupId =existingRes.data.id;
         
        try {
          await joinGroup(existingGroupId);
        } catch (joinErr) {

          
        }
        navigate(`/chats?groupId=${existingGroupId}`);
        return;
      }
      const createRes = await createGroup({
        sourcePoint: source,
        boardingStation: station,
        travelDate: date,
        initialMemberId: trip.rawTrip?.userId,
      });
      if(createRes.data?.id){
        navigate(`/chats?groupId=${createRes.data.id}`);
        
      }
      
    }
    catch (err) {
      if(err.response?.data?.error === "GroupAlreadyExistsException"){
        const res = await findExistingGroup(source, station, date);
        if(res.data?.id){
          navigate(`/chats?groupId=${res.data.id}`);
          return;
        }
      }
      console.error("Failed to open chat:", err);
      alert(err.response?.data?.message || "Failed to open chat. Please try again.");
    }
    finally{
      setChatLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-container">
          <div className="loading-state animate-in">
            <Loader size={24} className="spinner" />
            <p>Loading trip details…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──
  if (error || !trip) {
    return (
      <div className="trip-detail-page">
        <div className="trip-detail-container">
          <Link to="/trips" className="back-link animate-in">
            <ArrowLeft size={16} />
            Back to trips
          </Link>
          <div className="not-found-card animate-in" style={{ animationDelay: "0.05s" }}>
            <p>{error || "This trip doesn't exist, or it's been taken down."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-detail-page">
      <div className="trip-detail-container">

        <Link to="/trips" className="back-link animate-in">
          <ArrowLeft size={16} />
          Back to trips
        </Link>

        {/* ─── Trip Details Card ─── */}
        <div className="detail-card animate-in" style={{ animationDelay: "0.05s" }}>
          <p className="header-label">
            <Compass size={16} strokeWidth={2.5} />
            Squad trip
          </p>

          <h1 className="trip-detail-route">
            {trip.sourcePoint}
            <ArrowRight size={22} className="trip-arrow" />
            {trip.boardingStation}
          </h1>

          <div className="trip-detail-list">
            {trip.finalDestination && (
              <div className="trip-detail-item">
                <MapPin size={18} className="trip-detail-icon" />
                <div>
                  <span className="trip-detail-label">Final destination</span>
                  <span className="trip-detail-value">{trip.finalDestination}</span>
                </div>
              </div>
            )}

            <div className="trip-detail-item">
              <Calendar size={18} className="trip-detail-icon" />
              <div>
                <span className="trip-detail-label">Travel date</span>
                <span className="trip-detail-value">{fmtDate(trip.travelDate)}</span>
              </div>
            </div>

            <div className="trip-detail-item">
              <Clock size={18} className="trip-detail-icon" />
              <div>
                <span className="trip-detail-label">Departure time</span>
                <span className="trip-detail-value">{trip.travelTime}</span>
              </div>
            </div>

            <div className="trip-detail-item">
              <User size={18} className="trip-detail-icon" />
              <div>
                <span className="trip-detail-label">Posted by</span>
                <span className="trip-detail-value">{trip.postedBy}</span>
              </div>
            </div>
          </div>
        </div>


                {/* ─── Actions Card ─── */}
        <div className="detail-card actions-card animate-in" style={{ animationDelay: "0.1s" }}>
          <button
            className="join-btn"
            onClick={handleChatClick}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <>
                <Loader size={18} className="spinner" />
                Opening chat…
              </>
            ) : (
              <>
                <MessageCircle size={18} />
                {isMember ? "Open squad chat" : "Chat with squad"}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
