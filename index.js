const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const upload = multer({ storage: multer.memoryBuffer() });
const PORT = process.env.PORT || 3000;

app.use(cors());

app.post('/remove-bg', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No image uploaded.");

        console.log("Processing background removal...");
        const blob = await removeBackground(req.file.buffer);
        const buffer = Buffer.from(await blob.arrayBuffer());

        res.set("Content-Type", "image/png");
        res.send(buffer);
        console.log("Success!");
    } catch (error) {
        console.error(error);
        res.status(500).send("AI Processing failed.");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
