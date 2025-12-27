// // // // import express from "express";
// // // // import multer from "multer";
// // // // import xlsx from "xlsx";
// // // // import Department from "../models/departmentModel.js";

// // // // const router = express.Router();
// // // // const upload = multer({ storage: multer.memoryStorage() });


// // // // // -------- Create deptId (slug style) --------
// // // // function makeDeptId(nameEn) {
// // // //   return nameEn
// // // //     .toString()
// // // //     .trim()
// // // //     .replace(/\s+/g, "_")
// // // //     .replace(/[()\/]/g, "")
// // // //     .toUpperCase();
// // // // }


// // // // // -------- Import Departments from Excel --------
// // // // router.post("/import/departments", upload.single("file"), async (req, res) => {
// // // //   try {

// // // //     if (!req.file) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         message: "No file uploaded"
// // // //       });
// // // //     }

// // // //     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
// // // //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// // // //     const rows = xlsx.utils.sheet_to_json(sheet);

// // // //     let imported = 0;
// // // //     let skipped = 0;

// // // //     for (const row of rows) {

// // // //       const nameEn =
// // // //         row["Department Name En"]?.trim() ||
// // // //         row["Authority Name En"]?.trim() ||
// // // //         row["Designation"]?.trim();

// // // //       const nameMr =
// // // //         row["Department Name Mr"]?.trim() ||
// // // //         row["Authority Name Mr"]?.trim() ||
// // // //         row["Designation Mr"]?.trim() ||
// // // //         nameEn;

// // // //       const level =
// // // //         row["Level"]?.trim()?.toLowerCase() ||
// // // //         "district";

// // // //       const description =
// // // //         row["Description"]?.trim() || "";

// // // //       // Skip invalid rows
// // // //       if (!nameEn || !nameMr) {
// // // //         skipped++;
// // // //         continue;
// // // //       }

// // // //       // Validate allowed levels
// // // //       const validLevels = ["taluka", "cluster", "village", "town", "district"];

// // // //       const finalLevel = validLevels.includes(level)
// // // //         ? level
// // // //         : "district";

// // // //       const deptId = makeDeptId(nameEn);

// // // //       // UPSERT (safe overwrite)
// // // //       await Department.findOneAndUpdate(
// // // //         { deptId },
// // // //         {
// // // //           deptId,
// // // //           name: { en: nameEn, mr: nameMr },
// // // //           level: finalLevel,
// // // //           description
// // // //         },
// // // //         { upsert: true }
// // // //       );

// // // //       imported++;
// // // //     }

// // // //     const departments = await Department.find().sort({ level: 1 });

// // // //     res.json({
// // // //       success: true,
// // // //       message: "Departments imported successfully",
// // // //       imported,
// // // //       skipped,
// // // //       data: departments
// // // //     });

// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       error: err.message
// // // //     });
// // // //   }
// // // // });

// // // // export default router;



// // // import express from "express";
// // // import multer from "multer";
// // // import xlsx from "xlsx";
// // // import Department from "../models/departmentModel.js";

// // // const router = express.Router();
// // // const upload = multer({ storage: multer.memoryStorage() });

// // // /* ------------ Generate Department ID ------------- */
// // // function makeDeptId(nameEn) {
// // //   return nameEn
// // //     .toString()
// // //     .trim()
// // //     .replace(/[()\/]/g, "")
// // //     .replace(/\s+/g, "_")
// // //     .toUpperCase();
// // // }

// // // /* ------------ Normalize & Map Level Values -------- */
// // // function normalizeLevel(level) {
// // //   if (!level) return "district";

// // //   const val = level.toString().trim().toLowerCase();

// // //   const map = {
// // //     "district": "district",
// // //     "zilla": "district",

// // //     "taluka": "taluka",
// // //     "tehsil": "taluka",
// // //     "subdivision": "taluka",

// // //     "village": "village",
// // //     "local": "village",

// // //     "town": "town",
// // //     "urban": "town",
// // //     "municipal": "town",

// // //     "cluster": "cluster",
// // //     "block": "cluster",
// // //     "rural": "cluster",

// // //     "local body": "town"
// // //   };

// // //   return map[val] || "district";
// // // }

// // // /* ------------ Import Departments API --------------- */
// // // router.post("/import/departments", upload.single("file"), async (req, res) => {
// // //   try {
// // //     if (!req.file) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "No file uploaded"
// // //       });
// // //     }

// // //     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
// // //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
// // //     const rows = xlsx.utils.sheet_to_json(sheet);

// // //     let imported = 0;
// // //     let skipped = 0;

// // //     for (const row of rows) {

// // //       // Support multiple header formats
// // //       const nameEn =
// // //         row["English Name"]?.trim() ||
// // //         row["Department Name En"]?.trim() ||
// // //         row["Designation"]?.trim();

// // //       const nameMr =
// // //         row["Marathi Name"]?.trim() ||
// // //         row["Department Name Mr"]?.trim() ||
// // //         row["Designation Mr"]?.trim() ||
// // //         nameEn;

