import { useState, useEffect } from "react";
import { User, Mail, MapPin, GraduationCap, ShieldCheck, Settings, ArrowLeft, LockKeyhole, Verified } from "lucide-react";
import "../styles/Profile.css";
import { getCurrentUser, updateProfile } from "../api/authApi";
import { getMyTrips } from "../api/tripApi";
import { getMyGroups } from "../api/groupApi";

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function getGraduationYear(studyYear){
    const currentYear = new Date().getFullYear();
    const match = String(studyYear).match(/\d+/);
    const yr = match ? parseInt(match[0]):1;
    return String(currentYear + (4-yr));
}
function getCollegeFallback(email){
    if(!email) return "College Campus";
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if(domain.includes("kiet")) return "KIET Deemed To Be University";
    return domain.split(".")[0].toUpperCase();
}

function maskEmail(email) {
    const [user, domain] = email.split("@");
    if (!domain) return email;
    return `${user.slice(0, 3)}...@${domain}`;
}

function getInitials(name) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function Profile() {
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        college: "",
        location: "",
        course: "",
        year: "1st Year",
        graduationYear: "",
        verified: false,

    });
    const [stats, setStats] = useState({
        tripsCreated: 0,
        groupsJoined: 0,
    });

    // Draft state for editable fields
    const [draftName, setDraftName] = useState("");
    const [draftYear, setDraftYear] = useState("1st Year");
    const [draftCollege, setDraftCollege] = useState("");
    const [draftLocation, setDraftLocation]  = useState("");
    const [draftGraduationYear, setDraftGraduationYear] = useState("");
    // Load user data & real stats from backend
    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                const u = res.data;
                const gradYear = u.graduationYear || getGraduationYear(u.year);
                const loadedData = {
                    name: u.name || "",
                    email: u.collegeEmail || "",
                    college: u.college || getCollegeFallback(u.collegeEmail),
                    location: u.location || "Not set yet",
                    course: u.branch || "General",
                    year: u.year || "1st Year",
                    graduationYear: gradYear,
                    verified: u.verified ?? false,
                };
                setUserData(loadedData);
                setDraftName(loadedData.name);
                setDraftYear(loadedData.year);
                setDraftCollege(loadedData.college);
                setDraftLocation(u.location || "");
                setDraftGraduationYear(gradYear);
            })
            .catch((err) => console.error("Failed to load user profile:", err))
            .finally(() => setLoading(false));
        // Real travel stats
        getMyTrips()
            .then((res) => setStats((prev) => ({ ...prev, tripsCreated: res.data?.totalElements ?? res.data?.length ?? 0 })))
            .catch(() => {});
        getMyGroups()
            .then((res) => setStats((prev) => ({ ...prev, groupsJoined: res.data?.totalElements ?? res.data?.length ?? 0 })))
            .catch(() => {});
    }, []);    

    function handleEdit() {
        setDraftName(userData.name);
        setDraftYear(userData.year);
        setDraftCollege(userData.college);
        setDraftLocation(userData.location === "Not set yet" ? "" : userData.location);
        setDraftGraduationYear(userData.graduationYear);
        
        setEditing(true);
    }

    function handleCancel() {
        setEditing(false);
    }

  async  function handleSave() {
       try {
        setSaving(true);
        const res = await updateProfile({
            name: draftName,
            year: draftYear,
            college: draftCollege,
            location: draftLocation,
            graduationYear: draftGraduationYear,
        });
        setUserData((prev) => ({
           ...prev,
           name: res.data.name,
           year: res.data.year || draftYear,
           college: res.data.college || draftCollege,
           location: res.data.location || draftLocation || "Not set yet",
           graduationYear: res.data.graduationYear || draftGraduationYear,

        }));
        setEditing(false);
       } catch (error) {
        console.error("Failed to update profile:", error);
        alert("Failed to update profile. Please try again");
        
       }
       finally{
        setSaving(false);
       }
    }
    if(loading){
        return(
            <div className="pr-page" style={{ textAlign: "center", paddingTop: "80px"}}>
                <p>Loading Profile...</p>
            </div>
        );
    }


    // ── Edit Profile View ──
    if (editing) {
        return (
            <div className="pr-page">
                {/* Back header */}
                <button className="pr-back-btn animate-in" onClick={handleCancel}>
                    <ArrowLeft size={18} />
                    Profile
                </button>

                <div className="pr-page-title animate-in">
                    <h1>Edit Profile</h1>
                    <p>Update your personal and college information</p>
                </div>

                {/* Avatar section */}
                <div className="pr-edit-avatar-section animate-in" style={{ animationDelay: "0.05s" }}>
                    <div className="pr-edit-avatar">
                        <span className="pr-edit-avatar-initials">{getInitials(draftName)}</span>
                    </div>

                </div>

                {/* Personal Information */}
                <div className="pr-edit-section animate-in" style={{ animationDelay: "0.1s" }}>
                    <h3 className="pr-edit-section-title">Personal Information</h3>

                    <div className="pr-field">
                        <label className="pr-field-label">Full Name</label>
                        <input
                            className="pr-field-input"
                            type="text"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                        />
                    </div>

                    <div className="pr-field">
                        <label className="pr-field-label">
                            College Email
                            <LockKeyhole size={12} className="pr-lock-icon" />
                        </label>
                        <input
                            className="pr-field-input pr-field-locked"
                            type="email"
                            value={userData.email}
                            disabled
                        />
                        <span className="pr-field-hint">College email cannot be changed</span>
                    </div>
                      <div className="pr-field">
                        <label className="pr-field-label">Home Location / City</label>
                        <input
                            className="pr-field-input"
                            type="text"
                            placeholder="e.g., Ghaziabad, Uttar Pradesh"
                            value={draftLocation}
                            onChange={(e) => setDraftLocation(e.target.value)}
                        />
                    </div>
                </div>

                {/* College Information */}
                <div className="pr-edit-section animate-in" style={{ animationDelay: "0.15s" }}>
                    <h3 className="pr-edit-section-title">College Information</h3>

                    <div className="pr-field">
                        <label className="pr-field-label">
                            College
                            
                        </label>
                        <input
                            className="pr-field-input"
                            type="text"
                            value={draftCollege}
                            onChange={(e)=> setDraftCollege(e.target.value)}
                            
                        />
                    </div>

                    <div className="pr-field">
                        <label className="pr-field-label">
                            Course / Branch
                            <LockKeyhole size={12} className="pr-lock-icon" />
                        </label>
                        <input
                            className="pr-field-input pr-field-locked"
                            type="text"
                            value={userData.course}
                            disabled
                        />
                    </div>

                    <div className="pr-field">
                        <label className="pr-field-label">Year</label>
                        <select
                            className="pr-field-input pr-field-select"
                            value={draftYear}
                            onChange={(e) => setDraftYear(e.target.value)}
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pr-field">
                        <label className="pr-field-label">
                            Graduation Year
                            {/* <LockKeyhole size={12} className="pr-lock-icon" /> */}
                        </label>
                        <input
                            className="pr-field-input"
                            type="text"
                            placeholder="e.g., 2027"
                            value={draftGraduationYear}
                            onChange={(e)=> setDraftGraduationYear(e.target.value)}
                            
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pr-edit-actions animate-in" style={{ animationDelay: "0.2s" }}>
                    <button className="pr-btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
                    <button className="pr-btn-save" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
            </div>
        );
    }

    // ── Main Profile View ──
    return (
        <div className="pr-page">
            {/* ── Profile Header ── */}
            <div className="pr-page-title animate-in">
                <h1>Profile</h1>
                <p>Manage your profile and travel preferences</p>
            </div>

            <div className="pr-header-card animate-in">
                <div className="pr-avatar-large">
                    <User size={32} />
                </div>
                <div className="pr-user-info">
                    <h2>{userData.name}</h2>
                    <div className="pr-meta-row">
                        <span><Mail size={14} />{maskEmail(userData.email)}</span>
                    </div>
                    <div className="pr-meta-row">
                        <span><GraduationCap size={14} />{userData.college}</span>
                    </div>
                    <div className="pr-meta-row">
                        <span><MapPin size={14} />{userData.location}</span>
                    </div>
                    {userData.verified && (
                        <div className="pr-verified-badge">
                            <ShieldCheck size={14} /> College email verified
                        </div>
                    )}
                </div>
                <button className="pr-btn-secondary" onClick={handleEdit}>
                    <Settings size={16} /> Edit profile
                </button>
            </div>

            {/* ── About + Travel Stats ── */}
            <div className="pr-grid-2col animate-in" style={{ animationDelay: "0.1s" }}>
                <div className="pr-card">
                    <h3>About</h3>
                    <div className="pr-info-list">
                        <div className="pr-info-row">
                            <span className="pr-info-label">College</span>
                            <span className="pr-info-value">{userData.college.split(" ").slice(0, 1)[0]}</span>
                        </div>
                        <div className="pr-info-row">
                            <span className="pr-info-label">Course</span>
                            <span className="pr-info-value">{userData.course}</span>
                        </div>
                        <div className="pr-info-row">
                            <span className="pr-info-label">Year</span>
                            <span className="pr-info-value">{userData.year}</span>
                        </div>
                        <div className="pr-info-row">
                        <span className="pr-info-label">Graduation Year</span>
                        <span className="pr-info-value">{userData.graduationYear}</span>
                        </div>
                    </div>
                </div>

                <div className="pr-card">
                    <h3>Travel stats</h3>
                   <div className="pr-stats-list">
                        <div className="pr-stat-row">
                            <span className="pr-info-label">Trips created</span>
                            <span className="pr-stat-value">{stats.tripsCreated}</span>
                        </div>
                        <div className="pr-stat-row">
                            <span className="pr-info-label">Groups joined</span>
                            <span className="pr-stat-value">{stats.groupsJoined}</span>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default Profile;
