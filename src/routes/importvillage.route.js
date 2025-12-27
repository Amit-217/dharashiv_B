// import express from "express";
// import multer from "multer";
// import xlsx from "xlsx";
// import Taluka from "../models/talukaModel.js";
// import Village from "../models/villageModel.js";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // Generate incremental villageId
// async function generateVillageId(talukaId) {
//   const count = await Village.countDocuments({ taluka: talukaId });
//   return `${talukaId}_VIL_${count + 1}`;
// }

// router.post(
//   "/import/barshi-villages",
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file)
//         return res.status(400).json({ message: "No file uploaded" });

//       const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const rows = xlsx.utils.sheet_to_json(sheet);

//       // ⭐ Ensure BARSHI Taluka exists
//       let taluka = await Taluka.findOne({ talukaId: "BARSHI_001" });

//       if (!taluka) {
//         taluka = await Taluka.create({
//           talukaId: "BARSHI_001",
//           name: { en: "Barshi", mr: "बार्शी" }
//         });
//       }

//       let imported = 0;
//       let skipped = 0;

//       for (const row of rows) {
//         const villageEn = row["Village Name En"]?.trim();
//         const villageMr = row["Village Name Mr"]?.trim();

//         if (!villageEn || !villageMr) {
//           skipped++;
//           continue;
//         }

//         // 🚫 Skip duplicates inside taluka
//         const exists = await Village.findOne({
//           taluka: taluka._id,
//           "name.en": villageEn
//         });

//         if (exists) {
//           skipped++;
//           continue;
//         }

//         // Generate villageId
//         const villageId = await generateVillageId(taluka._id);

//         // ✅ Create record
//         await Village.create({
//           villageId,
//           name: { en: villageEn, mr: villageMr },
//           taluka: taluka._id
//         });

//         imported++;
//       }

//       res.json({
//         success: true,
//         message: "Villages imported into Barshi taluka",
//         imported,
//         skipped
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// export default router;


import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import Taluka from "../models/talukaModel.js";
import Village from "../models/villageModel.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// --------- Generate Taluka ID (slug style) ----------
function makeTalukaId(nameEn) {
  if (!nameEn) return "TALUKA_" + Date.now();

  return nameEn
    .toString()
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}


// --------- Generate Incremental Village ID ----------
async function generateVillageId(talukaId) {
  const count = await Village.countDocuments({ taluka: talukaId });
  return `${talukaId}_VIL_${count + 1}`;
}


// --------- IMPORT TALUKAS + VILLAGES ----------
router.post(
  "/import/multiple-talukas",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      let imported = 0;
      let skipped = 0;

      for (const row of rows) {
        const villageEn = row["Village Name En"]?.toString().trim();
        const villageMr = row["Village Name Mr"]?.toString().trim();
        const talukaNameEn = row["Taluka"]?.toString().trim();
        const talukaNameMr = row["Taluka Mr"]?.toString().trim() || talukaNameEn;

        // Skip rows missing required values
        if (!villageEn || !villageMr || !talukaNameEn) {
          skipped++;
          continue;
        }

        // Generate Taluka ID
        const talukaKey = makeTalukaId(talukaNameEn);

        // Find or create taluka
        let taluka = await Taluka.findOne({ talukaId: talukaKey });

        if (!taluka) {
          taluka = await Taluka.create({
            talukaId: talukaKey,
            name: {
              en: talukaNameEn,
              mr: talukaNameMr,
            },
          });
        }

        // Generate sequential village id inside same taluka
        const villageId = await generateVillageId(taluka._id);

        // Always insert — duplicates allowed
        await Village.create({
          villageId,
          name: {
            en: villageEn,
            mr: villageMr,
          },
          taluka: taluka._id,
        });

        imported++;
      }

      // Return full tree (Taluka + Villages)
      const talukas = await Taluka.find();
      const data = [];

      for (let t of talukas) {
        const villages = await Village.find({ taluka: t._id });
        data.push({ taluka: t, villages });
      }

      return res.json({
        success: true,
        message: "Talukas & Villages imported successfully",
        imported,
        skipped,
        data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

export default router;
