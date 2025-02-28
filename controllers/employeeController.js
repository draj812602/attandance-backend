const db = require("../config/firebase");

// ✅ Function to Verify Office IP
exports.verifyOfficeIP = (req, res) => {
  const officePublicIPs = ["183.76.164.162"];
  const userIP = req.query.ip;
  const isOffice = officePublicIPs.includes(userIP);
  res.json({ isOffice });
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
    if (!verifyIP(ip)) {
      return res
        .status(403)
        .json({ error: "Registration only allowed from office network" });
    }
    const now = new Date();
    const quarter = `Q${Math.ceil(
      (now.getMonth() + 1) / 3
    )}-${now.getFullYear()}`;

    // ✅ Explicitly create the "employees" collection if it doesn't exist
    const employeesRef = db.collection("employees");
    const employeeDoc = await employeesRef.doc(empID).get();

    if (!employeeDoc.exists) {
      await employeesRef.doc(empID).set({
        empID,
        empName,
        quarter,
        createdAt: new Date(),
      });
    }

    // ✅ Immediately mark attendance upon successful registration
    await db.collection("attendance").add({
      empID,
      empName,
      date: new Date().toISOString().split("T")[0], // Store only date part
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: "Employee registered and attendance marked successfully.",
    });
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// ✅ Fetch Employee from Firestore
exports.getEmployee = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeRef = db.collection("employees").doc(empID);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res
        .status(404)
        .json({ error: "Employee not found. Please register again." });
    }

    res.json(employeeDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch Attendance (Full Quarter)
exports.getAttendance = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const year = today.getFullYear();
    const month = today.getMonth();
    let quarterStartMonth = Math.floor(month / 3) * 3;
    const quarterStartDate = new Date(Date.UTC(year, quarterStartMonth, 1));

    const attendanceSnapshot = await db
      .collection("attendance")
      .where("empID", "==", empID)
      .orderBy("date", "asc")
      .get();

    let presentRecords = attendanceSnapshot.docs.map((doc) => doc.data());
    let presentDates = new Set(presentRecords.map((record) => record.date));

    let attendanceRecords = [];
    let totalAttendance = presentRecords.length;
    let dateTracker = new Date(quarterStartDate);

    while (
      dateTracker.toISOString().split("T")[0] <=
      today.toISOString().split("T")[0]
    ) {
      let dateStr = dateTracker.toISOString().split("T")[0];

      if (presentDates.has(dateStr)) {
        let record = presentRecords.find((r) => r.date === dateStr);
        attendanceRecords.push({
          date: dateStr,
          time: record.timestamp
            ? new Date(record.timestamp).toLocaleTimeString()
            : "--", // ✅ Fix applied
          status: "Present",
        });
      } else {
        attendanceRecords.push({ date: dateStr, time: "--", status: "Absent" });
      }

      dateTracker.setUTCDate(dateTracker.getUTCDate() + 1);
    }

    res.json({ attendanceRecords, totalAttendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { empID } = req.body;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeRef = db.collection("employees").doc(empID);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return res
        .status(404)
        .json({ error: "Employee not found. Please register first." });
    }
    if (!verifyIP(ip)) {
      return res
        .status(403)
        .json({ error: "Attendance can only be marked from office network" });
    }
    const today = new Date().toISOString().split("T")[0];
    const attendanceRef = db.collection("attendance");

    // ✅ Check if attendance is already marked for today
    const existingAttendance = await attendanceRef
      .where("empID", "==", empID)
      .where("date", "==", today)
      .get();

    if (!existingAttendance.empty) {
      return res.json({ message: "Attendance already marked for today." });
    }

    // ✅ Mark attendance
    await attendanceRef.add({
      empID,
      empName: employeeDoc.data().empName || "Unknown",
      timestamp: new Date().toISOString(),
      date: today,
    });

    res.json({ message: "Attendance marked successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Backdate Attendance
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
