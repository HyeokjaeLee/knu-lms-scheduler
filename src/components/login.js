import React from "react";
function Login(props) {
  const semester = ["2021년1학기"];
  return (
    <button
      className="login"
      onClick={() => window.api.send("toMain", semester)}
    >
      Sign in
    </button>
  );
}

export default Login;
