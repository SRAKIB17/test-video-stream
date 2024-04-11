const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Function to transcode video to MP4 format
const transcodeToMP4 = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .on("end", () => resolve(outputPath))
            .on("error", (err) => reject(err))
            .run();
    });
};

// Function to get file metadata (size and content type)
const getFileMetadata = (filePath) => {
    const fileStat = fs.statSync(filePath);
    const fileSize = fileStat.size;
    const contentType = getContentType(filePath);
    return { fileSize, contentType };
};

// Function to determine content type based on file extension
const getContentType = (filePath) => {
    const extname = path.extname(filePath).toLowerCase();
    switch (extname) {
        case ".mp4":
            return "video/mp4";
        case ".webm":
            return "video/webm";
        case ".ogg":
            return "video/ogg";
        case ".mp3":
            return "audio/mpeg";
        case ".wav":
            return "audio/wav";
        case ".ogg":
            return "audio/ogg";
        default:
            return "application/octet-stream"; // Default to binary data if type not recognized
    }
};

// Route to serve video files with transcoding to MP4 if needed
app.get("/video", async function (req, res) {

    const filename = 'JAIMA NOOR Sobor Shekho He Ummat সবর শেখো হে উম্মাত Heart Touching Islamic Song.mp4';

    // const { filename } = req.params;
    const filePath = path.join(__dirname, "media", filename); // Assuming media files are stored in a "media" directory

    fs.stat(filePath, async (err, stat) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.status(404).send("File not found");
            } else {
                res.status(500).send("Internal Server Error");
            }
            return;
        }

        const { fileSize, contentType } = getFileMetadata(filePath);

        // Check if transcoding to MP4 is required
        if (contentType !== "video/mp4") {
            const mp4FilePath = path.join(__dirname, "temp", `${filename}.mp4`); // Temporary MP4 file path
            try {
                await transcodeToMP4(filePath, mp4FilePath);
                const { fileSize: mp4FileSize } = getFileMetadata(mp4FilePath);
                sendVideoFile(mp4FilePath, mp4FileSize, res);
            } catch (err) {
                console.error("Error transcoding video:", err);
                res.status(500).send("Error transcoding video");
            }
        } else {
            sendVideoFile(filePath, fileSize, res);
        }
    });
});

// Function to send video file in response
const sendVideoFile = (filePath, fileSize, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Range header is required");
        return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4", // Always serve as MP4 after transcoding
    };

    res.writeHead(206, headers);
    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
};

// Serve index.html or other static content
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
const PORT = 8000;
app.listen(PORT, function () {
    console.log(`Server is running on port ${PORT}`);
});
