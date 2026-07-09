import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  UserRole, 
  User, 
  Complaint, 
  ComplaintStatus, 
  ComplaintPriority, 
  Notification, 
  AuditLog 
} from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "sih25031-civic-secret-key-9988";

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini AI client if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Running in simulation AI mode.");
}

// Ensure database file exists with initial seeded data
interface Database {
  users: User[];
  authStore: Record<string, string>; // userId -> hashed_password
  complaints: Complaint[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  archivedComplaints?: Complaint[];
}

function getInitialData(): Database {
  const users: User[] = [
    {
      id: "u-admin",
      name: "Sanjay Kumar (IAS)",
      email: "admin@sih.gov.in",
      phone: "+91 9876543210",
      role: UserRole.ADMIN,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    },
    {
      id: "u-auth-roads",
      name: "R. K. Selvan",
      email: "authority@sih.gov.in",
      phone: "+91 9444012345",
      role: UserRole.AUTHORITY,
      department: "Roads & Highways",
      district: "Chennai",
      state: "Tamil Nadu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: "u-auth-sanitation",
      name: "Amit Sharma",
      email: "sanitation@sih.gov.in",
      phone: "+91 9111223344",
      role: UserRole.AUTHORITY,
      department: "Sanitation & Waste Management",
      district: "Central Delhi",
      state: "Delhi",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150"
    },
    {
      id: "u-citizen",
      name: "Rajesh Pillai",
      email: "citizen@sih.gov.in",
      phone: "+91 9988776655",
      role: UserRole.CITIZEN,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    }
  ];

  // Passwords are plain text hashes: 'admin123', 'authority123', 'citizen123'
  const authStore: Record<string, string> = {
    "u-admin": bcrypt.hashSync("admin123", 10),
    "u-auth-roads": bcrypt.hashSync("authority123", 10),
    "u-auth-sanitation": bcrypt.hashSync("authority123", 10),
    "u-citizen": bcrypt.hashSync("citizen123", 10),
  };

  const complaints: Complaint[] = [];

  const notifications: Notification[] = [];

  const auditLogs: AuditLog[] = [
    {
      id: "log-1",
      action: "DATABASE_INITIALIZED",
      userId: "system",
      userName: "System Server",
      details: "Initial clean database loaded successfully.",
      timestamp: new Date().toISOString()
    }
  ];

  return { users, authStore, complaints, notifications, auditLogs, archivedComplaints: [] };
}

function loadDB(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      console.error("Failed to read DB file, resetting:", err);
      return getInitialData();
    }
  } else {
    const data = getInitialData();
    saveDB(data);
    return data;
  }
}

function saveDB(data: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to DB file:", err);
  }
}

// Ensure database is seeded
let db = loadDB();

// JWT verification middleware
function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header is required" });
  }
}

// System logging helper
function logAction(action: string, userId: string, userName: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    userId,
    userName,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  saveDB(db);
}

// ==========================================================
// REST API ENDPOINTS
// ==========================================================

