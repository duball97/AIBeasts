  import React, { useRef, useState, useEffect } from "react";
  import "./Memes.css";
  import axios from "axios";
  import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
  import { PayForCredits } from "./PayForCredits";
  import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

  /** 1) Utility to convert base64 to File */
  function dataURLToFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid data URL");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /** 2) Imgur upload function */
  const IMGUR_API_URL = "https://api.imgur.com/3/image";
  const CLIENT_ID = "6edca67137f0998"; // Your Imgur Client ID

  async function uploadImageToImgur(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(IMGUR_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${CLIENT_ID}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        console.log("Image uploaded to Imgur:", data.data.link);
        return data.data.link; // The Imgur link
      } else {
        throw new Error("Failed to upload image to Imgur");
      }
    } catch (error) {
      console.error("Error uploading image to Imgur:", error);
      return null;
    }
  }

  const Memes = () => {
    const [credits, setCredits] = useState(10);
    const [customPrompt, setCustomPrompt] = useState("");
    const [topText, setTopText] = useState("");
    const [bottomText, setBottomText] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // We'll store the final Imgur link after uploading for share
    const [imgurLink, setImgurLink] = useState("");

    const canvasRef = useRef(null);

    /** Draw text helper */
    const drawText = (ctx, text, x, y, maxWidth) => {
      const words = text.split(" ");
      let line = "";
      const lineHeight = 30;

      words.forEach((word, i) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, x, y);
          ctx.strokeText(line, x, y);
          line = word + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      });

      ctx.fillText(line, x, y);
      ctx.strokeText(line, x, y);
    };

    /**
     * After "imageUrl" or "topText"/"bottomText" changes,
     * we draw the meme on the canvas.
     */
    useEffect(() => {
      if (!imageUrl) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.crossOrigin = "anonymous"; 
      img.src = imageUrl;

      img.onload = async () => {
        // Adjust canvas to half image size for convenience
        canvas.width = img.width / 2;
        canvas.height = img.height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        ctx.font = "45px Impact";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";

        const maxWidth = canvas.width * 0.9;

        // Draw top/bottom text
        if (topText) {
          drawText(ctx, topText, canvas.width / 2, 70, maxWidth);
        }
        if (bottomText) {
          const yPosition = canvas.height - 40;
          drawText(ctx, bottomText, canvas.width / 2, yPosition, maxWidth);
        }

        // ===== After drawing is done, automatically upload + save to Supabase =====
        // 1. Convert canvas to a File
        const base64Image = canvas.toDataURL("image/png");
        const memeFile = dataURLToFile(base64Image, "meme.png");

        // 2. Upload to Imgur
        const uploadedUrl = await uploadImageToImgur(memeFile);
        if (!uploadedUrl) {
          console.error("Failed to upload to Imgur. Meme not saved.");
          return;
        }

        setImgurLink(uploadedUrl); // So user can share from Imgur link

        // 3. Save to Supabase
        try {
          const saveResponse = await axios.post("http://localhost:3003/api/save-meme", {
            prompt: customPrompt,
            imgUrl: uploadedUrl,
            walletAddress: "SAMPLE_WALLET_ADDRESS", // Or actual user wallet
          });
          if (saveResponse.data.meme) {
            console.log(
              "Meme saved in Supabase, ID:",
              saveResponse.data.meme.id
            );
          }
        } catch (err) {
          console.error("Error saving meme to Supabase:", err);
        }
      };

      img.onerror = () => {
        console.error("Failed to load the image from base64 URL.");
      };
    }, [imageUrl, topText, bottomText]);

    /**
     * 1) Call /api/generate-meme to get base64 image, top/bottom text
     * 2) Deduct credits
     * 3) Set state => triggers re-draw + Imgur upload + saving
     */
    const generateMeme = async () => {
      if (!customPrompt.trim()) {
        alert("Please enter a meme prompt!");
        return;
      }

      if (credits <= 0) {
        alert("Not enough credits! Please buy more to generate memes.");
        return;
      }

      try {
        const response = await axios.post("http://localhost:3003/api/generate-meme", {
          prompt: customPrompt,
        });

        const { imageUrl, topText, bottomText } = response.data;

        console.log("Meme generated by server:", { imageUrl, topText, bottomText });
        setImageUrl(imageUrl);
        setTopText(topText);
        setBottomText(bottomText);

        setCredits((prevCredits) => prevCredits - 1);
      } catch (error) {
        console.error("Error generating meme:", error.message);
        alert("Failed to generate the meme. Please try again.");
      }
    };

    const handleCreditsUpdate = (newCredits) => {
      setCredits((prevCredits) => prevCredits + newCredits);
      alert(`You successfully purchased ${newCredits} credits!`);
    };

    /** Allows user to directly download the canvas as a PNG */
    const handleDownload = () => {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL();
      link.click();
    };

    /**
     * Share: Re-upload or reuse the last known Imgur link (imgurLink).
     * For best previews, consider using the full Imgur page link if available.
     */
    const handleShare = async (platform) => {
      if (!imgurLink) {
        alert("No Imgur link found. Generate a meme first!");
        return;
      }

      // For best social previews, you might want `https://imgur.com/<imageId>`
      // But we'll use direct link here.
      const shareUrl = encodeURIComponent(imgurLink);

      if (platform === "twitter") {
        const url = `https://twitter.com/intent/tweet?text=Check%20out%20my%20meme!&url=${shareUrl}`;
        window.open(url, "_blank");
      } else if (platform === "facebook") {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        window.open(fbUrl, "_blank");
      } else if (platform === "instagram") {
        alert("Instagram sharing is not supported directly. Download and share manually.");
      }
    };

    return (
      <div className="page-wrapper">
        <div className="top-bar">
          <WalletMultiButton />
        </div>

        <div className="content-box">
          <h1 className="title">AI Meme Generator</h1>

          <canvas ref={canvasRef} className="meme-canvas" />

          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter meme description"
            className="meme-input"
          />

          <div className="buttons">
            <button onClick={generateMeme} className="btn generate">
              Generate Meme
            </button>
            <button onClick={handleDownload} className="btn download">
              Download Meme
            </button>
          </div>

          {/* Once we have an imageUrl, we can let the user share */}
          {imageUrl && (
            <div className="share-buttons">
              <h3>Share Your Meme</h3>
              <button onClick={() => handleShare("twitter")} className="btn twitter">
                <FaTwitter />
              </button>
              <button onClick={() => handleShare("facebook")} className="btn facebook">
                <FaFacebook />
              </button>
              <button onClick={() => handleShare("instagram")} className="btn instagram">
                <FaInstagram />
              </button>
            </div>
          )}

          <div className="credits-container">
            <span>Credits Left:</span>
            <span className="credits-badge">{credits}</span>
            <div className="pay-credits-button">
              <PayForCredits onCreditsPurchase={handleCreditsUpdate} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Memes;
