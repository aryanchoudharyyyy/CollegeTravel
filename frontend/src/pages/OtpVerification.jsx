import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ShieldCheck, Compass } from "lucide-react";
import "../styles/Auth.css";
import { verifyOtp } from "../api/authApi";

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser } = useAuth();
  const location = useLocation();
  const collegeEmail = location.state?.collegeEmail;
  console.log("College Email:", collegeEmail);

  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [timer]);

  // Logic for when they type 
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Stop if they typed a letter 
    
    const newOtp = [...otp];
    // Only keep the very last number they typed in this specific box   
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // If they typed a number, and it's not the last box, laser point to the next box and focus it!
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

async  function handleVerify(e) {
    e.preventDefault();
    const otpValue = otp.join("");

    
  try {
    const response = await verifyOtp(collegeEmail,otpValue);
    
    // AuthContext me user ko logged in mark karein
    setIsLoggedIn(true);
    
    // Tokens ko localStorage me save karein (agar backend tokens bhej raha hai)
    if(response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
    }
    
    navigate("/home");
  } catch (error) {
    console.log(error.response?.data);
  }
    
  }

  return (
    <div className="auth-wrapper">
      {/* Left — Image Panel (slides in from left) */}
      <div className="auth-image-panel">
        <img src="/auth-hero.jpg" alt="Students on campus" />
        <div className="auth-image-overlay">
          <h2>Almost<br />There!</h2>
          <p>Just one more step to join your campus travel community.</p>
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

          {/* Header with shield icon */}
          <div className="auth-header">
            <div className="otp-icon-circle">
              <ShieldCheck size={30} />
            </div>
            <h1>Verify Your Email</h1>
            <p>We've sent a 6-digit code to your college email</p>
          </div>

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
           
            <button type="submit" className="btn btn-primary auth-btn-submit">
              Verify code
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
              <button className="resend-link" onClick={() => setTimer(30)}>
                Resend Code
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;