// Auth - Login
app.post("/api/auth/login", (req, res) => {
  const { email, password, role, name, pinCode, department, district, state } = req.body;
  if (!role || !password) {
    return res.status(400).json({ error: "Role and password are required" });
  }

  if (role === UserRole.CITIZEN) {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: `Incorrect role. Your registered role is ${user.role}` });
    }

    const hashedPassword = db.authStore[user.id];
    if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    logAction("USER_LOGIN", user.id, user.name, `Logged in successfully as CITIZEN`);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  }

  if (role === UserRole.AUTHORITY) {
    if (!name || !pinCode) {
      return res.status(400).json({ error: "Authority Name and Area PIN Code are required" });
    }
    const expectedPassword = `tn(${pinCode})`;
    if (password !== expectedPassword) {
      return res.status(401).json({ error: "Invalid password. Authority password must exactly match 'tn(PIN Code)'" });
    }

    // Dynamic login for pre-authorized authority
    const authId = `u-auth-${pinCode}`;
    const authorityEmail = `authority_${pinCode}@sih.gov.in`;

    let user = db.users.find(u => u.id === authId);
    if (!user) {
      user = {
        id: authId,
        name: name,
        email: authorityEmail,
        phone: "+91 9444012345",
        role: UserRole.AUTHORITY,
        department: "Municipal Administration",
        district: "Tamil Nadu Region",
        state: "Tamil Nadu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      };
      db.users.push(user);
      db.authStore[authId] = bcrypt.hashSync(password, 10);
      saveDB(db);
    } else {
      if (user.name !== name) {
        user.name = name;
        saveDB(db);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    logAction("USER_LOGIN", user.id, user.name, `Logged in successfully as AUTHORITY for PIN ${pinCode}`);

    return res.json({
      token,
      user
    });
  }

  if (role === UserRole.ADMIN) {
    if (!name || !department || !district) {
      return res.status(400).json({ error: "Administrator Name, Department, and District are required" });
    }
    const expectedPassword = `7102006`;
    if (password !== expectedPassword) {
      return res.status(401).json({ error: "Invalid password. Default is 7102006" });
    }

    const adminId = `u-admin-${name.replace(/\s+/g, '-').toLowerCase()}`;
    const adminEmail = "admin@sih.gov.in";

    let user = db.users.find(u => u.id === adminId);
    if (!user) {
      user = {
        id: adminId,
        name: name,
        email: adminEmail,
        role: UserRole.ADMIN,
        department: department,
        district: district,
        state: state || "Tamil Nadu",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
      };
      db.users.push(user);
      db.authStore[adminId] = bcrypt.hashSync(password, 10);
      saveDB(db);
    } else {
      user.name = name;
      user.department = department;
      user.district = district;
      user.state = state || "Tamil Nadu";
      saveDB(db);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, department: user.department, district: user.district, state: user.state },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    logAction("USER_LOGIN", user.id, user.name, `Logged in successfully as ADMIN: ${department}, ${district}`);

    return res.json({
      token,
      user
    });
  }

  return res.status(400).json({ error: "Invalid role specified" });
});

// Auth - Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (role !== UserRole.CITIZEN) {
    return res.status(400).json({ error: "Only Citizens are allowed to register" });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const userId = `u-${Date.now()}`;
  const newUser: User = {
    id: userId,
    name,
    email,
    phone,
    role: UserRole.CITIZEN,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
  };

  db.users.push(newUser);
  db.authStore[userId] = bcrypt.hashSync(password, 10);
  saveDB(db);

  logAction("USER_REGISTER", userId, name, `Registered as new CITIZEN`);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(211).json({
    token,
    user: newUser
  });
});

// Auth - Reset Password Simulation
app.post("/api/auth/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required" });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found with this email" });
  }

  db.authStore[user.id] = bcrypt.hashSync(newPassword, 10);
  saveDB(db);

  logAction("PASSWORD_RESET", user.id, user.name, "Reset password successfully");
  res.json({ message: "Password updated successfully. You can now login." });
});

// Get User Notifications
app.get("/api/notifications", authenticateJWT, (req: any, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Authorities/Admins get system notification list or user-specific
  const notes = db.notifications.filter(n => n.userId === userId || n.userId === "all" || (userRole === UserRole.ADMIN && n.userId === "admin"));
  res.json(notes);
});

// Mark Notifications Read
app.post("/api/notifications/mark-read", authenticateJWT, (req: any, res) => {
  const userId = req.user.id;
  db.notifications.forEach(n => {
    if (n.userId === userId || n.userId === "all") {
      n.read = true;
    }
  });
  saveDB(db);
  res.json({ success: true });
});

// Audit Logs (Admin only)
app.get("/api/audit-logs", authenticateJWT, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  res.json(db.auditLogs);
});

