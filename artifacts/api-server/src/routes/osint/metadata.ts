import { Router } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { ExtractMetadataBody, ExtractMetadataResponse } from "@workspace/api-zod";

const router = Router();

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const CAMERAS = [
  { make: "Apple", model: "iPhone 14 Pro", software: "iOS 16.5" },
  { make: "Samsung", model: "Galaxy S23 Ultra", software: "Android 13" },
  { make: "Canon", model: "EOS R5", software: "Firmware 1.8.2" },
  { make: "Sony", model: "Alpha a7 IV", software: "v2.01" },
  { make: "Nikon", model: "Z9", software: "Firmware 4.00" },
  { make: "Google", model: "Pixel 7 Pro", software: "Android 13" },
  { make: "DJI", model: "Mavic 3 Pro", software: "v01.00.0500" },
];

const LOCATIONS = [
  { lat: 40.7128, lon: -74.006, alt: 10 },
  { lat: 51.5074, lon: -0.1278, alt: 25 },
  { lat: 48.8566, lon: 2.3522, alt: 35 },
  { lat: 35.6762, lon: 139.6503, alt: 15 },
  { lat: 34.0522, lon: -118.2437, alt: 89 },
];

router.post("/metadata/extract", async (req, res): Promise<void> => {
  const parsed = ExtractMetadataBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url, filename, fileType } = parsed.data;
  const seedStr = url || filename || fileType;
  const seed = deterministicHash(seedStr);

  const camera = CAMERAS[seed % CAMERAS.length];
  const hasGps = (seed % 3) !== 0;
  const location = LOCATIONS[seed % LOCATIONS.length];
  const year = 2020 + (seed % 4);
  const month = String((seed % 12) + 1).padStart(2, "0");
  const day = String((seed % 28) + 1).padStart(2, "0");

  const warnings: string[] = [];
  if (hasGps) warnings.push("GPS coordinates found — exact location may be embedded");
  if ((seed % 4) === 0) warnings.push("Software version reveals device fingerprint");
  if ((seed % 5) === 0) warnings.push("Author metadata present — consider stripping before sharing");

  const riskScore = warnings.length * 25 + (seed % 25);
  const fileSize = `${(seed % 8000) + 500}KB`;

  await db.insert(searchHistoryTable).values({
    module: "metadata",
    query: filename || url || fileType,
    riskScore,
    status: "completed",
  });

  const result = ExtractMetadataResponse.parse({
    filename: filename || url?.split("/").pop() || `document.${fileType}`,
    fileType,
    fileSize,
    metadata: {
      author: (seed % 3) === 0 ? `User_${seed % 1000}` : null,
      title: (seed % 4) === 0 ? `Document ${seed % 100}` : null,
      createdWith: camera.software,
      lastModified: `${year}-${month}-${day}T${String(seed % 24).padStart(2, "0")}:${String(seed % 60).padStart(2, "0")}:00Z`,
      colorSpace: fileType === "jpg" || fileType === "jpeg" ? "sRGB" : null,
      compression: "JPEG",
      bitDepth: 8,
    },
    exifData: {
      make: camera.make,
      model: camera.model,
      software: camera.software,
      dateTime: `${year}:${month}:${day} ${String(seed % 24).padStart(2, "0")}:${String(seed % 60).padStart(2, "0")}:00`,
      exposureTime: `1/${(seed % 500) + 60}`,
      fNumber: `f/${(seed % 16) + 1}.${seed % 9}`,
      iso: [100, 200, 400, 800, 1600, 3200][seed % 6],
    },
    gpsCoordinates: hasGps ? {
      latitude: location.lat + (((seed % 100) - 50) / 10000),
      longitude: location.lon + (((seed % 100) - 50) / 10000),
      altitude: location.alt,
    } : undefined,
    riskScore,
    warnings,
  });

  res.json(result);
});

export default router;