// // //       const levelRaw =
// // //         row["Administrative Level"]?.trim() ||
// // //         row["Level"]?.trim();

// // //       const description =
// // //         row["Function / Sector"]?.trim() ||
// // //         row["Description"]?.trim() ||
// // //         "";

// // //       // Skip only if required fields truly missing
// // //       if (!nameEn) {
// // //         skipped++;
// // //         continue;
// // //       }

// // //       const level = normalizeLevel(levelRaw);

// // //       const deptId = makeDeptId(nameEn);

// // //       // UPSERT department (update if exists, insert if not)
// // //       await Department.findOneAndUpdate(
// // //         { deptId },
// // //         {
// // //           deptId,
// // //           name: { en: nameEn, mr: nameMr },
// // //           level,
// // //           description
// // //         },
// // //         { upsert: true, new: true }
// // //       );

// // //       imported++;
// // //     }

// // //     const departments = await Department.find().sort({ level: 1, deptId: 1 });

// // //     return res.json({
// // //       success: true,
// // //       message: "Departments imported successfully",
// // //       imported,
// // //       skipped,
// // //       data: departments
// // //     });

// // //   } catch (err) {
// // //     console.error(err);
// // //     return res.status(500).json({
// // //       success: false,
// // //       error: err.message
// // //     });
// // //   }
// // // });

// // // export default router;

// // import express from "express";
// // import multer from "multer";
// // import xlsx from "xlsx";
// // import Department from "../models/departmentModel.js";

// // const router = express.Router();
// // const upload = multer({ storage: multer.memoryStorage() });

// // /* ---------- Dept ID Slug ---------- */
// // function makeDeptId(nameEn) {
// //   return nameEn.trim().replace(/\s+/g, "_").toUpperCase();
// // }

// // /* ---------- LEVEL NORMALIZATION ---------- */
// // function normalizeLevel(levelRaw = "") {
// //   const l = levelRaw.toLowerCase();

// //   // direct matches
// //   const map = {
// //     district: "District",
// //     taluka: "Taluka",
// //     village: "Village",
// //     town: "Town",
// //     cluster: "cluster",
// //     block: "Block",
// //     local: "Local",
// //     urban: "Urban",
// //     rural: "Rural"
// //   };

// //   // fuzzy mapping from your sheet
// //   if (l.includes("subdivision")) return "Taluka";
// //   if (l.includes("station")) return "Local";
// //   if (l.includes("urban")) return "Urban";
// //   if (l.includes("rural")) return "Rural";
// //   if (l.includes("village")) return "Village";
// //   if (l.includes("town")) return "Town";
// //   if (l.includes("block")) return "Block";
// //   if (l.includes("cluster")) return "cluster";
// //   if (l.includes("taluka")) return "Taluka";
// //   if (l.includes("district")) return "District";
// //   if (l.includes("local")) return "Local";
// //   if (l.includes("all")) return "District";      // All Levels → District fallback
// //   if (l.includes("circle")) return "Taluka";     // Electricity Circle → Taluka
// //   if (l.includes("power")) return "Taluka";
// //   if (l.includes("hospital")) return "Taluka";

// //   // default fallback
// //   return "District";
// // }

// // router.post(
// //   "/import/departments",
// //   upload.single("file"),
// //   async (req, res) => {
// //     try {

// //       if (!req.file) {
// //         return res.status(400).json({
// //           success: false,
// //           message: "No file uploaded"
// //         });
// //       }

// //       const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
// //       const sheet = workbook.Sheets[workbook.SheetNames[0]];
// //       const rows = xlsx.utils.sheet_to_json(sheet);

// //       let imported = 0;
// //       let skipped = 0;

// //       for (const row of rows) {

// //         const nameEn = row["English Name"]?.trim();
// //         const nameMr = row["Marathi Name"]?.trim() || nameEn;

// //         if (!nameEn) {
// //           skipped++;
// //           continue;
// //         }

// //         const level = normalizeLevel(row["Administrative Level"]);
// //         const description = row["Function / Sector"]?.trim() || "";

// //         const deptId = makeDeptId(nameEn);

// //         await Department.findOneAndUpdate(
// //           { deptId },
// //           {
// //             deptId,
// //             name: { en: nameEn, mr: nameMr },
// //             level,
// //             description
// //           },
// //           { upsert: true, new: true }
// //         );

// //         imported++;
// //       }

// //       const departments = await Department.find().sort({ deptId: 1 });

// //       return res.json({
// //         success: true,
// //         message: "Departments imported successfully",
// //         imported,
// //         skipped,
// //         data: departments
// //       });

// //     } catch (err) {
// //       console.error(err);
// //       res.status(500).json({
// //         success: false,
// //         error: err.message
// //       });
// //     }
// //   }
// // );

// // export default router;




// import express from "express";
// import multer from "multer";
// import xlsx from "xlsx";
// import Department from "../models/departmentModel.js";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
// function normalizeLevel(level = "") {
//   const l = level.toLowerCase().trim();