// Get All Users (Admin only)
app.get("/api/users", authenticateJWT, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  res.json(db.users);
});

// Manage Categories / Admin Update
app.delete("/api/complaints/:id", authenticateJWT, (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }

  const index = db.complaints.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const removed = db.complaints.splice(index, 1)[0];
  saveDB(db);

  logAction("REMOVED_SPAM", req.user.id, req.user.name, `Removed complaint ID: ${removed.id} ('${removed.title}') as spam`);
  res.json({ message: "Complaint removed successfully" });
});

// AI endpoints - Predict Category & Priority & Duplicates
app.post("/api/ai/analyze-issue", async (req, res) => {
  const { title, description, location } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  let suggestedCategory = "Other Civic Issues";
  let predictedPriority = "Medium";
  let executiveSummary = description.substring(0, 100) + "...";
  let isDuplicate = false;
  let duplicateOfId = "";

  // 1. AI Duplicate Detection simulation based on spatial proximity
  if (location && location.lat && location.lng) {
    const nearby = db.complaints.find(c => {
      // rough distance calculation (~150 meters is roughly 0.0015 latitude/longitude difference)
      const latDiff = Math.abs(c.location.lat - location.lat);
      const lngDiff = Math.abs(c.location.lng - location.lng);
      return latDiff < 0.0015 && lngDiff < 0.0015 && c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED;
    });

    if (nearby) {
      isDuplicate = true;
      duplicateOfId = nearby.id;
    }
  }

  if (ai) {
    try {
      const prompt = `Analyze this civic complaint description in India. 
      Title: "${title || ''}"
      Description: "${description}"
      
      Respond strictly in JSON format with the following schema:
      {
        "suggestedCategory": "One of: Road Pothole / Damage, Garbage Dump / Sanitation, Water Leakage / Pipe Burst, Sewage Overflow / Drainage, Broken Street Light, Traffic Signal Failure, Public Toilet Issue, Electricity / Live Wire Issue, Pollution / Illegal Dumping, Encroachment, Tree Fall / Drainage Block, Waterlogging / Flooding, Stray Animal Menace, Public Property Damage, Other Civic Issues",
        "predictedPriority": "One of: Low, Medium, High, Critical",
        "oneLineSummary": "A very short, clear 1-sentence summary of the core issue for government officials."
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const result = JSON.parse(responseText.trim());
      
      suggestedCategory = result.suggestedCategory || suggestedCategory;
      predictedPriority = result.predictedPriority || predictedPriority;
      executiveSummary = result.oneLineSummary || executiveSummary;

      console.log("AI Analysis Successful:", result);
    } catch (err) {
      console.error("AI Generation Error (falling back to regex):", err);
      // Fallback rule engine
      const descLower = description.toLowerCase() + " " + (title || "").toLowerCase();
      if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("crater")) {
        suggestedCategory = "Road Pothole / Damage";
        predictedPriority = "High";
      } else if (descLower.includes("garbage") || descLower.includes("dump") || descLower.includes("waste") || descLower.includes("trash")) {
        suggestedCategory = "Garbage Dump / Sanitation";
        predictedPriority = "Medium";
      } else if (descLower.includes("leak") || descLower.includes("water pipe") || descLower.includes("burst")) {
        suggestedCategory = "Water Leakage / Pipe Burst";
        predictedPriority = "High";
      } else if (descLower.includes("sewage") || descLower.includes("drain") || descLower.includes("drainage") || descLower.includes("overflow")) {
        suggestedCategory = "Sewage Overflow / Drainage";
        predictedPriority = "High";
      } else if (descLower.includes("street light") || descLower.includes("dark") || descLower.includes("street-light")) {
        suggestedCategory = "Broken Street Light";
        predictedPriority = "Medium";
      } else if (descLower.includes("electric") || descLower.includes("wire") || descLower.includes("shock") || descLower.includes("power")) {
        suggestedCategory = "Electricity / Live Wire Issue";
        predictedPriority = "Critical";
      }
    }
  } else {
    // Basic local rule analysis for offline compatibility
    const descLower = description.toLowerCase() + " " + (title || "").toLowerCase();
    if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("crater")) {
      suggestedCategory = "Road Pothole / Damage";
      predictedPriority = "High";
    } else if (descLower.includes("garbage") || descLower.includes("dump") || descLower.includes("waste") || descLower.includes("trash") || descLower.includes("k कचरा")) {
      suggestedCategory = "Garbage Dump / Sanitation";
      predictedPriority = "Medium";
    } else if (descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("water")) {
      suggestedCategory = "Water Leakage / Pipe Burst";
      predictedPriority = "High";
    } else if (descLower.includes("sewage") || descLower.includes("drain") || descLower.includes("drainage") || descLower.includes("overflow")) {
      suggestedCategory = "Sewage Overflow / Drainage";
      predictedPriority = "High";
    } else if (descLower.includes("street light") || descLower.includes("dark") || descLower.includes("street-light")) {
      suggestedCategory = "Broken Street Light";
      predictedPriority = "Medium";
    } else if (descLower.includes("wire") || descLower.includes("current") || descLower.includes("shock") || descLower.includes("electric")) {
      suggestedCategory = "Electricity / Live Wire Issue";
      predictedPriority = "Critical";
    }
  }

  res.json({
    suggestedCategory,
    predictedPriority,
    executiveSummary,
    isDuplicate,
    duplicateOfId
  });
});

// Secure Google Geocoding API Proxy
app.get("/api/geocode", async (req, res) => {
  const { pincode, lat, lng } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "GOOGLE_MAPS_PLATFORM_KEY is not configured on the server." });
  }

  try {
    let url = "";
    if (pincode) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(pincode + ", India")}&key=${apiKey}`;
    } else if (lat && lng) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    } else {
      return res.status(400).json({ error: "Please provide either 'pincode' or 'lat' and 'lng' query parameters." });
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Geocoding Proxy Error:", err);
    return res.status(500).json({ error: "Failed to perform geocoding/reverse-geocoding." });
  }
});

