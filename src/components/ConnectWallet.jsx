import React from "react";
import VortexConnect from "./VortexConnect"; // Same component as in Header
import "./ConnectWallet.css";

function Connect() {
  return (
    <div className="sign-in-page">
      <div className="sign-in-box">
        <h2>Connect Your EVM Wallet</h2>

        {/* 
          We remove the form with email/password
          and simply show the wallet connect button 
        */}
        <VortexConnect />
      </div>
    </div>
  );
}

export default Connect;
