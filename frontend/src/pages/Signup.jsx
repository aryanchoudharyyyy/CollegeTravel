import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, BookOpen, Calendar, ArrowRight, Compass } from "lucide-react";
import "../styles/Auth.css";
import { signup } from "../api/authApi";

function Signup() {
  const [name, setName] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

async  function handleSubmit(e) {
    e.preventDefault();
   try {
    const response = await signup({
      name, collegeEmail, branch, year
    });
     
    console.log("Signup successfull "+ response.data);
    navigate("/otpVerification", {
      state: collegeEmail
    });
   } catch (error) {
            console.log("Signup failed:", error);

        // temporarily just see the backend error
        console.log(error.response?.data);

   }
  }

  return (
    <div className="auth-wrapper">
      {/* Left — Image Panel (slides in from left) */}
      <div className="auth-image-panel">
        <img src="/auth-hero.jpg" alt="Students on campus" />
        <div className="auth-image-overlay">
          <h2>Join<br />College Travel</h2>
          <p>Connect with your campus. Find squads, share rides, and make every trip count.</p>
        </div>
      </div>

      {/* Right — Form Panel (slides in from right) */}
      <div className="auth-form-panel">


        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Compass size={26} />
            </div>
            <span className="auth-brand-name">College Travel</span>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join your campus travel community</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-icon" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g., Aman Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">College Email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="e.g., aman.sharma@college.edu"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-input-group">
                <label className="auth-label">Branch</label>
                <div className="auth-input-wrapper">
                  <BookOpen size={18} className="auth-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g., CSE"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Year</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} className="auth-icon" />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="auth-input"
                    placeholder="1-5"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-btn-submit">
              Create account
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <span>
              Already have an account?{" "}
              <button className="auth-link" onClick={() => navigate("/login")}>
                Log in
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;