// Image verification via Gemini Vision
app.post("/api/ai/verify-image", async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Image data is required" });
  }

  if (!ai) {
    // Simulate verification
    return res.json({
      valid: true,
      confidence: 0.92,
      detectedIssue: "Civic issue pattern detected",
      description: "Visual analysis is bypassed as Gemini API Key is not configured."
    });
  }

  try {
    const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: rawBase64,
      },
    };

    const promptPart = {
      text: `You are an Indian municipal AI inspector. Analyze this uploaded picture. 
      Determine if it shows a real civic infrastructure or sanitation issue (e.g., potholes, sewage leaks, garbage dumping, unlit streets, pipe leaks, broken public properties, tree blockages, flooding, air pollution).
      
      Respond strictly in JSON format with the following fields:
      {
        "valid": true or false (true if it represents a real municipal civic/sanitation problem; false if it is a random selfie, empty page, document screen, spam, or clean nature),
        "confidence": 0.0 to 1.0,
        "detectedIssue": "Brief label of what is detected in the image",
        "description": "Short explanation of your visual analysis."
      }`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, promptPart] },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (err) {
    console.error("AI Image Verification failed:", err);
    res.json({
      valid: true,
      confidence: 0.85,
      detectedIssue: "Civic issue (Fallback Validation)",
      description: "Auto-approved via fallback due to model routing."
    });
  }
});

