import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Image from "next/image";

export default function SharePage() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", show: false });
  const [isDesktop, setIsDesktop] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const contentRef = useRef(null);

  // detect desktop
  useEffect(() => {
    setIsDesktop(!("ontouchstart" in window));
  }, []);

  // prevent default drag-drop behavior (open file)
  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      window.addEventListener(eventName, preventDefaults, false);
    });

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        window.removeEventListener(eventName, preventDefaults, false);
      });
    };
  }, []);

  const semesterMap = {
    1: "first", 2: "second", 3: "third", 4: "fourth",
    5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth",
  };

  const subjectsBySemester = {
    1: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
    2: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
    3: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
    4: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
    5: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
    6: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survery Field Project", "Transportation Engineering II"],
    7: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
    8: ["Elective III", "Internship"],
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "semester") setForm((prev) => ({ ...prev, subject: "" }));
    if (name === "content" && contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setFile(f);
    const fileType = f.type;
    if (fileType.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else if (fileType === "application/pdf") setPreview("/file.svg");
    else setPreview(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    if (!isDesktop) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.semester || !form.subject || !file) {
      showToast("Please fill all required fields and choose a file.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File is too large. Max size is 10MB.", "error");
      return;
    }

    setLoading(true);

    try {
      const isPdf = file.type === "application/pdf";
      const resourceType = isPdf ? "image" : "auto";
      const safeTitle = form.title ? form.title.trim().replace(/[^a-zA-Z0-9-_]/g, "_") : Date.now();
      const publicId = `notes/${safeTitle}-${Date.now()}`;

      // 1. Get signature from backend (now sending expected params)
      const params = new URLSearchParams({ publicId });
      if (isPdf) params.append("format", "pdf");

      const sigRes = await fetch(`/api/share/upload?${params.toString()}`);
      const { signature, timestamp } = await sigRes.json();

      if (!signature) throw new Error("Could not get upload signature");

      // 2. Upload file directly to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      cloudinaryFormData.append("timestamp", timestamp);
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("public_id", publicId);
      if (isPdf) {
        cloudinaryFormData.append("format", "pdf");
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.");
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed");
      }

      // 3. Save to database
      const dbPayload = {
        title: form.title,
        subject: form.subject,
        semester: semesterMap[form.semester],
        content: form.content,
        fileUrl: uploadData.secure_url,
      };

      const res = await fetch("/api/share/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("File submitted successfully!", "success");
        sessionStorage.removeItem("noteCountsCache");
        setForm({ title: "", subject: "", semester: "", content: "" });
        setFile(null);
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(null);
        if (contentRef.current) contentRef.current.style.height = "2.5rem";
      } else showToast(`Upload failed! ${data.error || ""}`, "error");
    } catch (err) {
      showToast(`Upload failed! ${err.message}`, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contentRef.current) contentRef.current.style.height = "2.5rem";
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg">
          {/* Decorative ambient background glows */}
          <div className="absolute -top-8 -right-8 w-72 h-72 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-4 sm:p-5 rounded-2xl shadow-2xl w-full flex flex-col gap-3 relative z-10 animate-fadeInUp"
          >
            <div className="text-center mb-1">
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                Share a Note
              </h1>
            </div>

            {/* Note Title */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Note Title</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Applied Mechanics Chapter 3"
                  className="pl-11 pr-4 py-2 rounded-xl bg-gray-900/60 border border-gray-700/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-full text-white placeholder-gray-500 transition-all duration-200 outline-none"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Semester + Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Semester */}
              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Semester</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <select
                    name="semester"
                    className="pl-11 pr-9 py-2 rounded-xl bg-gray-900/60 border border-gray-700/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-full text-white appearance-none cursor-pointer transition-all duration-200 outline-none"
                    value={form.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="" className="bg-gray-800 text-gray-400">Select Semester</option>
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">
                        Semester {i + 1}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="relative flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Subject</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </span>
                  <select
                    name="subject"
                    className={`pl-11 pr-9 py-2 rounded-xl bg-gray-900/60 border border-gray-700/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-full text-white appearance-none cursor-pointer transition-all duration-200 outline-none ${!form.semester ? "opacity-50 cursor-not-allowed" : ""}`}
                    value={form.subject}
                    onChange={handleChange}
                    disabled={!form.semester}
                    required
                  >
                    <option value="" className="bg-gray-800 text-gray-400">
                      {form.semester ? "Select Subject" : "Select Semester first"}
                    </option>
                    {form.semester &&
                      subjectsBySemester[form.semester].map((subj, idx) => (
                        <option key={idx} value={subj} className="bg-gray-800 text-white">{subj}</option>
                      ))}
                  </select>
                  <span className="absolute right-3.5 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Description (Optional)</label>
              <div className="relative flex items-start">
                <span className="absolute left-3.5 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </span>
                <textarea
                  ref={contentRef}
                  name="content"
                  placeholder="Describe the content of this note..."
                  className="pl-11 pr-4 py-2 rounded-xl bg-gray-900/60 border border-gray-700/60 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 w-full resize-none overflow-hidden text-white placeholder-gray-500 transition-all duration-200 outline-none"
                  style={{ minHeight: "2.5rem" }}
                  value={form.content}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Attachment</label>
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer overflow-hidden group select-none
                    ${dragActive
                      ? "border-teal-400 bg-teal-500/10 scale-[1.02] shadow-[0_0_20px_rgba(20,184,166,0.15)]"
                      : "border-gray-700/80 hover:border-teal-500/60 hover:bg-teal-500/5 hover:shadow-[0_0_15px_rgba(20,184,166,0.05)]"
                    }`}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  <div className="pointer-events-none flex flex-row items-center gap-3">
                    <div className={`p-3 rounded-full transition-all duration-300 ${dragActive ? "bg-teal-500/20 text-teal-300 scale-110" : "bg-gray-800/80 text-gray-400 group-hover:bg-teal-500/10 group-hover:text-teal-400"}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-200">
                        {isDesktop ? "Drag & drop your file here" : "Choose a file to upload"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        PDF, JPEG, PNG, WEBP — max 10 MB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between gap-4 p-4 bg-gray-900/60 rounded-2xl border border-gray-700/50 shadow-inner">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* File Type Badge Icon */}
                    <div className="relative w-14 h-14 flex-shrink-0 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-700/40">
                      {file.type.startsWith("image/") && preview ? (
                        <Image
                          src={preview}
                          alt="Preview"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized={preview.startsWith("blob:")}
                        />
                      ) : file.type === "application/pdf" ? (
                        <div className="flex flex-col items-center justify-center text-red-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[9px] font-extrabold tracking-wider uppercase -mt-0.5">PDF</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-teal-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-[9px] font-extrabold tracking-wider uppercase -mt-0.5">FILE</span>
                        </div>
                      )}
                    </div>
                    {/* File Info */}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-[220px]" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split("/")[1]?.toUpperCase() || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
                      setPreview(null);
                    }}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-red-500/20"
                    title="Remove file"
                  >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white shadow-lg cursor-pointer transform hover:-translate-y-0.5
                ${loading
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 hover:shadow-teal-500/20 shadow-teal-500/10"
                }`}
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {loading ? "Uploading..." : "Share Note"}
            </button>
          </form>

          {/* Toast */}
          {toast.show && (
            <div
              className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-gray-900/90 backdrop-blur-md text-white animate-slideInRight max-w-sm"
              style={{
                borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
                boxShadow: toast.type === "success" ? "0 10px 25px -5px rgba(16, 185, 129, 0.2)" : "0 10px 25px -5px rgba(239, 68, 68, 0.2)"
              }}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                {toast.type === "success" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
