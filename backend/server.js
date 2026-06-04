const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

function isValidYoutubeUrl(url) {
  return (
    typeof url === "string" &&
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url)
  );
}

app.post("/download", (req, res) => {
  const { url, format } = req.body;

  if (!url) return res.status(400).send("No URL provided");
  if (!isValidYoutubeUrl(url)) return res.status(400).send("Invalid URL");

  const fileName = `download_${Date.now()}.${format === "mp3" ? "mp3" : "mp4"}`;

  const args =
    format === "mp3"
      ? [
          "--no-playlist",
          "-x",
          "--audio-format",
          "mp3",
          "-o",
          fileName,
          url
        ]
      : [
          "--no-playlist",
          "-f",
          "bv*+ba/b",
          "--merge-output-format",
          "mp4",
          "-o",
          fileName,
          url
        ];

  const yt = spawn("python", ["-m", "yt_dlp", ...args]);

  yt.on("close", () => {
    const filePath = path.join(__dirname, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(500).send("Download failed");
    }

    res.download(filePath, fileName, (err) => {
      // delete AFTER sending
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});