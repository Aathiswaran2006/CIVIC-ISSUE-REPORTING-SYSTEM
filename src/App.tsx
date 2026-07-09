import React from "react";
import { 
  Shield, 
  MapPin, 
  Users, 
  PlusCircle, 
  History, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  Check, 
  Download, 
  Sparkles, 
  Moon, 
  Sun,
  Camera,
  Map as MapIcon,
  ChevronRight,
  Info,
  Loader2
} from "lucide-react";
import { translations, LanguageCode } from "./translations";
import { UserRole, User, Complaint, ComplaintStatus, ComplaintPriority, Notification, AuditLog } from "./types";
import LanguageSelector from "./components/LanguageSelector";
import AnalyticsCharts from "./components/Charts";

export default function App() {
  // Theme and Localization States
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [lang, setLang] = React.useState<LanguageCode>("en");
  
  // App Navigation View: "landing" | "login" | "register" | "forgot-password" | "citizen-dashboard" | "authority-dashboard" | "admin-dashboard"
  const [view, setView] = React.useState<string>("landing");
  
  // Auth States
  const [token, setToken] = React.useState<string | null>(localStorage.getItem("sih_token"));
  const [user, setUser] = React.useState<User | null>(null);
  const [loginRole, setLoginRole] = React.useState<UserRole>(UserRole.CITIZEN);
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authName, setAuthName] = React.useState("");
  const [authPinCode, setAuthPinCode] = React.useState("");
  const [authPhone, setAuthPhone] = React.useState("");
  const [authDept, setAuthDept] = React.useState("Roads & Highways");
  const [authState, setAuthState] = React.useState("Tamil Nadu");
  const [authDistrict, setAuthDistrict] = React.useState("Chennai");
  const [authError, setAuthError] = React.useState("");
  const [adminDept, setAdminDept] = React.useState("Municipal Administration");
  const [adminDistrict, setAdminDistrict] = React.useState("Chennai");
  const [adminState, setAdminState] = React.useState("Tamil Nadu");

  const tamilNaduDistricts = [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Vellore", "Thanjavur", 
    "Tuticorin", "Erode", "Dindigul", "Kanchipuram", "Tiruvallur", "Cuddalore", "Villupuram", 
    "Thiruvannamalai", "Namakkal", "Karur", "Perambalur", "Ariyalur", "Nagapattinam", "Tiruvarur", 
    "Pudukkottai", "Sivaganga", "Ramanathapuram", "Virudhunagar", "Theni", "Tiruppur", "The Nilgiris", 
    "Dharmapuri", "Krishnagiri", "Ranipet", "Tirupathur", "Tenkasi", "Chengalpattu", "Kallakurichi", "Mayiladuthurai"
  ];

  const adminDepartments = [
    "Municipal Administration", "Highways Department", "Water Supply", "Electricity Board", 
    "Public Works Department", "Health Department", "Police Department", "Revenue Department", "Panchayat"
  ];
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = React.useState("");

  // Business Logic States
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [usersList, setUsersList] = React.useState<User[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  
  // Active Complaint Detail panel
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  const [showNotificationPanel, setShowNotificationPanel] = React.useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("");

  // Complaint Submission Form States
  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formCategory, setFormCategory] = React.useState("Road Pothole / Damage");
  const [formPriority, setFormPriority] = React.useState<ComplaintPriority>(ComplaintPriority.MEDIUM);
  const [formLat, setFormLat] = React.useState(13.0827);
  const [formLng, setFormLng] = React.useState(80.2707);
  const [formAddress, setFormAddress] = React.useState("Kannappar Thidal, Periamet, Chennai, Tamil Nadu - 600003");
  const [formLandmark, setFormLandmark] = React.useState("");
  const [formState, setFormState] = React.useState("Tamil Nadu");
  const [formDistrict, setFormDistrict] = React.useState("Chennai");
  const [formCity, setFormCity] = React.useState("Chennai");
  const [formLocality, setFormLocality] = React.useState("Periamet");
  const [formPincode, setFormPincode] = React.useState("600003");
  const [formAnonymous, setFormAnonymous] = React.useState(false);
  const [formImages, setFormImages] = React.useState<string[]>([]);
  
  // AI Assist Status States
  const [aiAnalyzing, setAiAnalyzing] = React.useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = React.useState("");
  const [aiDuplicateAlert, setAiDuplicateAlert] = React.useState("");
  const [imageVerification, setImageVerification] = React.useState<{valid: boolean; detectedIssue: string; description: string} | null>(null);
  const [imageVerifying, setImageVerifying] = React.useState(false);

  // Authority Form Status Update States
  const [updateStatus, setUpdateStatus] = React.useState<ComplaintStatus>(ComplaintStatus.IN_PROGRESS);
  const [updateRemarks, setUpdateRemarks] = React.useState("");
  const [updateResolutionImg, setUpdateResolutionImg] = React.useState("");
  const [estResolutionTime, setEstResolutionTime] = React.useState("");
  const [dailyProgressMsg, setDailyProgressMsg] = React.useState("");
  const [archivePassword, setArchivePassword] = React.useState("");
  const [archivedComplaintsList, setArchivedComplaintsList] = React.useState<any[]>([]);
  const [viewingArchive, setViewingArchive] = React.useState(false);

  // Admin Assignment States
  const [assignDept, setAssignDept] = React.useState("Roads & Highways");
  const [assignPriority, setAssignPriority] = React.useState<ComplaintPriority>(ComplaintPriority.HIGH);
  const [filterPinCode, setFilterPinCode] = React.useState("");
  const [searchName, setSearchName] = React.useState("");
  const [searchAuthority, setSearchAuthority] = React.useState("");

  const t = translations[lang];

  // Dynamic admin metrics calculation
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
  const closedCount = complaints.filter(c => c.status === ComplaintStatus.CLOSED).length;
  const verificationRate = totalCount > 0 ? Math.round(((resolvedCount + closedCount) / totalCount) * 100) : 0;

  const totalStat = analytics?.total ?? complaints.length;
  const pendingStat = analytics?.pending ?? complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length;
  const seenStat = analytics?.seen ?? complaints.filter(c => c.status === ComplaintStatus.SEEN_BY_AUTHORITY).length;
  const inProgressStat = analytics?.inProgress ?? complaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.UNDER_REVIEW).length;
  const completedStat = analytics?.completed ?? complaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED).length;
  const resolvedTodayStat = analytics?.resolvedToday ?? 0;
  const authoritiesStat = analytics?.authorities ?? (usersList.filter(u => u.role === UserRole.AUTHORITY).length || 2);
  const citizensStat = analytics?.citizens ?? (usersList.filter(u => u.role === UserRole.CITIZEN).length || 1);
  
  const uniqueDistricts = Array.from(new Set(complaints.map(c => c.district))).filter(Boolean);
  const activeWardsText = uniqueDistricts.length > 0 ? `${uniqueDistricts.length} District${uniqueDistricts.length > 1 ? "s" : ""}` : "0 Districts";
  
  let avgSpeedText = "0 Hours";
  const resolvedOrClosed = complaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED);
  if (resolvedOrClosed.length > 0) {
    let totalHrs = 0;
    let validCount = 0;
    resolvedOrClosed.forEach(c => {
      const start = new Date(c.submissionTime).getTime();
      const resolution = c.timeline.find(t => t.status === ComplaintStatus.RESOLVED || t.status === ComplaintStatus.CLOSED);
      if (resolution) {
        const end = new Date(resolution.timestamp).getTime();
        const diff = (end - start) / (1000 * 60 * 60);
        if (diff >= 0) {
          totalHrs += diff;
          validCount++;
        }
      }
    });
    if (validCount > 0) {
      avgSpeedText = `${Math.round(totalHrs / validCount)} Hours`;
    }
  }

  const categories = [
    t.pothole, t.garbage, t.waterLeak, t.sewage, t.streetLight, t.trafficSignal,
    t.publicToilet, t.electricity, t.pollution, t.encroachment, t.treeFall,
    t.flooding, t.strayAnimals, t.propertyDamage, t.other
  ];

  const categoryEnglishMap: Record<string, string> = {
    [t.pothole]: "Road Pothole / Damage",
    [t.garbage]: "Garbage Dump / Sanitation",
    [t.waterLeak]: "Water Leakage / Pipe Burst",
    [t.sewage]: "Sewage Overflow / Drainage",
    [t.streetLight]: "Broken Street Light",
    [t.trafficSignal]: "Traffic Signal Failure",
    [t.publicToilet]: "Public Toilet Issue",
    [t.electricity]: "Electricity / Live Wire Issue",
    [t.pollution]: "Pollution / Illegal Dumping",
    [t.encroachment]: "Encroachment",
    [t.treeFall]: "Tree Fall / Drainage Block",
    [t.flooding]: "Waterlogging / Flooding",
    [t.strayAnimals]: "Stray Animal Menace",
    [t.propertyDamage]: "Public Property Damage",
    [t.other]: "Other Civic Issues",
  };

  // Sync token and load session
  React.useEffect(() => {
    let decodedUser: User | undefined = undefined;
    if (token) {
      // Validate or decode local user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        decodedUser = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          department: payload.department,
          district: payload.district,
          state: payload.state,
        };
        setUser(decodedUser);
        
        // Route to correct dashboard
        if (payload.role === UserRole.CITIZEN) setView("citizen-dashboard");
        else if (payload.role === UserRole.AUTHORITY) setView("authority-dashboard");
        else if (payload.role === UserRole.ADMIN) setView("admin-dashboard");
      } catch (e) {
        handleLogout();
      }
    }
    fetchComplaints(decodedUser);
    fetchAnalytics();
  }, [token]);

  // Dynamic state/district bindings
  const indianStates = ["Tamil Nadu", "Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "West Bengal"];
  const districtsForState: Record<string, string[]> = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi"],
    "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Thane", "Nagpur"],
    "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra"],
    "West Bengal": ["Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas"],
  };

  // Automatic India PIN Code lookup & Google Geocoding
  React.useEffect(() => {
    const cleanPin = formPincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) return;

    let isSubscribed = true;

    const performPincodeLookup = async () => {
      try {
        // 1. Fetch local Indian administrative structures from Post Office API
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const postData = await postRes.json();
        
        let fetchedState = "";
        let fetchedDistrict = "";
        let fetchedCity = "";
        let fetchedLocality = "";

        if (isSubscribed && postData?.[0]?.Status === "Success" && postData[0].PostOffice?.[0]) {
          const po = postData[0].PostOffice[0];
          fetchedState = po.State || "";
          fetchedDistrict = po.District || "";
          fetchedCity = po.Division || po.Block || po.Circle || "";
          fetchedLocality = po.Name || "";

          setFormState(fetchedState);
          setFormDistrict(fetchedDistrict);
          setFormCity(fetchedCity);
          setFormLocality(fetchedLocality);
        }

        // 2. Fetch Google Maps GPS coordinates and reverse-geocoded complete address
        const geoRes = await fetch(`/api/geocode?pincode=${cleanPin}`);
        if (!geoRes.ok) return;
        const geoData = await geoRes.json();

        if (isSubscribed && geoData?.status === "OK" && geoData.results?.[0]) {
          const firstResult = geoData.results[0];
          const loc = firstResult.geometry.location;
          const fullAddress = firstResult.formatted_address;

          setFormLat(loc.lat);
          setFormLng(loc.lng);
          setFormAddress(fullAddress);

          // If the postal API was missing some fields, resolve them using Google Geocoding
          for (const component of firstResult.address_components) {
            const types = component.types;
            if (!fetchedState && types.includes("administrative_area_level_1")) {
              setFormState(component.long_name);
            }
            if (!fetchedDistrict && types.includes("administrative_area_level_2")) {
              setFormDistrict(component.long_name);
            }
            if (!fetchedCity && (types.includes("locality") || types.includes("administrative_area_level_3"))) {
              setFormCity(component.long_name);
            }
            if (!fetchedLocality && (types.includes("sublocality") || types.includes("sublocality_level_1") || types.includes("neighborhood"))) {
              setFormLocality(component.long_name);
            }
          }
        }
      } catch (err) {
        console.error("PIN code lookup / Geocoding error:", err);
      }
    };

    performPincodeLookup();

    return () => {
      isSubscribed = false;
    };
  }, [formPincode]);

  const handleStateChange = (stateName: string) => {
    setAuthState(stateName);
    const firstDist = districtsForState[stateName]?.[0] || "";
    setAuthDistrict(firstDist);
  };

  // Fetching procedures
  const fetchComplaints = async (customUser?: User) => {
    try {
      const activeUser = customUser || user;
      let url = "/api/complaints";
      if (activeUser && activeUser.role === UserRole.CITIZEN) {
        url += `?citizenId=${activeUser.id}`;
      } else if (activeUser && activeUser.role === UserRole.AUTHORITY) {
        const authPin = activeUser.email.replace("authority_", "").split("@")[0];
        url += `?pinCode=${authPin}`;
      }
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (e) {
      console.error("Error fetching complaints:", e);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    if (!token || user?.role !== UserRole.ADMIN) return;
    try {
      const res = await fetch("/api/audit-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuditLogs(data);
      }
    } catch (e) {}
  };

  const fetchUsers = async () => {
    if (!token || user?.role !== UserRole.ADMIN) return;
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (e) {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {}
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      if (user.role === UserRole.ADMIN) {
        fetchAuditLogs();
        fetchUsers();
      }
    }
  }, [user]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const payload: any = {
        password: authPassword,
        role: loginRole
      };
      if (loginRole === UserRole.CITIZEN) {
        payload.email = authEmail;
      } else if (loginRole === UserRole.AUTHORITY) {
        payload.name = authName;
        payload.pinCode = authPinCode;
      } else if (loginRole === UserRole.ADMIN) {
        payload.name = authName;
        payload.department = adminDept;
        payload.district = adminDistrict;
        payload.state = adminState;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("sih_token", data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Reset login forms
        setAuthEmail("");
        setAuthPassword("");

        if (data.user.role === UserRole.CITIZEN) setView("citizen-dashboard");
        else if (data.user.role === UserRole.AUTHORITY) setView("authority-dashboard");
        else if (data.user.role === UserRole.ADMIN) setView("admin-dashboard");
      } else {
        setAuthError(data.error || "Login failed");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
          role: loginRole,
          department: loginRole === UserRole.AUTHORITY ? authDept : undefined,
          state: authState,
          district: authDistrict
        })
      });
      const data = await res.json();
      if (res.status === 211 || res.ok) {
        localStorage.setItem("sih_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthPhone("");
        
        if (data.user.role === UserRole.CITIZEN) setView("citizen-dashboard");
        else if (data.user.role === UserRole.AUTHORITY) setView("authority-dashboard");
        else if (data.user.role === UserRole.ADMIN) setView("admin-dashboard");
      } else {
        setAuthError(data.error || "Registration failed");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccessMsg("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword: "citizen123" })
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccessMsg("Password reset successfully! Temporary password is set to 'citizen123'. You can now login.");
      } else {
        setAuthError(data.error);
      }
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("sih_token");
    setToken(null);
    setUser(null);
    setView("landing");
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormImages(prev => [...prev, base64]);
        
        // Auto trigger Gemini Vision check for the first image
        if (formImages.length === 0) {
          triggerImageAIValidation(base64);
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  // Real-time AI Assistant triggers
  const triggerAICategorization = async () => {
    if (!formDescription) {
      alert("Please type a description first!");
      return;
    }
    setAiAnalyzing(true);
    setAiSuccessMessage("");
    try {
      const res = await fetch("/api/ai/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          location: { lat: formLat, lng: formLng }
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Find matching localized category based on English returned value
        const foundCategoryLocal = Object.keys(categoryEnglishMap).find(
          k => categoryEnglishMap[k] === data.suggestedCategory
        );
        if (foundCategoryLocal) {
          setFormCategory(foundCategoryLocal);
        }
        setFormPriority(data.predictedPriority);
        setAiSuccessMessage(`AI Assist suggested category: ${data.suggestedCategory} (${data.predictedPriority} Priority)`);
        
        if (data.isDuplicate) {
          setAiDuplicateAlert(`Duplicate warning: A similar complaint (${data.duplicateOfId}) is already pending within 150m. We will link them together.`);
        } else {
          setAiDuplicateAlert("");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const triggerImageAIValidation = async (base64Img: string) => {
    setImageVerifying(true);
    setImageVerification(null);
    try {
      const res = await fetch("/api/ai/verify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: base64Img })
      });
      const data = await res.json();
      if (res.ok) {
        setImageVerification(data);
      }
    } catch (e) {
    } finally {
      setImageVerifying(false);
    }
  };

  // Submit Complaint
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const englishCategoryName = categoryEnglishMap[formCategory] || "Other Civic Issues";
      
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: englishCategoryName,
          priority: formPriority,
          images: formImages,
          location: { lat: formLat, lng: formLng },
          address: formAddress,
          landmark: formLandmark,
          state: formState,
          district: formDistrict,
          pinCode: formPincode,
          anonymous: formAnonymous
        })
      });

      if (res.status === 211 || res.ok) {
        alert("Complaint successfully raised with Local Body Administration! Verification ID assigned.");
        // Clear form
        setFormTitle("");
        setFormDescription("");
        setFormLandmark("");
        setFormImages([]);
        setAiSuccessMessage("");
        setAiDuplicateAlert("");
        setImageVerification(null);

        // Reload data
        fetchComplaints();
        fetchAnalytics();
        
        // Go to history tab
        setView("citizen-dashboard");
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed");
      }
    } catch (err) {}
  };

  // Authority status updates
  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedComplaint) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateStatus,
          remarks: updateRemarks,
          resolutionImage: updateResolutionImg
        })
      });
      
      if (res.ok) {
        alert("Status update and timeline successfully broadcasted.");
        setUpdateRemarks("");
        setUpdateResolutionImg("");
        setSelectedComplaint(null);
        fetchComplaints();
        fetchAnalytics();
      }
    } catch (e) {}
  };

  // Authority estimated resolution time
  const handleSetResolutionTime = async () => {
    if (!token || !selectedComplaint || !estResolutionTime.trim()) {
      alert("Please enter a valid estimated resolution time.");
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/resolution-time`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          estimatedResolutionTime: estResolutionTime
        })
      });
      if (res.ok) {
        alert("Estimated resolution time successfully set.");
        setEstResolutionTime("");
        const updated = await res.json();
        setSelectedComplaint(updated);
        fetchComplaints();
        fetchAnalytics();
      } else {
        alert("Failed to update estimated resolution time.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Authority progress log update
  const handleAddProgressLog = async () => {
    if (!token || !selectedComplaint || !dailyProgressMsg.trim()) {
      alert("Please enter a valid progress update message.");
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: dailyProgressMsg,
          officerName: user?.name || "Area Officer"
        })
      });
      if (res.ok) {
        alert("Daily progress log successfully published.");
        setDailyProgressMsg("");
        const updated = await res.json();
        setSelectedComplaint(updated);
        fetchComplaints();
        fetchAnalytics();
      } else {
        alert("Failed to publish progress log.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Authority complete project
  const handleCompleteProject = async () => {
    if (!token || !selectedComplaint) return;
    const confirmComplete = window.confirm("Are you sure you want to mark this project as COMPLETED?");
    if (!confirmComplete) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: ComplaintStatus.RESOLVED,
          remarks: "Project successfully completed and closed by Area Authority.",
          resolutionImage: ""
        })
      });
      if (res.ok) {
        alert("Project has been successfully COMPLETED!");
        const updated = await res.json();
        setSelectedComplaint(updated);
        fetchComplaints();
        fetchAnalytics();
      } else {
        alert("Failed to complete project.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Assignment Operations
  const handleAdminAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedComplaint) return;

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          assignedDepartment: assignDept,
          priority: assignPriority
        })
      });
      if (res.ok) {
        alert("Complaint successfully reassigned to corresponding local body officer.");
        setSelectedComplaint(null);
        fetchComplaints();
        fetchAnalytics();
      }
    } catch (e) {}
  };

  // Delete fake complaints (Admin only)
  const handleDeleteSpam = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this complaint as fake/spam? This will create an audit entry.")) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Complaint deleted successfully.");
        setSelectedComplaint(null);
        fetchComplaints();
        fetchAnalytics();
        fetchAuditLogs();
      }
    } catch (e) {}
  };

  // Admin archive complaint
  const handleArchiveComplaintSubmit = async () => {
    if (!token || !selectedComplaint) return;
    if (archivePassword !== "7102006") {
      alert("Invalid archive password!");
      return;
    }
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          password: archivePassword
        })
      });
      if (res.ok) {
        alert("Complaint successfully moved to the password-secured Completed Projects Archive!");
        setArchivePassword("");
        setSelectedComplaint(null);
        fetchComplaints();
        fetchAnalytics();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to archive complaint.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load archive list (Admin only)
  const handleLoadArchive = async () => {
    if (!token) return;
    if (archivePassword !== "7102006") {
      alert("Invalid archive password!");
      return;
    }
    try {
      const res = await fetch(`/api/complaints/archive?password=${archivePassword}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArchivedComplaintsList(data);
        setViewingArchive(true);
      } else {
        alert("Failed to load archived complaints. Ensure correct password.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter & Search Logic
  const filteredComplaints = complaints.filter(c => {
    // Authority PIN Code Constraint: must NEVER see complaints from other areas
    if (user && user.role === UserRole.AUTHORITY) {
      const authPinCode = user.email.replace("authority_", "").split("@")[0];
      if (c.pinCode !== authPinCode) {
        return false;
      }
    }

    const q = searchQuery.toLowerCase();
    const matchSearch = q === "" || 
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q);
    
    const matchStatus = filterStatus === "" || c.status === filterStatus;
    const matchCategory = filterCategory === "" || c.category === filterCategory;

    // Admin dynamic filters
    const matchPin = filterPinCode === "" || c.pinCode.includes(filterPinCode);
    const matchCitizenName = searchName === "" || (c.citizenName && c.citizenName.toLowerCase().includes(searchName.toLowerCase()));
    const matchDept = searchAuthority === "" || (c.assignedDepartment && c.assignedDepartment.toLowerCase().includes(searchAuthority.toLowerCase()));

    return matchSearch && matchStatus && matchCategory && matchPin && matchCitizenName && matchDept;
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === "dark" ? "bg-[#090d16] text-slate-100 dark" : "bg-slate-100 text-slate-800"}`} id="app-root-container">
      
      {/* ==========================================================
          GLOBAL HEADER NAVBAR
          ========================================================== */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all ${
        theme === "dark" ? "bg-[#090d16]/80 border-slate-800/60" : "bg-white/85 border-slate-200/80"
      }`} id="global-navbar">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" id="nav-inner-container">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("landing")} id="brand-logo-section">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent uppercase">
                  {t.title}
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                  {t.sihCode}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">GOVERNMENT OF INDIA • LOCAL BODY CELL</p>
            </div>
          </div>

          <div className="flex items-center gap-3" id="nav-actions-section">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title={theme === "light" ? t.dark : t.light}
              id="theme-toggle-btn"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Local Multilingual Selector */}
            <LanguageSelector currentLang={lang} onChange={(newLang) => setLang(newLang)} dark={theme === "dark"} />

            {/* User Session States */}
            {user ? (
              <div className="flex items-center gap-3" id="user-logged-in-profile">
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotificationPanel(!showNotificationPanel);
                      fetchNotifications();
                    }}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                    }`}
                    id="notification-bell-btn"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" />
                    )}
                  </button>

                  {/* Dropdown Notification Panel */}
                  {showNotificationPanel && (
                    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-100 text-slate-800"
                    }`} id="notification-dropdown-panel">
                      <div className="px-4 py-3 border-b border-slate-200/20 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">{t.updates}</span>
                        <button 
                          onClick={async () => {
                            await fetch("/api/notifications/mark-read", {
                              method: "POST",
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchNotifications();
                          }}
                          className="text-[10px] text-slate-400 hover:text-emerald-500 transition-colors"
                        >
                          {t.markAllRead}
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100/10">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">No new alerts.</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 text-xs leading-relaxed transition-colors ${n.read ? "opacity-70" : "bg-emerald-500/5 font-medium"}`}>
                              <p className="font-semibold">{n.title}</p>
                              <p className="text-slate-400 mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-slate-500 block mt-1">
                                {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold leading-none">{user.name}</p>
                  <p className="text-[9px] font-mono uppercase text-emerald-500 mt-1">{user.role}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                  id="logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView("login")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md shadow-emerald-500/10 cursor-pointer"
                id="header-login-btn"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================================
          PORTAL CONTENT CONTAINER
          ========================================================== */}
      <main className="max-w-7xl mx-auto px-4 py-6" id="main-portal-content">
        
        {/* ==========================================================
            VIEW: LANDING (OFFICIAL PORTAL HOME)
            ========================================================== */}
        {view === "landing" && (
          <div className="flex flex-col gap-8 animate-fade-in" id="landing-view">
            {/* Government Hero Block */}
            <div className={`p-8 md:p-12 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between ${
              theme === "dark" 
                ? "bg-slate-900 border-slate-800" 
                : "bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border-emerald-100"
            }`} id="hero-banner">
              <div className="max-w-2xl flex flex-col gap-4 text-left" id="hero-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-3.5 h-3.5" /> National Digital Grievance Initiative
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {t.heroTitle}
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl">
                  {t.heroSubtitle}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <button
                    onClick={() => {
                      if (user) {
                        if (user.role === UserRole.CITIZEN) setView("citizen-dashboard");
                        else if (user.role === UserRole.AUTHORITY) setView("authority-dashboard");
                        else if (user.role === UserRole.ADMIN) setView("admin-dashboard");
                      } else {
                        setView("login");
                      }
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer text-sm"
                  >
                    Report/Submit Grievance
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById("track-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-6 py-3 font-semibold rounded-xl border transition-all cursor-pointer text-sm ${
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    Track Public Issue
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Portal Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4" id="national-stats-board">
              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-blue-500" : "bg-white border-slate-200 border-l-blue-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Users</p>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">Users: {analytics?.totalUsers ?? 0}</p>
              </div>
              
              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-indigo-500" : "bg-white border-slate-200 border-l-indigo-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Complaints</p>
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">Complaints: {analytics?.total ?? 0}</p>
              </div>

              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-amber-500" : "bg-white border-slate-200 border-l-amber-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Pending</p>
                <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">Pending: {analytics?.pending ?? 0}</p>
              </div>

              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-purple-500" : "bg-white border-slate-200 border-l-purple-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Assigned</p>
                <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">Assigned: {analytics?.assigned ?? 0}</p>
              </div>

              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-cyan-500" : "bg-white border-slate-200 border-l-cyan-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">In Progress</p>
                <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">In Progress: {analytics?.inProgress ?? 0}</p>
              </div>

              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-emerald-500" : "bg-white border-slate-200 border-l-emerald-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Resolved</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Resolved: {analytics?.resolved ?? 0}</p>
              </div>

              <div className={`p-5 rounded-2xl border border-l-4 text-left transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800 border-l-rose-500" : "bg-white border-slate-200 border-l-rose-500 shadow-sm"
              }`}>
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Closed</p>
                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">Closed: {analytics?.closed ?? 0}</p>
              </div>
            </div>

            {/* Quick Track & Search Section */}
            <div className="flex flex-col gap-6" id="track-section">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="track-header">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">{t.recentComplaints}</h3>
                  <p className="text-xs text-slate-400">Real-time civic issues across Indian municipalities</p>
                </div>

                <div className="flex gap-2" id="track-search-bar">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`px-4 py-2 rounded-xl border text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-sm"
                    }`}
                  />
                </div>
              </div>

              {/* Grid of Complaints */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="public-complaints-grid">
                {filteredComplaints.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-55" />
                    {searchQuery ? t.noComplaints : "No complaints have been submitted yet."}
                  </div>
                ) : (
                  filteredComplaints.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedComplaint(c)}
                      className={`rounded-xl border p-5 flex flex-col gap-4 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all ${
                        theme === "dark" ? "bg-[#111827] border-slate-800/80" : "bg-white border-slate-200/80 shadow-sm hover:shadow-md"
                      }`}
                      id={`complaint-card-${c.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold uppercase">
                          {c.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide transition-colors ${
                          c.status === ComplaintStatus.RESOLVED ? "theme-badge-resolved" :
                          c.status === ComplaintStatus.IN_PROGRESS ? "theme-badge-progress" :
                          c.status === ComplaintStatus.ASSIGNED ? "theme-badge-progress" :
                          "theme-badge-pending"
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                      </div>

                      {c.images.length > 0 && (
                        <div className="h-36 rounded-xl overflow-hidden relative">
                          <img 
                            src={c.images[0]} 
                            alt="evidence" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/10 pt-3 mt-auto">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{c.district}, {c.state}</span>
                        </div>
                        <span>{new Date(c.submissionTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: LOGIN / AUTHENTICATION
            ========================================================== */}
        {view === "login" && (
          <div className="max-w-md mx-auto py-12 animate-fade-in" id="login-view">
            <div className={`p-8 rounded-3xl border shadow-xl flex flex-col gap-6 text-left ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="text-center">
                <h3 className="text-2xl font-extrabold tracking-tight">{t.login}</h3>
                <p className="text-xs text-slate-400 mt-1">{t.roleSelection}</p>
              </div>

              {/* Role Selection Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/10 border border-slate-100/10" id="role-selection-tabs">
                <button
                  onClick={() => setLoginRole(UserRole.CITIZEN)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    loginRole === UserRole.CITIZEN ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  {t.citizen}
                </button>
                <button
                  onClick={() => setLoginRole(UserRole.AUTHORITY)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    loginRole === UserRole.AUTHORITY ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  {t.authority}
                </button>
                <button
                  onClick={() => setLoginRole(UserRole.ADMIN)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    loginRole === UserRole.ADMIN ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  {t.admin}
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs text-center font-semibold">
                  {authError}
                </div>
              )}

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs text-center font-semibold">
                  {resetSuccessMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {loginRole === UserRole.CITIZEN && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400">{t.email}</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      placeholder="e.g. citizen@sih.gov.in"
                    />
                  </div>
                )}

                {loginRole === UserRole.AUTHORITY && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">Authority Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="e.g. Ward 10 Officer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">Area PIN Code</label>
                      <input
                        type="text"
                        required
                        value={authPinCode}
                        onChange={(e) => setAuthPinCode(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="e.g. 622302"
                      />
                    </div>
                  </>
                )}

                {loginRole === UserRole.ADMIN && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">Administrator Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="e.g. Central Admin"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">Department</label>
                      <select
                        value={adminDept}
                        onChange={(e) => setAdminDept(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {adminDepartments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">District</label>
                      <select
                        value={adminDistrict}
                        onChange={(e) => setAdminDistrict(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {tamilNaduDistricts.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">State</label>
                      <input
                        type="text"
                        disabled
                        value={adminState}
                        className={`px-3 py-2 rounded-xl border text-sm bg-slate-100/10 border-slate-200/20 text-slate-400`}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400">
                      {t.password} {loginRole === UserRole.AUTHORITY && <span className="text-[10px] text-amber-500 font-normal">(Format: tn(PIN))</span>}
                    </label>
                    {loginRole === UserRole.CITIZEN && (
                      <button 
                        type="button" 
                        onClick={() => setView("forgot-password")}
                        className="text-xs text-emerald-500 hover:underline"
                      >
                        {t.forgotPassword}
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder={loginRole === UserRole.AUTHORITY ? "tn(PIN)" : "••••••••"}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
                >
                  {t.login}
                </button>
              </form>

              {/* Direct Seeding Credentials Assist info for evaluation */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[11px] leading-relaxed text-amber-500/90 text-center">
                <span className="font-extrabold uppercase">Evaluation Assist Credentials:</span><br />
                • Citizen: <span className="font-mono font-bold">citizen@sih.gov.in</span> / <span className="font-mono">citizen123</span><br />
                • Authority Office (PIN 600003): <span className="font-mono font-bold">R. K. Selvan</span> / <span className="font-mono">tn(600003)</span><br />
                • Administrator: <span className="font-mono font-bold">Sanjay Kumar (IAS)</span> / <span className="font-mono">7102006</span>
              </div>

              {loginRole === UserRole.CITIZEN && (
                <div className="text-center text-xs text-slate-400">
                  {t.dontHaveAccount}{" "}
                  <button onClick={() => { setLoginRole(UserRole.CITIZEN); setView("register"); }} className="text-emerald-500 hover:underline font-bold">
                    {t.register}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: REGISTER / AUTHENTICATION
            ========================================================== */}
        {view === "register" && (
          <div className="max-w-md mx-auto py-12 animate-fade-in" id="register-view">
            <div className={`p-8 rounded-3xl border shadow-xl flex flex-col gap-6 text-left ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="text-center">
                <h3 className="text-2xl font-extrabold tracking-tight">{t.register}</h3>
                <p className="text-xs text-slate-400 mt-1">Create civic portal account</p>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs text-center font-semibold">
                Only Citizens are permitted to register online. Authorities and Administrators are pre-authorized users.
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs text-center font-semibold">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder="Your legal name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder="e.g. name@email.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400">{t.phone}</label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Authority specific registration fields */}
                {loginRole === UserRole.AUTHORITY && (
                  <div className="flex flex-col gap-4 border-l-2 border-emerald-500 pl-3 my-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">Department Division</label>
                      <select
                        value={authDept}
                        onChange={(e) => setAuthDept(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <option value="Roads & Highways">Roads & Highways</option>
                        <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                        <option value="Water Supply & Sewage Board">Water Supply & Sewage Board</option>
                        <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                        <option value="Traffic Police Department">Traffic Police Department</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">{t.state}</label>
                      <select
                        value={authState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {indianStates.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">{t.district}</label>
                      <select
                        value={authDistrict}
                        onChange={(e) => setAuthDistrict(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {(districtsForState[authState] || []).map(dt => (
                          <option key={dt} value={dt}>{dt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400">{t.password}</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
                >
                  {t.register}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                {t.alreadyHaveAccount}{" "}
                <button onClick={() => setView("login")} className="text-emerald-500 hover:underline font-bold">
                  {t.login}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: FORGOT / RESET PASSWORD
            ========================================================== */}
        {view === "forgot-password" && (
          <div className="max-w-md mx-auto py-12 animate-fade-in" id="forgot-password-view">
            <div className={`p-8 rounded-3xl border shadow-xl flex flex-col gap-6 text-left ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className="text-center">
                <h3 className="text-2xl font-extrabold tracking-tight">{t.resetPassword}</h3>
                <p className="text-xs text-slate-400 mt-1">Enter your email to recover your civic account</p>
              </div>

              {resetSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs text-center font-semibold">
                  {resetSuccessMsg}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                    }`}
                    placeholder="citizen@sih.gov.in"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
                >
                  Generate New Access Key
                </button>
              </form>

              <button onClick={() => setView("login")} className="text-xs text-slate-400 hover:text-emerald-500 text-center">
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: CITIZEN DASHBOARD (REPORT COMPLAINTS)
            ========================================================== */}
        {view === "citizen-dashboard" && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in" id="citizen-view-container">
            {/* Left Hand: Create Complaint Form */}
            <div className="flex-[4]" id="citizen-form-section">
              <div className={`p-6 rounded-xl border text-left flex flex-col gap-6 ${
                theme === "dark" ? "bg-[#111827] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-500" />
                    {t.reportIssue}
                  </h3>
                  <p className="text-xs text-slate-400">Fields marked * will be routed immediately to matching departmental officer</p>
                </div>

                <form onSubmit={handleComplaintSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400">{t.issueTitle} *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      placeholder="Brief descriptive title (e.g., Deep pothole in front of SBI Dadar)"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400">{t.issueDesc} *</label>
                      <button
                        type="button"
                        onClick={triggerAICategorization}
                        disabled={aiAnalyzing || !formDescription}
                        className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold px-2 py-1 rounded-lg border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                        title="Analyze description to auto-predict category and priority"
                      >
                        <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: aiAnalyzing ? '1s' : '0s' }} />
                        Auto-Predict Category & Priority
                      </button>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      placeholder="Provide precise details of the civic issue. Where exactly is it? How long has this been a problem?"
                    />
                  </div>

                  {aiSuccessMessage && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {aiSuccessMessage}
                    </div>
                  )}

                  {aiDuplicateAlert && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/20 text-xs text-amber-500 font-medium flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>{aiDuplicateAlert}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">{t.category} *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-400">{t.priority} *</label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as ComplaintPriority)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <option value={ComplaintPriority.LOW}>Low</option>
                        <option value={ComplaintPriority.MEDIUM}>Medium</option>
                        <option value={ComplaintPriority.HIGH}>High</option>
                        <option value={ComplaintPriority.CRITICAL}>Critical</option>
                      </select>
                    </div>
                  </div>



                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex flex-col gap-1 col-span-1">
                      <label className="text-xs font-bold text-slate-400">{t.state}</label>
                      <input
                        type="text"
                        readOnly
                        value={formState}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                        placeholder="State"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-1">
                      <label className="text-xs font-bold text-slate-400">{t.district}</label>
                      <input
                        type="text"
                        readOnly
                        value={formDistrict}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                        placeholder="District"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-1">
                      <label className="text-xs font-bold text-slate-400">City / Town</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="City/Town"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-1">
                      <label className="text-xs font-bold text-slate-400">Locality</label>
                      <input
                        type="text"
                        value={formLocality}
                        onChange={(e) => setFormLocality(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="Locality"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-400">{t.pincode} *</label>
                      <input
                        type="text"
                        required
                        value={formPincode}
                        onChange={(e) => setFormPincode(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                        }`}
                        placeholder="600003"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400">{t.landmark}</label>
                    <input
                      type="text"
                      value={formLandmark}
                      onChange={(e) => setFormLandmark(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      placeholder="e.g. opposite Golcha Cinema"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400">{t.address} *</label>
                    <input
                      type="text"
                      required
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                      }`}
                      placeholder="Detailed address line"
                    />
                  </div>

                  {/* Dynamic Evidence Upload with verification check */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400">{t.uploadImages} *</label>
                    <div className="flex flex-wrap gap-3">
                      <label className={`w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                        theme === "dark" ? "border-slate-700 bg-slate-950 hover:border-emerald-500" : "border-slate-300 bg-slate-50 hover:border-emerald-500"
                      }`}>
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Add Photo</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200/25">
                          <img src={img} alt="Evidence preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...formImages];
                              copy.splice(idx, 1);
                              setFormImages(copy);
                              if (idx === 0) setImageVerification(null);
                            }}
                            className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Image Verification Alert */}
                    {imageVerifying && (
                      <div className="p-3 bg-slate-100/10 rounded-xl text-xs flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        Analyzing evidence quality via Gemini Vision Inspector...
                      </div>
                    )}

                    {imageVerification && (
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        imageVerification.valid 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      }`}>
                        <p className="font-extrabold uppercase flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> 
                          {imageVerification.valid ? t.imageValidNotice : t.imageInvalidNotice}
                        </p>
                        <p className="opacity-80 mt-1">{imageVerification.detectedIssue}: {imageVerification.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Anonymous complainant toggle */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 my-2 ${
                    theme === "dark" ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <input
                      type="checkbox"
                      id="anon-check"
                      checked={formAnonymous}
                      onChange={(e) => setFormAnonymous(e.target.checked)}
                      className="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex flex-col text-left">
                      <label htmlFor="anon-check" className="text-sm font-extrabold cursor-pointer">
                        {t.anonymousSubmit}
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {t.anonymousSubmitDesc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer text-sm"
                  >
                    {t.submitIssue}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Hand: Complaint History tracking */}
            <div className="flex-[3] flex flex-col gap-6" id="citizen-history-section">
              <div className={`p-6 rounded-xl border text-left flex flex-col gap-6 ${
                theme === "dark" ? "bg-[#111827] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-500" />
                    {t.myComplaints}
                  </h3>
                  <p className="text-xs text-slate-400">Total submitted issues: {complaints.length}</p>
                </div>

                <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-1">
                  {complaints.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No complaints registered yet. Use the form on left to submit your first civic issue.
                    </div>
                  ) : (
                    complaints.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedComplaint(c)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:border-emerald-500 ${
                          theme === "dark" ? "bg-[#090d16]/60 border-slate-800" : "bg-slate-50 border-slate-200/80 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-emerald-500 font-extrabold uppercase">{c.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === ComplaintStatus.RESOLVED ? "theme-badge-resolved" :
                            c.status === ComplaintStatus.IN_PROGRESS ? "theme-badge-progress" :
                            c.status === ComplaintStatus.ASSIGNED ? "theme-badge-progress" :
                            "theme-badge-pending"
                          }`}>{c.status}</span>
                        </div>
                        <h4 className="text-sm font-bold line-clamp-1">{c.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100/10">
                          <span>{c.category}</span>
                          <span>{new Date(c.submissionTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            VIEW: AUTHORITY DASHBOARD
            ========================================================== */}
        {view === "authority-dashboard" && (() => {
          const authPinCode = user?.email?.replace("authority_", "")?.split("@")?.[0] || "";
          const authComplaints = complaints.filter(c => c.pinCode === authPinCode);
          const totalAuth = authComplaints.length;
          const pendingAuth = authComplaints.filter(c => c.status === ComplaintStatus.SUBMITTED || c.status === ComplaintStatus.SEEN_BY_AUTHORITY).length;
          const inProgressAuth = authComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.UNDER_REVIEW).length;
          const completedAuth = authComplaints.filter(c => c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED).length;
          
          const todayStr = new Date().toISOString().split("T")[0];
          const todayNewAuth = authComplaints.filter(c => c.submissionTime?.startsWith(todayStr)).length;

          return (
            <div className="flex flex-col gap-6 animate-fade-in" id="authority-view-container">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="authority-metrics-grid">
                <div className={`p-5 rounded-xl border border-l-4 text-left transition-all ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-blue-500" : "bg-white border-slate-200 border-l-blue-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total in PIN {authPinCode}</p>
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{totalAuth}</p>
                </div>
                <div className={`p-5 rounded-xl border border-l-4 text-left transition-all ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-amber-500" : "bg-white border-slate-200 border-l-amber-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
                  <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingAuth}</p>
                </div>
                <div className={`p-5 rounded-xl border border-l-4 text-left transition-all ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-cyan-500" : "bg-white border-slate-200 border-l-cyan-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">In Progress</p>
                  <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{inProgressAuth}</p>
                </div>
                <div className={`p-5 rounded-xl border border-l-4 text-left transition-all ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-emerald-500" : "bg-white border-slate-200 border-l-emerald-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Completed</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedAuth}</p>
                </div>
                <div className={`p-5 rounded-xl border border-l-4 text-left transition-all ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-rose-500" : "bg-white border-slate-200 border-l-rose-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Today's New</p>
                  <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{todayNewAuth}</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8" id="authority-main-split">
                {/* Left hand list */}
                <div className="flex-[4] flex flex-col gap-4 text-left" id="authority-list-side">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight">Assigned Area Grievances</h3>
                      <p className="text-xs text-slate-400">Complaints mapped to Area PIN Code: {authPinCode}</p>
                    </div>
                    
                    {/* Local Filtering */}
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <option value="">{t.allStatus}</option>
                        <option value={ComplaintStatus.SUBMITTED}>Submitted</option>
                        <option value={ComplaintStatus.SEEN_BY_AUTHORITY}>Seen By Authority</option>
                        <option value={ComplaintStatus.ASSIGNED}>Assigned</option>
                        <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                        <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredComplaints.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-slate-400 bg-slate-100/5 rounded-2xl border">
                        No complaints currently assigned to your cell.
                      </div>
                    ) : (
                      filteredComplaints.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedComplaint(c);
                            if (!c.seenByAuthority) {
                              fetch(`/api/complaints/${c.id}/seen`, {
                                method: "POST",
                                headers: { "Authorization": `Bearer ${token}` }
                              }).then(() => fetchComplaints());
                            }
                          }}
                          className={`p-5 rounded-xl border cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all ${
                            !c.seenByAuthority ? "border-2 border-amber-500 bg-amber-500/5 shadow-md animate-pulse-subtle" : "opacity-85"
                          } ${
                            theme === "dark" ? "bg-[#111827] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
                          }`}
                          id={`auth-card-${c.id}`}
                        >
                          <div className="flex justify-between items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold">
                              ID: {c.id}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {!c.seenByAuthority && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-rose-500 text-white rounded">NEW</span>
                              )}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                c.status === ComplaintStatus.RESOLVED ? "theme-badge-resolved" :
                                c.status === ComplaintStatus.IN_PROGRESS ? "theme-badge-progress" :
                                c.status === ComplaintStatus.ASSIGNED ? "theme-badge-progress" :
                                "theme-badge-pending"
                              }`}>{c.status}</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-bold line-clamp-1">{c.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                          
                          <div className="flex flex-col gap-1 text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100/10">
                            <div><span className="font-bold text-slate-400">Citizen Name:</span> {c.anonymous ? "Anonymous" : (c.citizenName || "Anonymous")}</div>
                            <div><span className="font-bold text-slate-400">Category:</span> {c.category}</div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                              <span>PIN: {c.pinCode}</span>
                              <span className="font-bold text-rose-500">{c.priority} Priority</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ==========================================================
            VIEW: ADMIN DASHBOARD
            ========================================================== */}
        {view === "admin-dashboard" && (
          <div className="flex flex-col gap-6 animate-fade-in" id="admin-view-container">
            {/* Quick Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="admin-metrics-grid">
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-blue-500" : "bg-white border-slate-200 border-l-blue-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Grievances</p>
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{totalStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-amber-500" : "bg-white border-slate-200 border-l-amber-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Pending</p>
                  <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pendingStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-purple-500" : "bg-white border-slate-200 border-l-purple-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Seen by Authority</p>
                  <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{seenStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-cyan-500" : "bg-white border-slate-200 border-l-cyan-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">In Progress</p>
                  <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{inProgressStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-emerald-500" : "bg-white border-slate-200 border-l-emerald-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Completed</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-rose-500" : "bg-white border-slate-200 border-l-rose-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Resolved Today</p>
                  <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{resolvedTodayStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-indigo-500" : "bg-white border-slate-200 border-l-indigo-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Authorities</p>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{authoritiesStat}</p>
                </div>
                <div className={`p-4 rounded-xl border border-l-4 text-left transition-all hover:scale-[1.02] duration-200 ${theme === "dark" ? "bg-[#111827] border-slate-800 border-l-teal-500" : "bg-white border-slate-200 border-l-teal-500 shadow-sm"}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Citizens</p>
                  <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{citizensStat}</p>
                </div>
              </div>

              {/* Core Recharts Dashboard Charts */}
              {analytics && (
                <AnalyticsCharts
                  byCategory={analytics.byCategory || []}
                  byDistrict={analytics.byDistrict || []}
                  monthlyTrends={analytics.monthlyTrends || []}
                  byPinCode={analytics.byPinCode || []}
                  byPriority={analytics.byPriority || []}
                  dark={theme === "dark"}
                />
              )}

            {/* Split layout: Complaints Moderation + Audit Trail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="admin-action-split">
              
              {/* Complaints list for reassign or moderation */}
              <div className="lg:col-span-2 flex flex-col gap-4" id="admin-table-side">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold">Citizen complaints</h3>
                    <p className="text-xs text-slate-400">Manage, allocate, or block fake spam reports</p>
                  </div>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Reports
                  </button>
                </div>

                {/* Advanced Search & Filtering Console */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 text-left ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`} id="admin-search-filter-console">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Advanced Search & Filtering Console</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    <input
                      type="text"
                      placeholder="Search Citizen Name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Search Department/Dept..."
                      value={searchAuthority}
                      onChange={(e) => setSearchAuthority(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="PIN Code..."
                      value={filterPinCode}
                      onChange={(e) => setFilterPinCode(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <option value="">{t.allStatus}</option>
                      <option value={ComplaintStatus.SUBMITTED}>Submitted</option>
                      <option value={ComplaintStatus.ASSIGNED}>Assigned</option>
                      <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                      <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                      <option value={ComplaintStatus.REJECTED}>Rejected</option>
                    </select>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <option value="">All Categories</option>
                      <option value="Roads & Potholes">Roads & Potholes</option>
                      <option value="Sanitation & Garbage">Sanitation & Garbage</option>
                      <option value="Streetlights & Power">Streetlights & Power</option>
                      <option value="Water Leakage & Sewage">Water Leakage & Sewage</option>
                      <option value="Encroachments & Parking">Encroachments & Parking</option>
                    </select>
                  </div>

                  {/* Archive entry password console */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100/5 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="p-1 rounded bg-amber-500/10 text-amber-500">📂</span>
                      <span>Secure Completed Projects Archive</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="password"
                        placeholder="Archive Master Key"
                        value={archivePassword}
                        onChange={(e) => setArchivePassword(e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleLoadArchive}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Load Secured Archive
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border rounded-xl overflow-hidden ${theme === "dark" ? "border-slate-800 bg-[#111827]" : "border-slate-200 bg-white shadow-sm"}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left" id="admin-complaints-table">
                      <thead className={`font-bold ${theme === "dark" ? "bg-[#1f2937]/50 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">District</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                        {complaints.map(c => (
                          <tr key={c.id} className="hover:bg-slate-500/5 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-emerald-500">{c.id}</td>
                            <td className="px-4 py-3 font-semibold truncate max-w-[120px]" title={c.title}>{c.title}</td>
                            <td className="px-4 py-3 opacity-85">{c.category}</td>
                            <td className="px-4 py-3">{c.district}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                c.status === ComplaintStatus.RESOLVED ? "theme-badge-resolved" :
                                c.status === ComplaintStatus.IN_PROGRESS ? "theme-badge-progress" :
                                c.status === ComplaintStatus.ASSIGNED ? "theme-badge-progress" :
                                "theme-badge-pending"
                              }`}>{c.status}</span>
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <button
                                onClick={() => setSelectedComplaint(c)}
                                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                                title="Inspect or assign department"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSpam(c.id)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                                title="Delete as fake spam report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Audit Logs panel */}
              <div className="flex flex-col gap-4" id="admin-logs-side">
                <div>
                  <h3 className="text-lg font-extrabold">{t.auditLogs}</h3>
                  <p className="text-xs text-slate-400">Immutable operations and ledger transactions</p>
                </div>

                <div className={`p-4 rounded-xl border max-h-[400px] overflow-y-auto flex flex-col gap-4 ${
                  theme === "dark" ? "bg-[#111827] border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
                }`} id="admin-audit-logs">
                  {auditLogs.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-12">No audit logs yet.</div>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="text-xs border-b border-slate-100/5 pb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-500 uppercase text-[9px] tracking-wider">{log.action}</span>
                          <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{log.details}</p>
                        <span className="text-[10px] text-slate-500 block mt-0.5">By: {log.userName}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            OVERLAY PANEL / MODAL: PASSWORD-SECURED COMPLETED PROJECTS ARCHIVE
            ========================================================== */}
        {viewingArchive && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="archive-view-overlay">
            <div className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl p-6 text-left ${
              theme === "dark" ? "bg-[#111827] border-slate-800/80 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`} id="archive-view-modal">
              
              <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-4" id="archive-modal-header">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-amber-500 font-extrabold uppercase bg-amber-500/10 px-2.5 py-1 rounded-full">
                      📂 MASTER KEY SECURED ARCHIVE
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SIH25031 SECURE LEDGER</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold mt-1">Archived Completed Projects</h3>
                </div>
                <button
                  onClick={() => {
                    setViewingArchive(false);
                    setArchivedComplaintsList([]);
                  }}
                  className="px-3 py-1.5 text-xs font-extrabold text-slate-400 hover:text-rose-500 bg-slate-100/10 hover:bg-rose-500/10 rounded-lg transition-all"
                  id="archive-modal-close-btn"
                >
                  Exit Archive
                </button>
              </div>

              {archivedComplaintsList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No completed projects have been moved to the secure archive yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-400">Below is the ledger of all archived and locked civic solutions. These reports are stored on the encrypted blockchain node for compliance audits.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedComplaintsList.map(c => (
                      <div
                        key={c.id}
                        className={`p-5 rounded-xl border ${
                          theme === "dark" ? "bg-slate-900/60 border-slate-800/80" : "bg-slate-50 border-slate-200 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-3">
                          <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
                            ID: {c.id}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 rounded-full">
                            {c.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold line-clamp-1 mb-1">{c.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-3">{c.description}</p>
                        
                        <div className="text-[11px] space-y-1 text-slate-400 pt-3 border-t border-slate-200/10">
                          <div><span className="font-bold text-slate-500">Department:</span> {c.assignedDepartment || "Not Assigned"}</div>
                          <div><span className="font-bold text-slate-500">Citizen:</span> {c.anonymous ? "Anonymous" : (c.citizenName || "Anonymous")}</div>
                          <div><span className="font-bold text-slate-500">Pin Code:</span> {c.pinCode}</div>
                          {c.resolutionRemarks && (
                            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded mt-2">
                              <span className="font-bold text-emerald-500 block text-[10px]">Resolution Remarks:</span>
                              <p className="text-[11px] text-slate-300 line-clamp-2 italic">"{c.resolutionRemarks}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================
            OVERLAY PANEL / MODAL: COMPLAINT DETAILS & INSPECTION
            ========================================================== */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="complaint-detail-overlay">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl p-6 text-left ${
              theme === "dark" ? "bg-[#111827] border-slate-800/80 text-slate-100" : "bg-white border-slate-200 text-slate-800"
            }`} id="complaint-detail-modal">
              
              <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-4" id="modal-header">
                <div>
                  <span className="text-xs font-mono text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    {selectedComplaint.id}
                  </span>
                  <h3 className="text-lg md:text-xl font-extrabold mt-1">{selectedComplaint.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3 py-1.5 text-xs font-extrabold text-slate-400 hover:text-rose-500 bg-slate-100/10 hover:bg-rose-500/10 rounded-lg transition-all"
                  id="modal-close-btn"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="modal-grid">
                
                {/* Details list */}
                <div className="flex flex-col gap-4" id="modal-details-col">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.issueDesc}</h4>
                    <p className="text-sm mt-1 leading-relaxed opacity-90">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3" id="meta-grid">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.category}</h4>
                      <p className="text-xs font-semibold mt-1">{selectedComplaint.category}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.priority}</h4>
                      <p className="text-xs font-bold text-rose-500 mt-1">{selectedComplaint.priority}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Node</h4>
                      <p className="text-xs font-semibold mt-1">{selectedComplaint.assignedDepartment || "Pending Routing"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported By</h4>
                      <p className="text-xs font-semibold mt-1">
                        {selectedComplaint.anonymous ? (
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> {t.anonymousNotice}
                          </span>
                        ) : (
                          selectedComplaint.citizenName || "Citizen"
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.address}</h4>
                    <p className="text-xs font-semibold mt-1 flex items-start gap-1 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{selectedComplaint.address}</span>
                    </p>
                    {selectedComplaint.landmark && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-bold">Landmark: {selectedComplaint.landmark}</p>
                    )}
                  </div>

                  {/* Complaint Status Timeline progress */}
                  <div className="flex flex-col gap-3" id="timeline-box">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.timeline}</h4>
                    <div className="relative pl-4 border-l border-emerald-500/30 flex flex-col gap-4" id="timeline-tree">
                      {selectedComplaint.timeline.map((event, idx) => (
                        <div key={idx} className="relative text-xs">
                          <span className="absolute -left-[20.5px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-500">{event.status}</span>
                            <span className="text-[10px] text-slate-400">By: {event.updatedBy}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{event.remarks}</p>
                          <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Imagery / Video / Resolution Actions */}
                <div className="flex flex-col gap-4" id="modal-actions-col">
                  {selectedComplaint.images.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence Photographs</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedComplaint.images.map((img, idx) => (
                          <div key={idx} className="h-36 rounded-xl overflow-hidden shadow-inner border border-slate-200/10">
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedComplaint.authorityRemarks && (
                    <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/15">
                      <h4 className="text-xs font-bold text-teal-500 uppercase tracking-wider">{t.authorityRemarks}</h4>
                      <p className="text-xs mt-1.5 leading-relaxed">{selectedComplaint.authorityRemarks}</p>
                      
                      {selectedComplaint.resolutionImage && (
                        <div className="h-40 rounded-xl overflow-hidden mt-3 shadow-inner border border-slate-200/15">
                          <img src={selectedComplaint.resolutionImage} alt="Resolution" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Daily Progress updates log */}
                  <div className="p-4 rounded-xl border border-slate-500/10 bg-slate-500/5 mt-2 text-left" id="modal-progress-logs-box">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daily Progress updates log</h4>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                      {(!selectedComplaint.progressLogs || selectedComplaint.progressLogs.length === 0) ? (
                        <p className="text-xs text-slate-500 italic">No progress logs recorded for this grievance.</p>
                      ) : (
                        selectedComplaint.progressLogs.map((log, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-slate-500/10 border border-slate-500/15 text-xs">
                            <div className="flex justify-between items-center font-bold text-slate-400 mb-1">
                              <span>Officer: {log.officerName || "Area Officer"}</span>
                              <span className="font-mono text-[10px]">{log.date} {log.time}</span>
                            </div>
                            <p className="opacity-90">{log.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CONDITIONAL ACTION: Authority update form */}
                  {user && user.role === UserRole.AUTHORITY && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col gap-4 mt-auto">
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Authority Officer Action Panel</h4>
                      
                      {/* ESTIMATED RESOLUTION TIME */}
                      <div className="flex flex-col gap-1 border-b border-emerald-500/10 pb-3 text-left">
                        <label className="text-[11px] text-slate-400 font-bold">Estimated Resolution Time</label>
                        <p className="text-[11px] text-slate-400 italic mb-1">Current: <span className="font-bold text-slate-200">{selectedComplaint.estimatedResolutionTime || "Not estimated yet"}</span></p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g., 2 days, 5 hours"
                            value={estResolutionTime}
                            onChange={(e) => setEstResolutionTime(e.target.value)}
                            className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleSetResolutionTime}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Set
                          </button>
                        </div>
                      </div>

                      {/* DAILY PROGRESS LOG */}
                      <div className="flex flex-col gap-1 border-b border-emerald-500/10 pb-3 text-left">
                        <label className="text-[11px] text-slate-400 font-bold">Post Daily Progress update</label>
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={2}
                            placeholder="Type progress update message (unlimited posts allowed)..."
                            value={dailyProgressMsg}
                            onChange={(e) => setDailyProgressMsg(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddProgressLog}
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Post Progress Update
                          </button>
                        </div>
                      </div>

                      {/* STATUS AND REMARKS FORM */}
                      <form onSubmit={handleStatusUpdateSubmit} className="flex flex-col gap-3 text-left">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-slate-400 font-bold">{t.status}</label>
                          <select
                            value={updateStatus}
                            onChange={(e) => setUpdateStatus(e.target.value as ComplaintStatus)}
                            className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                            <option value={ComplaintStatus.RESOLVED}>Resolved (Issue Solved)</option>
                            <option value={ComplaintStatus.REJECTED}>Rejected (Spam / Fake)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] text-slate-400 font-bold">Action Remarks *</label>
                          <textarea
                            required
                            rows={2}
                            value={updateRemarks}
                            onChange={(e) => setUpdateRemarks(e.target.value)}
                            className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                              theme === "dark" ? "bg-[#090d16] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                            }`}
                            placeholder="What actions were taken? e.g., patch work done on-site"
                          />
                        </div>

                        {/* Resolution image uploader */}
                        {updateStatus === ComplaintStatus.RESOLVED && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] text-slate-400 font-bold">{t.uploadResolutionFile}</label>
                            <input
                              type="text"
                              value={updateResolutionImg}
                              onChange={(e) => setUpdateResolutionImg(e.target.value)}
                              placeholder="Resolution photo URL (e.g. Unsplash resolved site link)"
                              className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                                theme === "dark" ? "bg-[#090d16] border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Publish Action broadcast
                        </button>
                      </form>

                      {/* COMPLETE PROJECT BUTTON */}
                      {selectedComplaint.status !== ComplaintStatus.RESOLVED && selectedComplaint.status !== ComplaintStatus.CLOSED && (
                        <div className="border-t border-emerald-500/10 pt-3">
                          <button
                            type="button"
                            onClick={handleCompleteProject}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-lg text-xs transition-all tracking-wider uppercase shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            ✓ COMPLETE PROJECT
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONDITIONAL ACTION: Admin Department Allocation panel */}
                  {user && user.role === UserRole.ADMIN && (
                    <form onSubmit={handleAdminAssign} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col gap-4 mt-auto">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Admin Department Router</h4>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-slate-400 font-bold">Re-route Department</label>
                        <select
                          value={assignDept}
                          onChange={(e) => setAssignDept(e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <option value="Roads & Highways">Roads & Highways</option>
                          <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                          <option value="Water Supply & Sewage Board">Water Supply & Sewage Board</option>
                          <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                          <option value="Traffic Police Department">Traffic Police Department</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] text-slate-400 font-bold">Escalate Priority</label>
                        <select
                          value={assignPriority}
                          onChange={(e) => setAssignPriority(e.target.value as ComplaintPriority)}
                          className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <option value={ComplaintPriority.LOW}>Low</option>
                          <option value={ComplaintPriority.MEDIUM}>Medium</option>
                          <option value={ComplaintPriority.HIGH}>High</option>
                          <option value={ComplaintPriority.CRITICAL}>Critical</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Update Allocation Mappings
                      </button>

                      {/* ARCHIVE COMPLAINT */}
                      {(selectedComplaint.status === ComplaintStatus.RESOLVED || selectedComplaint.status === ComplaintStatus.CLOSED) && (
                        <div className="border-t border-amber-500/10 pt-3 flex flex-col gap-2 text-left">
                          <label className="text-[11px] text-slate-400 font-bold">📂 Move to Completed Archive</label>
                          <p className="text-[10px] text-slate-500">Only finished projects can be archived. Requires archive master key.</p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="Archive password (7102006)"
                              value={archivePassword}
                              onChange={(e) => setArchivePassword(e.target.value)}
                              className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={handleArchiveComplaintSubmit}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==========================================================
          GLOBAL FOOTER
          ========================================================== */}
      <footer className={`border-t py-8 mt-12 transition-all ${
        theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
      }`} id="global-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4" id="footer-inner">
          <div className="text-left">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> SIH25031 PORTAL LEDGER
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Smart India Hackathon • National Civic Issue Reporting System</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <a href="#" className="hover:text-emerald-500">Security Rules</a>
            <a href="#" className="hover:text-emerald-500">Panchayat Mappings</a>
            <a href="#" className="hover:text-emerald-500">State Bodies Ledger</a>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            &copy; 2026 NIC India • Ministry of Housing and Urban Affairs
          </p>
        </div>
      </footer>
      
    </div>
  );
}
