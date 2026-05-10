// src/searchEngine/loader.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildIndex } from "./indexBuilder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");

const FILES = [
  "metadata.json",
  "tables.json",
  "sections.json",
  "views.json",
  "explanations.json",
  "examples.json",
];

export async function loadAll() {
  const rawData = {};

  for (const f of FILES) {
    const filePath = path.join(DATA_DIR, f);
    const jsonText = fs.readFileSync(filePath, "utf8");
    rawData[f] = JSON.parse(jsonText);
  }

  buildIndex(rawData);
}