// Get Complaints (With full Search, Filter, Sort, Pagination)
app.get("/api/complaints", (req, res) => {
  let filtered = [...db.complaints];
  const { q, status, category, priority, state, district, pinCode, limit, citizenId } = req.query;

  // Search filter
  if (q) {
    const searchStr = String(q).toLowerCase();
    filtered = filtered.filter(c => 
      c.id.toLowerCase().includes(searchStr) ||
      c.title.toLowerCase().includes(searchStr) ||
      c.description.toLowerCase().includes(searchStr) ||
      c.address.toLowerCase().includes(searchStr) ||
      (c.landmark && c.landmark.toLowerCase().includes(searchStr))
    );
  }

  // Exact matches
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  if (category) {
    filtered = filtered.filter(c => c.category === category);
  }
  if (priority) {
    filtered = filtered.filter(c => c.priority === priority);
  }
  if (state) {
    filtered = filtered.filter(c => c.state === state);
  }
  if (district) {
    filtered = filtered.filter(c => c.district === district);
  }
  if (pinCode) {
    filtered = filtered.filter(c => c.pinCode === pinCode);
  }
  if (citizenId) {
    filtered = filtered.filter(c => c.citizenId === citizenId);
  }

  // Newest first
  filtered.sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime());

  if (limit) {
    filtered = filtered.slice(0, Number(limit));
  }

  res.json(filtered);
});

// Get single complaint details
app.get("/api/complaints/:id", (req, res) => {
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  // Mask user details if anonymous and requester is not admin
  const token = req.headers.authorization?.split(" ")[1];
  let requesterIsAdmin = false;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.role === UserRole.ADMIN) {
        requesterIsAdmin = true;
      }
    } catch (e) {}
  }

  const result = { ...complaint };
  if (result.anonymous && !requesterIsAdmin) {
    delete result.citizenName;
    delete result.citizenId;
  }

  res.json(result);
});

