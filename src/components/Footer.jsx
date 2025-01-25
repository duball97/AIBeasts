import React from "react";
import "./Footer.css"; // Import the CSS for styling

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Markl. All rights reserved.</p>
                <div className="footer-links">
                    <a href="https://dexscreener.com/solana/8aLJPH2QwBSsVyDMred3qcCPjtu9djPQhbthu9Rvpump">CA</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;