const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 10000;

app.use(cors());

// Health Check
app.get('/', (req, res) => {
    res.send("VFF BG Remover API is Live and Fixed!");
});

app.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send("Bhai, image upload nahi hui.");
        }

        console.log(`Processing image: ${req.file.originalname} (${req.file.mimetype})`);

        // FIX: Buffer ko Uint8Array mein badalna zaroori hai AI model ke liye
        const uint8Array = new Uint8Array(req.file.buffer);

        // AI Background Removal Process
        // Yahan hum explicitly image data pass kar rahe hain
        const blob = await removeBackground(uint8Array);
        
        // Blob se Buffer mein conversion
        const arrayBuffer = await blob.arrayBuffer();
        const outputBuffer = Buffer.from(arrayBuffer);

        res.set("Content-Type", "image/png");
        res.send(outputBuffer);
        
        console.log("Success: Background removed!");

    } catch (error) {
        console.error("AI Error Detailed:", error);
        res.status(500).send("AI Processing failed: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
