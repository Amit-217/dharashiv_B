import Counter from "../models/counterModel.js";
import Department from "../models/departmentModel.js";

export async function generateAppUserId() {
  const counter = await Counter.findByIdAndUpdate(
    "appUserId",           // counter key name
    { $inc: { seq: 1 } }, // increase sequence
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(7, "0");
  return `A${padded}`;   // Example => A0000001
}

// ==========================
// Generate Taluka ID
// ==========================
export async function generateTalukaId() {
  const counter = await Counter.findByIdAndUpdate(
    "talukaId",               // unique key for taluka
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(3, "0");
  return `TLK${padded}`;  // TLK001
}

export async function generateVillageId() {
  const counter = await Counter.findByIdAndUpdate(
    "villageId",               // unique key for village
    { $inc: { seq: 1 } },      // increment sequence
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(4, "0"); // 4 digits → 0001, 0002...
  return `VLG${padded}`;  // Example → VLG0001
}

// =============================
// Generate Department ID
// =============================
// export const generateDepartmentId = async () => {
//   const counter = await Counter.findByIdAndUpdate(
//     "departmentId",
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const seqNum = counter.seq.toString().padStart(4, "0");
//   return `DEP${seqNum}`;
// };

export const generateDepartmentId = async () => {
  // Increment counter
  let counter = await Counter.findByIdAndUpdate(
    "departmentId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  let deptId = "DEP" + counter.seq.toString().padStart(4, "0");

  // Check if ID already exists
  const exists = await Department.findOne({ deptId }).lean();

  if (!exists) return deptId;

  console.warn(`⚠️ Duplicate detected for ${deptId} — resyncing counter...`);

  // ===== AUTO-FIX: resync counter with DB max deptId =====
  const lastDept = await Department.findOne().sort({ deptId: -1 }).lean();

  const lastSeq = lastDept
    ? parseInt(lastDept.deptId.replace("DEP", ""))
    : 0;

  // Update counter to correct value
  counter = await Counter.findByIdAndUpdate(
    "departmentId",
    { seq: lastSeq + 1 },
    { new: true, upsert: true }
  );

  deptId = "DEP" + counter.seq.toString().padStart(4, "0");

  console.log(`🔧 Counter auto-fixed → Next ID ${deptId}`);

  return deptId;
};

// =============================
// Generate Complainer ID
// =============================
export const generateComplainerId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "complainerId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNum = counter.seq.toString().padStart(4, "0");
  return `COMP${seqNum}`;
};

// =============================
// Generate SubDepartment ID
// =============================
export const generateSubDeptId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "subDeptId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seqNum = counter.seq.toString().padStart(4, "0");
  return `SUB${seqNum}`;
};




export async function generateAdminId() {
  const counter = await Counter.findByIdAndUpdate(
    "adminId",            // counter key
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = counter.seq.toString().padStart(6, "0");
  return `ADM${padded}`; // Example => ADM000001
}