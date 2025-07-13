import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import loginLotties from "../assets/loginLottie.json";
import { Player } from "@lottiefiles/react-lottie-player";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Redirect to /dashboard if already authenticated (on mount)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const isSuccess = login(id, password);
    if (isSuccess) {
      navigate("/dashboard", { replace: true }); // ✅ replace history to disable going "back"
    } else {
      setError("Invalid ID or Password");
    }
  };

  return (
    <div className="bg-base-100 mx-auto mt-10 w-11/12 md:w-10/12 min-h-screen">
      <h1 className="text-5xl text-center">Please Login</h1>
      <div className="flex md:flex-row flex-col justify-center items-center">
        {/* Left Section */}
        <div className="flex justify-center items-center px-6 md:w-1/2 h-[300px] md:h-screen">
          <Player
            autoplay
            loop
            src={loginLotties}
            className="w-full max-w-sm h-full object-contain"
          />
        </div>

        {/* Right: Login Card */}
        <div className="bg-base-100 w-full md:w-2/3 h-full card shrink-0">
          <div className="shadow-xl mx-auto w-full md:w-8/12 card-body">
            <form onSubmit={handleLogin}>
              <fieldset className="space-y-4 p-10 fieldset">
                <label className="label">ID</label>
                <input
                  type="number"
                  className="input-bordered w-full input"
                  placeholder="Enter ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />

                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-bordered w-full input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="text-right">
                  <a className="link link-hover">Forgot password?</a>
                </div>

                {error && (
                  <div className="font-semibold text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button type="submit" className="mt-4 w-full btn btn-neutral">
                  Login
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
