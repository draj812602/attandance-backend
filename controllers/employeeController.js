const db = require("../config/firebase");

const OFFICE_IPS = ["182.76.164.162"]; // Statically store office IP

// ✅ Utility function to check if an IP is from the office
const isOfficeIP = (req) => {
  const userIP = "182.76.164.162";

  return OFFICE_IPS.includes(userIP);
};

// ✅ Save Employee to Firestore
exports.saveEmployee = async (req, res) => {
  try {
    const { empID, empName } = req.body;
    if (!empID || !empName) {
      return res
        .status(400)
        .json({ error: "Employee ID and Name are required" });
    }

    const now = new Date();
    const quarter = `Q${Math.ceil(
      (now.getMonth() + 1) / 3
    )}-${now.getFullYear()}`;

    await db.collection("employees").doc(empID).set({
      empID,
      empName,
      quarter,
      createdAt: now,
    });

    res.json({ message: "Employee details saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch Employee from Firestore
exports.getEmployee = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeDoc = await db.collection("employees").doc(empID).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employeeDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch Attendance Records (Quarterly)
exports.getAttendance = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const today = new Date();
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    const quarterStartDate = new Date(
      today.getFullYear(),
      quarterStartMonth,
      1
    );

    const attendanceSnapshot = await db
      .collection("attendance")
      .where("empID", "==", empID)
      .orderBy("date", "asc")
      .get();

    let presentRecords = attendanceSnapshot.docs.map((doc) => doc.data());
    let presentDates = new Set(presentRecords.map((record) => record.date));

    let attendanceRecords = [];
    let totalAttendance = 0;
    let dateTracker = new Date(quarterStartDate);

    while (dateTracker <= today) {
      let dateStr = dateTracker.toISOString().split("T")[0];
      if (presentDates.has(dateStr)) {
        let record = presentRecords.find((r) => r.date === dateStr);
        attendanceRecords.push({
          date: dateStr,
          time: new Date(record.timestamp).toLocaleTimeString(),
          status: "Present",
        });
        totalAttendance += 1;
      } else {
        attendanceRecords.push({
          date: dateStr,
          time: "--",
          status: "Absent",
        });
      }
      dateTracker.setDate(dateTracker.getDate() + 1);
    }

    res.json({ attendanceRecords, totalAttendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark Attendance (Only If in Office)
exports.markAttendance = async (req, res) => {
  console.log("mark attendance", req);

  try {
    const { empID } = req.body;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeDoc = await db.collection("employees").doc(empID).get();
    if (!employeeDoc.exists) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const empData = employeeDoc.data();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (!isOfficeIP(req)) {
      return res.status(403).json({
        error: "Attendance can only be marked from the office network.",
      });
    }

    const attendanceQuery = await db
      .collection("attendance")
      .where("empID", "==", empID)
      .where("date", "==", today)
      .get();

    if (!attendanceQuery.empty) {
      return res.json({ message: "Attendance already marked for today" });
    }

    const attendanceEntry = {
      empID,
      empName: empData.empName,
      timestamp: now.toISOString(),
      date: today,
      quarter: empData.quarter,
    };

    await db.collection("attendance").add(attendanceEntry);

    res.json({
      message: "Attendance marked successfully",
      data: attendanceEntry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Backdate Attendance (Fixed)
exports.backdateAttendance = async (req, res) => {
  try {
    const { empID, dates } = req.body;
    if (!empID || !dates || !Array.isArray(dates) || dates.length === 0) {
      return res
        .status(400)
        .json({ error: "Valid Employee ID and dates are required." });
    }

    const today = new Date().toISOString().split("T")[0];
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    let quarterStartMonth = Math.floor(month / 3) * 3;
    const quarterStart = new Date(Date.UTC(year, quarterStartMonth, 1))
      .toISOString()
      .split("T")[0];

    const employeeRef = db.collection("employees").doc(empID);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res
        .status(404)
        .json({ error: "Employee not found. Please register first." });
    }

    const attendanceRef = db.collection("attendance");
    let addedDates = [];
    let skippedDates = [];

    for (let date of dates) {
      if (date < quarterStart || date >= today) {
        skippedDates.push(date);
        continue;
      }

      const existingRecord = await attendanceRef
        .where("empID", "==", empID)
        .where("date", "==", date)
        .get();
      if (!existingRecord.empty) {
        skippedDates.push(date);
        continue;
      }

      await attendanceRef.add({
        empID,
        empName: employeeDoc.data().empName || "Unknown",
        timestamp: new Date().toISOString(),
        date,
      });
      addedDates.push(date);
    }

    res.json({
      message: "Backdated attendance successfully updated.",
      addedDates,
      skippedDates,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Verify if IP is from Office Network
exports.verifyOfficeIP = (req, res) => {
  const userIP = req.query.ip;
  const isOffice = OFFICE_IPS.includes(userIP);
  res.json({ isOffice });
};
