const express = require("express");
const app = express();
const fs = require("fs");
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    const videoPath = 'JAIMA NOOR Sobor Shekho He Ummat সবর শেখো হে উম্মাত Heart Touching Islamic Song.mp4';

    const video = fs.statSync(videoPath);

    // const video = fs.statSync(videoPath, { bigint: true });

    const videoSize = video.size;
    const CHUNK_SIZE = 10 ** 6; // 1MB

    const start = Number(range.replace(/\D/g, ""));



    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    console.log(range)

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        // "Content-Type": "video/mp4",
    };

    console.log(`bytes ${start}-${end}/${videoSize}`,)

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});
// more code will go in here just befor the listening function

app.listen(8000, function () {
    console.log("Listening on port 8000!");
});
// test.mp4