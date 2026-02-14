const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();

// FIX: memoryBuffer ki jagah memoryStorage use karna hai
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;

// Sabhi origins ko allow karne ke liye (CORS)
app.use(cors());

// Home route taaki pata chale server on hai
app.get('/', (req, res) => {
    res.send("VFF BG Remover API is Live! Use /remove-bg to process images.");
});

// Main Route: Image upload karke background hatana
app.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No image uploaded. Please send a file with key 'image'.");
        }

        console.log("Processing image for background removal...");
        
        // AI Model processing
        const blob = await removeBackground(req.file.buffer);
        
        // Blob ko buffer mein convert karna Render ke liye
        const buffer = Buffer.from(await blob.arrayBuffer());

        // Response settings
        res.set("Content-Type", "image/png");
        res.send(buffer);
        
        console.log("Image processed successfully!");

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).send("AI Processing failed: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
