// backend/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/ask", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "codellama:7b-instruct",
    prompt: prompt,
    stream: false,
  });
  res.send({ result: response.data.response || "No response from LLM" });
});

app.listen(5001, () => {
  console.log("LLM proxy listening on port 5001");
});
