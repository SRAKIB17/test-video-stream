const express = require("express");
const app = express();
const fs = require("fs");
const rangeParser = require("range-parser");

const videoPath = 'JAIMA NOOR Sobor Shekho He Ummat সবর শেখো হে উম্মাত Heart Touching Islamic Song.mp4';


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});



// Function to get video metadata
const getVideoMetadata = ({ path }) => {
    const videoStat = fs.statSync(videoPath);
    const videoSize = videoStat.size;
    const contentType = 'video/mp4'; // Adjust content type based on video format
    return { videoSize, contentType };
};

app.get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
        return;
    }

    // const videoPath = "eid.mp4";
    const videoPath = 'JAIMA NOOR Sobor Shekho He Ummat সবর শেখো হে উম্মাত Heart Touching Islamic Song.mp4';

    const { videoSize, contentType } = getVideoMetadata({ path: videoPath });

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": contentType,
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(8000, function () {
    console.log("Listening on port 8000!");
});
