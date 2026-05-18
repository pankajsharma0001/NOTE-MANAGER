import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function BulkUploadPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [form, setForm] = useState({
        subject: "",
        semester: "",
        content: "",
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "", show: false });
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    useEffect(() => {
        setIsDesktop(!("ontouchstart" in window));
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
    };

    const handleFileSelect = (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        const newFiles = Array.from(selectedFiles);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const removeFile = (indexToRemove) => {
        setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.semester || !form.subject || files.length === 0) {
            showToast("Please fill semester, subject and choose files.", "error");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("semester", semesterMap[form.semester]);
        formData.append("subject", form.subject);
        if (form.content) formData.append("content", form.content);

        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch("/api/admin/bulk-upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                showToast("Files bulk-uploaded successfully!", "success");
                sessionStorage.removeItem("noteCountsCache");
                setForm({ subject: "", semester: "", content: "" });
                setFiles([]);
            } else {
                showToast(`Bulk upload failed! ${data.error || ""}`, "error");
            }
        } catch (err) {
            showToast(`Upload failed! ${err.message}`, "error");
        }
        setLoading(false);
    };

    if (status === "loading" || session?.user?.role !== "admin") {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="flex justify-center items-start pt-4 sm:pt-12 px-4 pb-20 md:pb-0">
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-2xl flex flex-col gap-4 relative"
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-teal-400">Admin Bulk Upload directly to Notes</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                            name="semester"
                            className="p-2 rounded bg-gray-700 w-full h-10 text-white"
                            value={form.semester}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Semester</option>
                            {[...Array(8)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} Semester
                                </option>
                            ))}
                        </select>

                        <select
                            name="subject"
                            className={`p-2 rounded bg-gray-700 w-full h-10 text-white ${!form.semester ? "bg-gray-600 cursor-not-allowed" : ""}`}
                            value={form.subject}
                            onChange={handleChange}
                            disabled={!form.semester}
                            required
                        >
                            <option value="">{form.semester ? "Select Subject" : "Select Semester first"}</option>
                            {form.semester &&
                                subjectsBySemester[form.semester].map((subj, idx) => (
                                    <option key={idx} value={subj}>{subj}</option>
                                ))}
                        </select>
                    </div>

                    <textarea
                        name="content"
                        placeholder="General Description for all files (optional)"
                        className="p-2 rounded bg-gray-700 w-full resize-y text-white"
                        rows="3"
                        value={form.content}
                        onChange={handleChange}
                    />

                    {/* Upload area */}
                    <div
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-teal-400 rounded-lg p-6 text-center transition-all cursor-pointer"
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            className="hidden"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                        />
                        <p className="text-gray-400">
                            {isDesktop ? "📂 Click to select multiple files" : "📁 Tap to select multiple files"}
                        </p>
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mt-2 custom-scrollbar pr-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm text-gray-300">
                                    <span className="truncate w-full pr-2">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                        }}
                                        className="text-red-400 hover:text-red-500 font-bold"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-white ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
                            }`}
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        )}
                        {loading ? `Uploading ${files.length} files...` : "Bulk Upload Files"}
                    </button>

                    {/* Toast */}
                    <div
                        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white transition-all duration-500 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            } ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                    >
                        {toast.message}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}