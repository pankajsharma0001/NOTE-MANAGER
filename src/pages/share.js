import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function SharePage() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const descRef = useRef(null);

  const semesterMap = {
    1: "first",
    2: "second",
    3: "third",
    4: "fourth",
    5: "fifth",
    6: "sixth",
    7: "seventh",
    8: "eighth",
  };

  const subjectsBySemester = {
    1: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
    2: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
    3: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
    4: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
    5: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
    6: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survery Field Project", "Transportation Engineering II"],
    7: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
    8: ["Elective III", "Internship"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "semester") setForm((prev) => ({ ...prev, subject: "" }));

    if (name === "description" && descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.semester || !form.subject || !file) {
      setMessage("❌ Please fill all required fields and choose a file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "semester") formData.append(key, semesterMap[form[key]]);
      else formData.append(key, form[key]);
    });
    formData.append("file", file);

    try {
      const res = await fetch("/api/share/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ File submitted successfully!");
        setForm({ title: "", subject: "", semester: "", description: "" });
        setFile(null);
        if (descRef.current) descRef.current.style.height = "2.5rem";
      } else setMessage(`❌ Upload failed! ${data.error || ""}`);
    } catch (err) {
      setMessage(`❌ Upload failed! ${err.message}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (descRef.current) descRef.current.style.height = "2.5rem";
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex justify-center items-start pt-12 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-xl shadow-lg w-[600px] flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-center">Share a Note</h1>

          {/* Title + Semester */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="p-2 rounded bg-gray-700 w-full h-10"
              value={form.title}
              onChange={handleChange}
              required
            />
            <select
              name="semester"
              className="p-2 rounded bg-gray-700 w-full h-10"
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
          </div>

          {/* Subject + Description */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="subject"
              className={`p-2 rounded bg-gray-700 w-full h-10 ${!form.semester ? "bg-gray-600 cursor-not-allowed" : ""}`}
              value={form.subject}
              onChange={handleChange}
              disabled={!form.semester}
              required
            >
              <option value="">
                {form.semester ? "Select Subject" : "Select Semester first"}
              </option>
              {form.semester &&
                subjectsBySemester[form.semester].map((subj, idx) => (
                  <option key={idx} value={subj}>
                    {subj}
                  </option>
                ))}
            </select>

            <textarea
              ref={descRef}
              name="description"
              placeholder="Description"
              className="p-2 rounded bg-gray-700 w-full resize-none overflow-hidden transition-all duration-200"
              style={{ minHeight: "2.5rem" }}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* File Upload */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex gap-2">
              <input
                type="file"
                id="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <label
                htmlFor="file"
                className={`cursor-pointer px-4 py-2 rounded text-center transition-transform duration-200 ${
                  file ? "bg-teal-600 text-white scale-105" : "bg-teal-500 text-gray-900 hover:bg-teal-600"
                }`}
              >
                {file ? file.name : "Choose File"}
              </label>
            </div>

            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
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
            {loading ? "Uploading..." : "Submit"}
          </button>

          {message && <p className="mt-2 text-center">{message}</p>}
        </form>
      </div>
    </DashboardLayout>
  );
}
