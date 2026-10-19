import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ShieldCheck, Compass } from "lucide-react";
import "../styles/Auth.css";
import { verifyOtp, sendOtp } from "../api/authApi";
import { setTokens } from "../utils/token";

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const location = useLocation();
  const collegeEmail = location.state?.collegeEmail;

  // Safeguard: Redirect to login if user directly visited/refreshed without email state
  useEffect(() => {
    if (!collegeEmail) {
      navigate("/login", { replace: true });
    }
  }, [collegeEmail, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [timer]);

  // Logic for typing in 6-digit OTP boxes
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (!collegeEmail || resending) return;
    setError("");
    setSuccessMsg("");
    setResending(true);
    try {
      await sendOtp(collegeEmail);
      setTimer(30);
      setSuccessMsg("A new code has been sent to your college email.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        "Failed to resend code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  async function handleVerify(e) {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await verifyOtp(collegeEmail, otpValue);
      if (response.data?.accessToken && response.data?.refreshToken) {
        setTokens(response.data.accessToken, response.data.refreshToken);
      }
      setIsLoggedIn(true);
      navigate("/home");
    } catch (err) {
      console.error("OTP verification failed:", err);
      const errMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        "Invalid or expired OTP. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Left — Image Panel */}
      <div className="auth-image-panel">
        <img src="/auth-hero.jpg" alt="Students on campus" />
        <div className="auth-image-overlay">
          <h2>Almost<br />There!</h2>
          <p>Just one more step to join your campus travel community.</p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Compass size={26} />
            </div>
            <span className="auth-brand-name">College Travel</span>
          </div>

          {/* Header with shield icon */}
          <div className="auth-header">
            <div className="otp-icon-circle">
              <ShieldCheck size={30} />
            </div>
            <h1>Verify Your Email</h1>
            <p>
              We've sent a 6-digit code to{" "}
              <strong>{collegeEmail || "your college email"}</strong>
            </p>
          </div>

          {/* Error & Success Feedback */}
          {error && <div className="auth-error">{error}</div>}
          {successMsg && <div className="auth-success">{successMsg}</div>}

          {/* OTP Form */}
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(reference) => (inputRefs.current[index] = reference)}
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn-submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>

          {/* Resend */}
          <p className="resend-text">
            Didn't receive your code?{" "}
            {timer > 0 ? (
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                00:{timer < 10 ? `0${timer}` : timer}
              </span>
            ) : (
              <button
                type="button"
                className="resend-link"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;