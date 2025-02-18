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
exports.getEmployee = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeRef = db.collection("employees").doc(empID);
    const employeeDoc = await employeeRef.get();

    // ✅ If Employee Not Found, Return Prompt to Re-Register
    if (!employeeDoc.exists) {
      return res.status(404).json({
        error: "Employee not found. Please register again.",
      });
    }

    res.json(employeeDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch Attendance (Full Quarter) - Includes Present & Absent
exports.getAttendance = async (req, res) => {
  try {
    const { empID } = req.query;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    // console.log(`Fetching attendance for Employee ID: ${empID}`);

    const today = new Date();
    today.setHours(23, 59, 59, 999); // ✅ Ensure today is correctly compared

    const year = today.getFullYear();
    const month = today.getMonth();

    // ✅ Correctly determine the start of the current quarter
    let quarterStartMonth;
    if (month >= 0 && month <= 2) {
      quarterStartMonth = 0; // Q1: January 1
    } else if (month >= 3 && month <= 5) {
      quarterStartMonth = 3; // Q2: April 1
    } else if (month >= 6 && month <= 8) {
      quarterStartMonth = 6; // Q3: July 1
    } else {
      quarterStartMonth = 9; // Q4: October 1
    }

    const quarterStartDate = new Date(Date.UTC(year, quarterStartMonth, 1));
    quarterStartDate.setUTCHours(0, 0, 0, 0); // ✅ Fix UTC mismatch

    // console.log("Quarter Start Date:", quarterStartDate.toISOString());
    // console.log("Today's Date (Fixed):", today.toISOString());

    // ✅ Fetch attendance from Firestore (Only from quarter start to today)
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

    // ✅ Fix: Ensure the loop **includes today's date**
    while (
      dateTracker.toISOString().split("T")[0] <=
      today.toISOString().split("T")[0]
    ) {
      let dateStr = dateTracker.toISOString().split("T")[0];

      if (presentDates.has(dateStr)) {
        let record = presentRecords.find((r) => r.date === dateStr);
        attendanceRecords.push({
          date: dateStr,
          time: new Date(record.timestamp).toLocaleTimeString(),
          status: "Present",
        });
      } else {
        attendanceRecords.push({
          date: dateStr,
          time: "--",
          status: "Absent",
        });
      }

      // ✅ Move to the next day correctly
      dateTracker.setUTCDate(dateTracker.getUTCDate() + 1);
    }

    res.json({ attendanceRecords, totalAttendance });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// ✅ Mark Attendance in Firestore (Prevent Duplicate Entries)
exports.markAttendance = async (req, res) => {
  try {
    const { empID } = req.body;
    if (!empID) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employeeRef = db.collection("employees").doc(empID);
    const employeeDoc = await employeeRef.get();

    // ✅ If Employee is Missing, Recreate the Employee Record
    if (!employeeDoc.exists) {
      console.log(`Employee ID ${empID} not found. Creating new employee...`);

      await employeeRef.set({
        empID,
        empName: "Unknown", // Later update from UI if needed
        createdAt: new Date(),
      });

      console.log(`New employee record created for ${empID}.`);
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const attendanceRef = db.collection("attendance");

    // ✅ Check if Attendance Collection Exists (Firestore Automatically Creates It)
    const attendanceQuery = await attendanceRef
      .where("empID", "==", empID)
      .where("date", "==", today)
      .get();

    if (!attendanceQuery.empty) {
      return res.json({ message: "Attendance already marked for today" });
    }

    const attendanceEntry = {
      empID,
      empName: employeeDoc.exists ? employeeDoc.data().empName : "Unknown",
      timestamp: now.toISOString(),
      date: today,
    };

    // ✅ Add Attendance to the Firestore
    await attendanceRef.add(attendanceEntry);

    res.json({
      message: "Attendance marked successfully",
      data: attendanceEntry,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

// ✅ Verify if IP is from Office Network
exports.verifyOfficeIP = (req, res) => {
  const officePublicIPs = ["182.76.164.162"];
  const userIP = req.query.ip;
  const isOffice = officePublicIPs.includes(userIP);
  res.json({ isOffice });
};
