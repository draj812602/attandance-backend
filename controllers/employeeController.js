const db = require("../config/firebase");

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
      createdAt: new Date(),
    });

    res.json({ message: "Employee details saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch Employee from Firestore
exports.getAttendance = async (req, res) => {
  try {
    const { empID } = req.query;
    console.log("req made here");

    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const attendanceSnapshot = await db
      .collection("attendance")
      .where("empID", "==", empID)
      .orderBy("timestamp", "desc")
      .get();

    if (attendanceSnapshot.empty) {
      return res.json([]);
    }

    const records = attendanceSnapshot.docs.map((doc) => doc.data());

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark Attendance in Firestore (Prevent Duplicate Entries)
exports.markAttendance = async (req, res) => {
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

// ✅ Verify if IP is from Office Network
exports.verifyOfficeIP = (req, res) => {
  const officePublicIPs = ["182.76.164.162"]; // Add your office's public IP
  const userIP = req.query.ip;
  const isOffice = officePublicIPs.includes(userIP);
  res.json({ isOffice });
};
