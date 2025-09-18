import { useState } from "react";
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

  // Map numbers to semester strings
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

  // Placeholder for subjects by semester
  const subjectsBySemester = {
    1: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"], // fill your subjects
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

    // Reset subject if semester changes
    if (name === "semester") {
      setForm((prev) => ({ ...prev, subject: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.semester || !form.subject || !file) {
      setMessage("❌ Please fill all required fields and choose a file.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "semester") formData.append(key, semesterMap[form[key]]);
      else formData.append(key, form[key]);
    });
    formData.append("file", file);

    const res = await fetch("/api/share/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) setMessage("✅ File submitted successfully!");
    else setMessage(`❌ Upload failed! ${data.error || ""}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 w-[600px]"
        >
          <h1 className="text-2xl font-bold text-center">Share a Note</h1>

          {/* Row 1: Title + Semester */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="p-2 rounded bg-gray-700 w-full"
              onChange={handleChange}
              required
            />

            <select
              name="semester"
              className="p-2 rounded bg-gray-700 w-full"
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

          {/* Row 2: Subject + Description */}
          <div className="grid grid-cols-2 gap-4">
            <select
              name="subject"
              className={`p-2 rounded bg-gray-700 w-full ${
                !form.semester ? "bg-gray-600 cursor-not-allowed" : ""
              }`}
              onChange={handleChange}
              value={form.subject}
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
              name="description"
              placeholder="Description"
              className="p-2 rounded bg-gray-700 w-full h-[40px]"
              onChange={handleChange}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">Upload File</label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <label
              htmlFor="file"
              className="cursor-pointer px-4 py-2 bg-teal-500 text-gray-900 rounded hover:bg-teal-600 transition block text-center"
            >
              {file ? file.name : "Choose File"}
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Submit
          </button>

          {message && <p className="mt-2 text-center">{message}</p>}
        </form>
      </div>
    </DashboardLayout>
  );
}