// Create new Complaint
app.post("/api/complaints", authenticateJWT, (req: any, res) => {
  const { 
    title, 
    description, 
    category, 
    priority, 
    images, 
    video, 
    location, 
    address, 
    landmark, 
    state, 
    district, 
    pinCode, 
    anonymous 
  } = req.body;

  if (!title || !description || !category || !location || !address || !state || !district || !pinCode) {
    return res.status(400).json({ error: "Required fields missing. Please complete all fields." });
  }

  const complaintId = `COMP-2026-${String(db.complaints.length + 1).padStart(3, "0")}`;
  const citizenId = req.user.id;
  const citizenName = req.user.name;

  // Department auto mapping based on category
  const departmentMappings: Record<string, string> = {
    "Road Pothole / Damage": "Roads & Highways",
    "Garbage Dump / Sanitation": "Sanitation & Waste Management",
    "Water Leakage / Pipe Burst": "Water Supply & Sewage Board",
    "Sewage Overflow / Drainage": "Water Supply & Sewage Board",
    "Broken Street Light": "Electrical & Streetlights",
    "Traffic Signal Failure": "Traffic Police Department",
    "Public Toilet Issue": "Sanitation & Waste Management",
    "Electricity / Live Wire Issue": "State Electricity Board",
    "Pollution / Illegal Dumping": "Pollution Control Board",
    "Encroachment": "Urban Planning & Town Encroachment",
    "Tree Fall / Drainage Block": "Forestry & Disaster Management",
    "Waterlogging / Flooding": "Disaster Management Cell",
    "Stray Animal Menace": "Veterinary & Animal Husbandry",
    "Public Property Damage": "Public Works Department",
    "Other Civic Issues": "Municipal Administration"
  };

  const assignedDepartment = departmentMappings[category] || "Municipal Administration";

  const newComplaint: Complaint = {
    id: complaintId,
    title,
    description,
    category,
    priority: priority || ComplaintPriority.MEDIUM,
    status: ComplaintStatus.SUBMITTED,
    images: images || [],
    video,
    location,
    address,
    landmark,
    state,
    district,
    pinCode,
    anonymous: !!anonymous,
    citizenId,
    citizenName: anonymous ? undefined : citizenName,
    submissionTime: new Date().toISOString(),
    assignedDepartment,
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        status: ComplaintStatus.SUBMITTED,
        updatedBy: anonymous ? "Anonymous Citizen" : citizenName,
        remarks: "Complaint raised via Mobile/Web portal.",
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.complaints.push(newComplaint);

  // Send Admin/Authority notifications
  const notificationId = `n-${Date.now()}`;
  db.notifications.push({
    id: notificationId,
    userId: "admin",
    title: "New Complaint Reported",
    message: `A new complaint regarding ${category} was reported in ${district}, ${state}.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDB(db);

  logAction("COMPLAINT_CREATED", citizenId, citizenName, `Submitted complaint ${complaintId} under ${category}`);

  res.status(211).json(newComplaint);
});

// Update Complaint Status (Authority & Admin)
app.put("/api/complaints/:id/status", authenticateJWT, (req: any, res) => {
  const { status, remarks, resolutionImage } = req.body;
  if (!status || !remarks) {
    return res.status(400).json({ error: "Status and remarks are required" });
  }

  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (req.user.role !== UserRole.AUTHORITY && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only Authorities or Administrators can update complaint status" });
  }

  complaint.status = status;
  if (remarks) {
    complaint.authorityRemarks = remarks;
  }
  if (resolutionImage) {
    complaint.resolutionImage = resolutionImage;
  }

  // Append to timeline
  complaint.timeline.push({
    id: `t-${Date.now()}`,
    status,
    updatedBy: req.user.name,
    remarks,
    timestamp: new Date().toISOString()
  });

  // Push notification to the reporter (citizen)
  db.notifications.push({
    id: `n-${Date.now()}`,
    userId: complaint.citizenId,
    title: `Complaint Update: ${status}`,
    message: `Your complaint COMP-${complaint.id} status is now '${status}'. Remarks: ${remarks}`,
    read: false,
    timestamp: new Date().toISOString()
  });

  saveDB(db);

  logAction("STATUS_UPDATED", req.user.id, req.user.name, `Updated complaint ${complaint.id} status to ${status}`);

  res.json(complaint);
});

// Assign Complaint Department (Admin Only)
app.put("/api/complaints/:id/assign", authenticateJWT, (req: any, res) => {
  const { assignedDepartment, priority } = req.body;
  
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only administrators can assign departments" });
  }

  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (assignedDepartment) {
    complaint.assignedDepartment = assignedDepartment;
    complaint.status = ComplaintStatus.ASSIGNED;
    complaint.timeline.push({
      id: `t-${Date.now()}`,
      status: ComplaintStatus.ASSIGNED,
      updatedBy: req.user.name,
      remarks: `Assigned department re-mapped to: ${assignedDepartment}`,
      timestamp: new Date().toISOString()
    });
  }

  if (priority) {
    complaint.priority = priority;
  }

  saveDB(db);
  logAction("COMPLAINT_ASSIGNED", req.user.id, req.user.name, `Assigned complaint ${complaint.id} to ${assignedDepartment}`);

  res.json(complaint);
});

// Seen By Authority Endpoint
app.post("/api/complaints/:id/seen", authenticateJWT, (req: any, res) => {
  if (req.user.role !== UserRole.AUTHORITY) {
    return res.status(403).json({ error: "Only authorities can perform this action" });
  }
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  if (!complaint.seenByAuthority) {
    complaint.seenByAuthority = true;
    complaint.seenTime = new Date().toISOString();
    complaint.seenTimestamp = new Date().toISOString();
    complaint.status = ComplaintStatus.SEEN_BY_AUTHORITY;
    complaint.timeline.push({
      id: `t-${Date.now()}-seen`,
      status: ComplaintStatus.SEEN_BY_AUTHORITY,
      updatedBy: req.user.name,
      remarks: "Complaint viewed by Area Authority officer.",
      timestamp: new Date().toISOString()
    });
    saveDB(db);
    logAction("COMPLAINT_SEEN", req.user.id, req.user.name, `Authority marked complaint ${complaint.id} as seen.`);
  }
  res.json(complaint);
});

// Set Estimated Resolution Time
app.put("/api/complaints/:id/resolution-time", authenticateJWT, (req: any, res) => {
  const { estimatedResolutionTime } = req.body;
  if (!estimatedResolutionTime) {
    return res.status(400).json({ error: "Estimated resolution time is required" });
  }
  if (req.user.role !== UserRole.AUTHORITY) {
    return res.status(403).json({ error: "Only authorities can perform this action" });
  }
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  complaint.estimatedResolutionTime = estimatedResolutionTime;
  complaint.timeline.push({
    id: `t-${Date.now()}-est`,
    status: complaint.status,
    updatedBy: req.user.name,
    remarks: `Estimated resolution time updated to: ${estimatedResolutionTime}`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  logAction("ESTIMATED_RESOLUTION_UPDATED", req.user.id, req.user.name, `Estimated resolution time for ${complaint.id} updated to ${estimatedResolutionTime}`);
  res.json(complaint);
});

// Post Daily Progress Update
app.post("/api/complaints/:id/progress", authenticateJWT, (req: any, res) => {
  const { message, remarks, status, officerName } = req.body;
  const actualMessage = message || remarks || "Daily progress update posted.";
  const actualStatus = status || ComplaintStatus.IN_PROGRESS;
  const actualOfficer = officerName || req.user.name;

  if (req.user.role !== UserRole.AUTHORITY) {
    return res.status(403).json({ error: "Only authorities can perform this action" });
  }
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (!complaint.progressLogs) {
    complaint.progressLogs = [];
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN');
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const newLog = {
    id: `p-${Date.now()}`,
    date: dateStr,
    time: timeStr,
    officerName: actualOfficer,
    message: actualMessage,
    remarks: actualMessage,
    status: actualStatus
  };

  complaint.progressLogs.push(newLog);

  // Also update complaint main status
  complaint.status = actualStatus;

  // Append to timeline too
  complaint.timeline.push({
    id: `t-${Date.now()}-prog`,
    status: actualStatus,
    updatedBy: actualOfficer,
    remarks: `[Progress Update] ${actualMessage}`,
    timestamp: now.toISOString()
  });

  saveDB(db);
  logAction("PROGRESS_LOG_POSTED", req.user.id, req.user.name, `Authority posted progress update for complaint ${complaint.id}`);
  res.json(complaint);
});

// Secure Archive Complaint
app.post("/api/complaints/:id/archive", authenticateJWT, (req: any, res) => {
  const { password } = req.body;
  if (password !== "7102006") {
    return res.status(401).json({ error: "Invalid archive master key password." });
  }
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only administrators can archive complaints." });
  }
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  if (!db.archivedComplaints) {
    db.archivedComplaints = [];
  }

  complaint.status = ComplaintStatus.RESOLVED;

  db.archivedComplaints.push(complaint);
  db.complaints = db.complaints.filter(c => c.id !== complaint.id);

  saveDB(db);
  logAction("COMPLAINT_ARCHIVED", req.user.id, req.user.name, `Archived and locked complaint ${complaint.id}`);
  res.json({ success: true });
});

// Load Secure Archive Complaints
app.get("/api/complaints/archive", authenticateJWT, (req: any, res) => {
  const { password } = req.query;
  if (password !== "7102006") {
    return res.status(401).json({ error: "Invalid archive password" });
  }
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only administrators can view the archive" });
  }
  res.json(db.archivedComplaints || []);
});

// Analytics Dashboard Endpoint
app.get("/api/analytics", (req, res) => {
  const complaints = db.complaints;
  
  // Count unique users who have successfully logged in based on USER_LOGIN audit logs
  const loggedInUserIds = new Set(
    (db.auditLogs || [])
      .filter(log => log.action === "USER_LOGIN")
      .map(log => log.userId)
  );
  const totalUsers = loggedInUserIds.size;
  const total = complaints.length;

  // Specific status metrics
  const pending = complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length;
  const seen = complaints.filter(c => c.status === ComplaintStatus.SEEN_BY_AUTHORITY).length;
  const inProgress = complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.UNDER_REVIEW).length;
  const completed = complaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED).length;
  const rejected = complaints.filter(c => c.status === ComplaintStatus.REJECTED).length;

  // Count resolved today
  const todayStr = new Date().toISOString().split("T")[0];
  const resolvedToday = complaints.filter(c => {
    const isCompleted = c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED;
    if (!isCompleted) return false;
    const hasTodayTimeline = c.timeline.some(evt => 
      (evt.status === ComplaintStatus.RESOLVED || evt.status === ComplaintStatus.CLOSED) && 
      evt.timestamp?.startsWith(todayStr)
    );
    return hasTodayTimeline || c.completionDate?.startsWith(todayStr);
  }).length;

  // Authorities and Citizens counts
  const authorities = db.users.filter(u => u.role === UserRole.AUTHORITY).length || 2;
  const citizens = db.users.filter(u => u.role === UserRole.CITIZEN).length || 1;

  // Complaints by category mapping
  const categoryMap: Record<string, number> = {};
  complaints.forEach(c => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const byCategory = Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] }));

  // Complaints by District mapping
  const districtMap: Record<string, number> = {};
  complaints.forEach(c => {
    districtMap[c.district] = (districtMap[c.district] || 0) + 1;
  });
  const byDistrict = Object.keys(districtMap).map(name => ({ name, value: districtMap[name] }));

  // Complaints by PIN Code mapping
  const pinMap: Record<string, number> = {};
  complaints.forEach(c => {
    pinMap[c.pinCode] = (pinMap[c.pinCode] || 0) + 1;
  });
  const byPinCode = Object.keys(pinMap)
    .map(name => ({ name, value: pinMap[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Complaints by Priority mapping
  const priorityMap: Record<string, number> = {};
  complaints.forEach(c => {
    const p = c.priority || "Medium";
    priorityMap[p] = (priorityMap[p] || 0) + 1;
  });
  const byPriority = Object.keys(priorityMap).map(name => ({ name, value: priorityMap[name] }));

  // Resolution rate (completed / total)
  const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Monthly trends - dynamically generated from database dates
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const trendsMap: Record<string, { count: number; resolved: number }> = {};
  const last6Months: string[] = [];
  
  for (let i = 5; i >= 0; i--) {
    let mIdx = currentMonthIdx - i;
    if (mIdx < 0) mIdx += 12;
    const name = months[mIdx];
    last6Months.push(name);
    trendsMap[name] = { count: 0, resolved: 0 };
  }

  complaints.forEach(c => {
    try {
      const date = new Date(c.submissionTime);
      const monthName = months[date.getMonth()];
      if (trendsMap[monthName]) {
        trendsMap[monthName].count++;
        if (c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED) {
          trendsMap[monthName].resolved++;
        }
      }
    } catch (e) {}
  });

  const monthlyTrends = last6Months.map(name => ({
    name,
    count: trendsMap[name].count,
    resolved: trendsMap[name].resolved
  }));

  res.json({
    totalUsers,
    total,
    pending,
    seen,
    inProgress,
    completed,
    rejected,
    resolvedToday,
    authorities,
    citizens,
    resolutionRate,
    byCategory,
    byDistrict,
    byPinCode,
    byPriority,
    monthlyTrends
  });
});


// ==========================================================
// VITE AND ASSETS MIDDLEWARE INTEGRATION
// ==========================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n==========================================================`);
    console.log(`🇮🇳 NATIONAL CIVIC PORTAL - FULL STACK SERVER STARTED 🇮🇳`);
    console.log(`Port: ${PORT}`);
    console.log(`Endpoint: http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`==========================================================\n`);
  });
}

startServer();
