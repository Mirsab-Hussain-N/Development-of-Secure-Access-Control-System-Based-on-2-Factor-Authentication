import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const videoRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera error:", err));
  }, []);

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImage(dataUrl);
    return dataUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const captured = captureImage();

    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: captured }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      alert(data.message || data.error);

      if (response.ok && data.message && !data.error) {
        // Save name for dashboard greeting
        localStorage.setItem("userName", form.name);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Failed to connect to the server. Please make sure the backend is running.");
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <div className="left-section">
          <h2>Welcome!</h2>
          <p>Join us and get started with facial recognition signup.</p>
          <Link to="/login">
            <button className="outline-btn">Already have an account?</button>
          </Link>
        </div>

        <div className="right-section">
          <h2>Create Account</h2>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="100%"
            height="200"
            style={{ marginBottom: "15px", borderRadius: "8px" }}
          ></video>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button className="filled-btn" type="submit">Sign Up</button>
          </form>

          <div className="switch-text">
            Already registered? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
