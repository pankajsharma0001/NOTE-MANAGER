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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col-reverse md:flex-row">
      {note.fileUrl && (
        <div className="flex-1 md:ml-2 md:mr-4 flex">
          <iframe
            src={note.fileUrl}
            width="100%"
            className="flex-1 rounded-xl"
            style={{ border: "none", minHeight: "400px", height: "100%" }}
          ></iframe>
        </div>
      )}

      {/* Right: Note Details (on desktop), top on mobile */}
      <div className="w-full md:w-1/4 bg-gray-800 p-4 rounded-xl shadow-lg flex-shrink-0 mb-4 md:mb-0">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back</span>
        </button>

        <h2 className="text-xl font-semibold mb-4 text-teal-400">Note Details</h2>

        {note.title && (
          <p className="mb-2">
            <span className="font-semibold">Title:</span> {note.title}
          </p>
        )}

        {note.subject && (
          <p className="mb-2">
            <span className="font-semibold">Subject:</span> {note.subject}
          </p>
        )}

        {note.semester && (
          <p className="mb-2">
            <span className="font-semibold">Semester:</span> {note.semester}
          </p>
        )}

        {note.content && (
          <p className="mt-4 text-gray-300">{note.content}</p>
        )}
      </div>
    </div>
  );
}
