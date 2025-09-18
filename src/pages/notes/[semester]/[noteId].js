import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NoteDetail() {
  const router = useRouter();
  const { noteId } = router.query;

  const { data, error } = useSWR(
    noteId ? `/api/notes/${noteId}` : null,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const note = data.data;

  // Build full file URL
  const fileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${note.fileUrl}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <p className="mt-2 text-gray-300">{note.content}</p>

      {note.fileUrl && (
  <div className="mt-6 space-y-4">
    <h2 className="text-lg font-semibold">Preview:</h2>

    <iframe
      src={note.fileUrl}
      width="100%"
      height="600px"
      style={{ border: "none" }}
    ></iframe>

    <a
      href={note.fileUrl}
      download
      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
    >
      Download
    </a>
  </div>
)}

    </div>
  );
}