//   if (["district", "districts"].includes(l)) return "district";

//   if ([
//     "taluka", "tehsil", "subdivision", "sdm"
//   ].includes(l)) return "taluka";

//   if ([
//     "village", "rural", "village/town", "gram"
//   ].includes(l)) return "village";

//   if ([
//     "town", "municipal", "urban town"
//   ].includes(l)) return "town";

//   if ([
//     "urban", "city", "urban governance"
//   ].includes(l)) return "urban";

//   if ([
//     "rural governance", "rural water"
//   ].includes(l)) return "rural";

//   if ([
//     "block", "panchayat samiti", "bdo"
//   ].includes(l)) return "block";

//   if ([
//     "cluster", "phc cluster"
//   ].includes(l)) return "cluster";

//   if ([
//     "local", "local governance", "station", "circle"
//   ].includes(l)) return "local";

//   if (l === "all levels") return "district";

//   console.log("⚠️ Unknown Level → defaulted to district:", level);
//   return "district";
// }

// let deptCounter = 0;

// async function getNextDeptId() {
//   if (deptCounter === 0) {
//     const last = await Department.findOne().sort({ deptId: -1 });

//     if (last && last.deptId) {
//       deptCounter = parseInt(last.deptId.replace("DEP", "")) || 0;
//     }
//   }

//   deptCounter++;
//   return "DEP" + deptCounter.toString().padStart(4, "0");
// }



// router.post("/import/departments", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file)
//       return res.status(400).json({ success: false, message: "No file uploaded" });

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = xlsx.utils.sheet_to_json(sheet);

//     let imported = 0;
//     let skipped = 0;

//     for (const row of rows) {

//       const nameEn = row["English Name"]?.trim();
//       const nameMr = row["Marathi Name"]?.trim();
//       const description = row["Discription"]?.trim() || "";
//       const level = normalizeLevel(row["Level"]);

//       if (!nameEn || !nameMr) {
//         skipped++;
//         continue;
//       }

//       // check duplicate (same Marathi name + same level)
//       const exists = await Department.findOne({
//         "name.mr": nameMr,
//         level
//       });

//       if (exists) {
//         skipped++;
//         continue;
//       }

//       const deptId = await getNextDeptId();

//       await Department.create({
//         deptId,
//         name: { en: nameEn, mr: nameMr },
//         description,
//         level
//       });

//       imported++;
//     }

//     const departments = await Department.find().sort({ deptId: 1 });

//     res.json({
//       success: true,
//       message: "Departments imported successfully",
//       imported,
//       skipped,
//       count: departments.length,
//       data: departments
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({


//       success: false,
//       error: err.message
//     });
//   }

// });

// export default router;


import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import Department from "../models/departmentModel.js";
import Counter from "../models/counterModel.js"; // your counter schema

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ---------- Normalize Level ----------
function normalizeLevel(level = "") {
  const l = level.toLowerCase().trim();

  if (["district", "districts"].includes(l)) return "district";
  if (["taluka", "tehsil", "subdivision", "sdm"].includes(l)) return "taluka";
  if (["village", "rural", "village/town", "gram"].includes(l)) return "village";
  if (["town", "municipal", "urban town"].includes(l)) return "town";
  if (["urban", "city", "urban governance"].includes(l)) return "urban";
  if (["rural governance", "rural water"].includes(l)) return "rural";
  if (["block", "panchayat samiti", "bdo"].includes(l)) return "block";
  if (["cluster", "phc cluster"].includes(l)) return "cluster";
  if (["local", "local governance", "station", "circle"].includes(l)) return "local";
  if (l === "all levels") return "district";

  console.log("⚠️ Unknown Level → defaulted to district:", level);
  return "district";
}

// ---------- Get Next Dept ID Using Counter ----------
async function getNextDeptId() {
  const counter = await Counter.findByIdAndUpdate(
    "departmentId",     // MUST match generateDepartmentId()
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return "DEP" + counter.seq.toString().padStart(4, "0");
}

// ---------- Import Departments ----------
router.post("/import/departments", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const nameEn = row["English Name"]?.trim();
      const nameMr = row["Marathi Name"]?.trim();
      const description = row["Discription"]?.trim() || "";
      const level = normalizeLevel(row["Level"]);

      if (!nameEn || !nameMr) {
        skipped++;
        continue;
      }

      // Check duplicate by name + level
      const exists = await Department.findOne({ "name.mr": nameMr, level });
      if (exists) {
        skipped++;
        continue;
      }

      // Generate unique Dept ID safely
      const deptId = await getNextDeptId();

      await Department.create({
        deptId,
        name: { en: nameEn, mr: nameMr },
        description,
        level
      });

      imported++;
    }

    const departments = await Department.find().sort({ deptId: 1 });

    res.json({
      success: true,
      message: "Departments imported successfully",
      imported,
      skipped,
      count: departments.length,
      data: departments
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
