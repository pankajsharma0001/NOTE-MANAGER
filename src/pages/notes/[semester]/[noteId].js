import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NoteDetail() {
  const router = useRouter();
  const { noteId } = router.query;
  const { data: session } = useSession();

  // Fetch note data
  const { data, error } = useSWR(noteId ? `/api/notes/${noteId}` : null, fetcher);
  const note = data?.data;

  // Mark note as read and trigger dashboard refresh
  useEffect(() => {
    if (note && session) {
      fetch("/api/notes/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          noteId: note._id,
          progress: 100,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Notify dashboard to refresh stats
            window.dispatchEvent(new Event("noteRead"));
          }
        })
        .catch(err => console.error("Failed to mark note as read:", err));
    }
  }, [note, session]);

  if (error) return <div>Failed to load</div>;
  if (!data || !session) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* PDF viewer - full width and height on mobile, side by side on desktop */}
      {note.fileUrl && (
        <div className="w-full h-screen lg:h-[calc(100vh-48px)] lg:w-3/4 lg:float-left lg:pr-4 p-0">
          <iframe
            src={note.fileUrl}
            className="w-full h-full"
            style={{ border: "none" }}
          ></iframe>
        </div>
      )}

      {/* Details panel - full width below PDF on mobile, side panel on desktop */}
      <div className="w-full lg:w-1/4 lg:float-left bg-gray-800 p-4 mt-0 lg:mt-0 rounded-xl shadow-lg">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back</span>
        </button>

        <h2 className="text-xl font-semibold mb-4 text-teal-400">Note Details</h2>

        <div className="space-y-2">
          {note.title && (
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold min-w-[100px]">Title:</span>
              <span className="ml-0 sm:ml-2">{note.title}</span>
            </p>
          )}
          {note.subject && (
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold min-w-[100px]">Subject:</span>
              <span className="ml-0 sm:ml-2">{note.subject}</span>
            </p>
          )}
          {note.semester && (
            <p className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold min-w-[100px]">Semester:</span>
              <span className="ml-0 sm:ml-2">{note.semester}</span>
            </p>
          )}
        </div>

        {note.content && (
          <p className="mt-4 text-gray-300 break-words">{note.content}</p>
        )}

        {/* Uploaded by section */}
        {note.uploadedBy && (
          <div className="flex items-center mt-4 border-t border-gray-700 pt-4">
            <Image
              src={note.uploadedBy.image || "/default-avatar.png"}
              alt={note.uploadedBy.name || "User"}
              width={40}
              height={40}
              className="rounded-full mr-2 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-gray-400 text-sm truncate">
                Uploaded by {note.uploadedBy.name || "Unknown"}
              </p>
              {note.uploadedBy.email && (
                <p className="text-gray-500 text-xs truncate">
                  {note.uploadedBy.email}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
