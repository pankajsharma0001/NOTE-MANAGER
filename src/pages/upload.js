import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UploadPage() {
  const { data: session } = useSession();   // ✅ Get session
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // ✅ Send userId to the API
    if (session?.user?.id) {
      formData.append("userId", session.user.id);
    }

    if (file) formData.append("file", file);

    const res = await fetch("/api/share/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(data.success ? "✅ Note uploaded successfully!" : "❌ Upload failed!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 w-96"
      >
        <h1 className="text-2xl font-bold">Upload Note</h1>

        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full p-2 rounded bg-gray-700"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          className="w-full p-2 rounded bg-gray-700"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="semester"
          placeholder="Semester (e.g. first, second)"
          className="w-full p-2 rounded bg-gray-700"
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Description"
          className="w-full p-2 rounded bg-gray-700"
          onChange={handleChange}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full text-gray-300"
        />

        <button
          type="submit"
          className="w-full bg-teal-500 py-2 rounded hover:bg-teal-600 transition"
        >
          Upload
        </button>

        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
}
