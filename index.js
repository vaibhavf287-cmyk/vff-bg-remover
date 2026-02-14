const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/', (req, res) => {
    res.send("VFF BG Remover API is Live! Server is ready.");
});

app.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send("Bhai, image upload nahi hui sahi se.");
        }

        console.log("Processing image for background removal...");
        
        // Fix: Image buffer ko Uint8Array mein convert karna zaroori hai
        const imageSource = new Uint8Array(req.file.buffer);

        // AI Model processing
        const blob = await removeBackground(imageSource);
        
        // Result convert to buffer
        const arrayBuffer = await blob.arrayBuffer();
        const outputBuffer = Buffer.from(arrayBuffer);

        res.set("Content-Type", "image/png");
        res.send(outputBuffer);
        
        console.log("Success: Background removed!");

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).send("AI Processing failed: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
