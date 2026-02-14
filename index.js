const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Jimp = require('jimp');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 10000;

app.use(cors());

app.get('/', (req, res) => res.send("VFF API is Active!"));

app.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No file uploaded.");

        console.log("Normalizing image format with Jimp...");
        
        // 1. Jimp se image load karo (ye kisi bhi format ko handle kar lega)
        const image = await Jimp.read(req.file.buffer);
        
        // 2. Image ko PNG buffer mein convert karo taaki AI model ko pasand aaye
        const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        
        // 3. Uint8Array mein convert karke AI ko do
        const uint8Array = new Uint8Array(pngBuffer);

        console.log("Starting AI Background Removal...");
        const blob = await removeBackground(uint8Array);
        
        const outputBuffer = Buffer.from(await blob.arrayBuffer());

        res.set("Content-Type", "image/png");
        res.send(outputBuffer);
        console.log("Done! Background Removed.");

    } catch (error) {
        console.error("AI Error Detailed:", error);
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
