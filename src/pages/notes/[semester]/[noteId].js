import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function NoteDetail() {
  const router = useRouter();
  const { noteId } = router.query;
  const { data: session } = useSession();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (iframeRef.current?.requestFullscreen) {
        iframeRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (error) return <div>Failed to load</div>;
  if (!data || !session) return <div>Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white">
      {/* PDF viewer - full screen on mobile, 3/4 width on desktop */}
      {note.fileUrl && (
        <div className="w-full lg:w-3/4 lg:h-screen flex-shrink-0 relative">
          <iframe
            ref={iframeRef}
            src={note.fileUrl}
            className="w-full h-full min-h-screen lg:min-h-0"
            style={{ border: "none" }}
          ></iframe>
        </div>
      )}

      {/* Details panel - full width below PDF on mobile, side panel on desktop */}
      <div className="w-full lg:w-1/4 bg-gray-800 p-4 lg:overflow-y-auto lg:h-screen flex-1">
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all flex items-center gap-2 justify-center"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Back</span>
          </button>

          {/* Fullscreen button - only visible on desktop */}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:flex px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all items-center gap-2 justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V15a2 2 0 01-2 2h-2.28a1 1 0 01-.956-.692l-1.498-4.493a1 1 0 01.502-1.21l2.257-1.13a11.04 11.04 0 00-5.516-5.516l-1.13 2.257a1 1 0 01-1.21.502l-4.493-1.498A1 1 0 014 9.72V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l4.293 4.293a1 1 0 01-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm12 0a1 1 0 01-1-1h-4a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V4zM4 16a1 1 0 011-1h4a1 1 0 110 2H5.414l4.293 4.293a1 1 0 11-1.414 1.414L4 17.414V16zm12 0a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"/>
              </svg>
            )}
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-4 text-teal-400">Note Details</h2>

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
