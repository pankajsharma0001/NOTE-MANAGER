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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.semester || !file) {
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

          {/* Title + Subject */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="p-2 rounded bg-gray-700 w-full"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              className="p-2 rounded bg-gray-700 w-full"
              onChange={handleChange}
              required
            />
          </div>

          {/* Semester + Description */}
          <div className="grid grid-cols-2 gap-4">
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
