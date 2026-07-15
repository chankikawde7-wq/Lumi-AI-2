import express from "express";
import path from "path";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: "50mb" }));

  // Setup multer for handling memory storage (we'll forward it directly)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
  });

  // API Route for background removal
  app.post("/api/remove-bg", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const apiKey = process.env.REMOVE_BG_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "REMOVE_BG_API_KEY is missing. Please configure it in your environment variables." });
      }

      const bgColor = req.body.bgColor || "transparent";

      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_file", req.file.buffer, req.file.originalname);

      if (bgColor !== "transparent") {
        formData.append("bg_color", bgColor);
      }

      const response = await axios({
        method: "post",
        url: "https://api.remove.bg/v1.0/removebg",
        data: formData,
        responseType: "arraybuffer",
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": apiKey,
        },
        validateStatus: () => true, // Handle errors manually
      });

      if (response.status !== 200) {
        const errorMsg = response.data ? Buffer.from(response.data).toString('utf-8') : "Failed to remove background";
        console.error("Remove.bg API Error:", response.status, errorMsg);
        let parsedError = errorMsg;
        try {
          const parsed = JSON.parse(errorMsg);
          if (parsed.errors && parsed.errors.length > 0) {
            parsedError = parsed.errors[0].title;
          }
        } catch(e) {}
        return res.status(response.status).json({ error: parsedError });
      }

      res.set("Content-Type", "image/png");
      res.send(response.data);
    } catch (error) {
      console.error("Error in /api/remove-bg:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });



  // API Route for image extension
  app.post("/api/extend-image", async (req, res) => {
    try {
      const { image, direction, aiMode, aspectRatio } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "STABILITY_API_KEY is missing. Please configure it in Settings." });
      }

      const base64Data = image.includes("base64,") ? image.split(",")[1] : image;
      const imageBuffer = Buffer.from(base64Data, "base64");
      
      const formData = new FormData();
      formData.append("image", imageBuffer, { filename: "image.jpg", contentType: "image/jpeg" });
      formData.append("output_format", "jpeg");

      const padding = 256;
      if (direction === "left" || direction === "horizontal" || direction === "all") {
        formData.append("left", padding);
      }
      if (direction === "right" || direction === "horizontal" || direction === "all") {
        formData.append("right", padding);
      }
      if (direction === "top" || direction === "vertical" || direction === "all") {
        formData.append("up", padding);
      }
      if (direction === "bottom" || direction === "vertical" || direction === "all") {
        formData.append("down", padding);
      }
      
      const promptMap: Record<string, string> = {
        "Auto Detect": "Seamless extension, high quality, highly detailed, maintain original style",
        "Realistic": "Photorealistic, highly detailed, 8k resolution, seamless extension, realistic lighting",
        "Nature": "Natural landscape, beautiful nature, seamless extension, high quality",
        "Portrait": "Portrait photography, studio lighting, highly detailed, seamless extension",
        "Architecture": "Architectural photography, sharp details, seamless extension",
        "Anime": "Anime style, high quality illustration, vibrant colors, seamless extension",
        "Digital Art": "Digital art painting, masterpiece, highly detailed, seamless extension"
      };
      
      const prompt = promptMap[aiMode] || promptMap["Auto Detect"];
      formData.append("prompt", prompt);

      const response = await axios({
        method: "post",
        url: "https://api.stability.ai/v2beta/stable-image/edit/outpaint",
        data: formData,
        responseType: "arraybuffer",
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "image/*"
        },
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        const errorMsg = response.data ? Buffer.from(response.data).toString('utf-8') : "Failed to outpaint";
        console.error("Stability API Error:", response.status, errorMsg);
        let parsedError = errorMsg;
        try {
          const parsed = JSON.parse(errorMsg);
          parsedError = parsed.message || parsed.errors?.[0] || parsedError;
        } catch(e) {}
        return res.status(response.status).json({ error: parsedError });
      }

      const extendedImageBase64 = Buffer.from(response.data).toString("base64");
      const extendedImage = `data:image/jpeg;base64,${extendedImageBase64}`;

      res.json({ resultUrl: extendedImage });
    } catch (error) {
      console.error("Error in /api/extend-image:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
