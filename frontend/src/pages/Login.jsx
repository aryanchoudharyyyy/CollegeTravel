import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Compass } from "lucide-react";
import { sendOtp } from "../api/authApi";
import "../styles/Auth.css";

function Login() {
  const [collegeEmail, setCollegeEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

async function handleSubmit(e) {
    e.preventDefault();
     if (!collegeEmail.includes("@")) {
        setError("Please enter a valid college email address!");
        return;
    }
    try {
      setError("");
      const response = await sendOtp(collegeEmail);
      console.log("OTP sent:", response.data);
      navigate("/otpVerification", {
        state: { collegeEmail }
      });
      
    } catch (error) {
       console.log(error);

        setError(
            error.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Left — Image Panel (slides in from left) */}
      <div className="auth-image-panel">
        <img src="/auth-hero.jpg" alt="Students on campus" />
        <div className="auth-image-overlay">
          <h2>Welcome to<br />College Travel</h2>
          <p>Your campus community, connected. Collaborate. Share. Grow together.</p>
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
            <h1>Welcome Back</h1>
            <p>Sign in with your college email to continue</p>
          </div>

          {/* Error */}
          {error && <div className="auth-error">{error}</div>}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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

            <button type="submit" className="btn btn-primary auth-btn-submit">
              Sign in to account
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <span>
              Don't have an account?{" "}
              <button className="auth-link" onClick={() => navigate("/signup")}>
                Sign up
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;