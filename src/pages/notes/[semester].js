import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../components/DashboardLayout";

// Subjects by semester
const subjectsBySemester = {
  first: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
  second: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
  third: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
  fourth: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
  fifth: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
  sixth: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survey Field Project", "Transportation Engineering II"],
  seventh: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
  eighth: ["Elective III", "Internship"],
};

export default function Semester() {
  const router = useRouter();
  const { semester, subject } = router.query;
  const { data: session } = useSession();
  const scrollContainerRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [userFavorites, setUserFavorites] = useState([]); // array of noteIds
  const [subjectCounts, setSubjectCounts] = useState({}); // store note count per subject

  // Fetch user favorites
  useEffect(() => {
    fetch("/api/favorites/get")
      .then(res => res.json())
      .then(data => {
        if (data.success) setUserFavorites(data.favorites.map(f => f.noteId));
      });
  }, []);

  // Restore the subject from the URL, or fall back to the first subject.
  useEffect(() => {
    if (!semester || !subjectsBySemester[semester]?.length) return;

    const subjectFromUrl = Array.isArray(subject) ? subject[0] : subject;
    if (subjectFromUrl && subjectsBySemester[semester].includes(subjectFromUrl)) {
      setSelectedSubject(subjectFromUrl);
    } else {
      const fallbackSubject = subjectsBySemester[semester][0];
      setSelectedSubject(fallbackSubject);
      router.replace(
        {
          pathname: router.pathname,
          query: { semester, subject: fallbackSubject },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [semester, subject, router]);

  // Fetch notes for selected subject
  useEffect(() => {
    if (!semester || !selectedSubject) return;

    setLoading(true);
    fetch(`/api/notes?semester=${semester}&subject=${encodeURIComponent(selectedSubject)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotes(data.data);
          // Also update the count for this subject
          setSubjectCounts(prev => ({ ...prev, [selectedSubject]: data.data.length }));
        } else {
          setNotes([]);
          setSubjectCounts(prev => ({ ...prev, [selectedSubject]: 0 }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [semester, selectedSubject]);

  // Optionally fetch all counts in background for the tabs
  useEffect(() => {
    if (!semester || !subjectsBySemester[semester]) return;
    
    // We can fetch all notes for the semester to calculate counts per subject
    fetch(`/api/notes?semester=${semester}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const counts = {};
          subjectsBySemester[semester].forEach(subj => {
            counts[subj] = data.data.filter(n => n.subject === subj).length;
          });
          setSubjectCounts(counts);
        }
      });
  }, [semester]);

  const toggleFavorite = async (noteId) => {
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, semester }),
    });
    const data = await res.json();
    if (data.success) {
      if (userFavorites.includes(noteId)) {
        setUserFavorites(userFavorites.filter(id => id !== noteId));
      } else {
        setUserFavorites([...userFavorites, noteId]);
      }
    }
  };

  const handleVote = async (e, noteId, action) => {
    e.stopPropagation();
    if (!session?.user) {
      alert("Please login to vote");
      return;
    }
    
    try {
      const res = await fetch("/api/notes/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(notes.map(note => {
          if (note._id === noteId) {
            const newUpvotes = data.hasUpvoted 
              ? [...(note.upvotes || []).filter(id => id !== session.user.id), session.user.id]
              : (note.upvotes || []).filter(id => id !== session.user.id);
            
            const newDownvotes = data.hasDownvoted 
              ? [...(note.downvotes || []).filter(id => id !== session.user.id), session.user.id]
              : (note.downvotes || []).filter(id => id !== session.user.id);

            return {
              ...note,
              upvotes: newUpvotes,
              downvotes: newDownvotes
            };
          }
          return note;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectSubject = (nextSubject) => {
    setSelectedSubject(nextSubject);
    router.replace(
      {
        pathname: router.pathname,
        query: { semester, subject: nextSubject },
      },
      undefined,
      { shallow: true }
    );
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (!semester) return <DashboardLayout><p className="p-8 text-white">Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full animate-fadeInUp">
        {/* Header & Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex text-gray-400 text-sm mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/dashboard" className="hover:text-white transition-colors cursor-pointer inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/notes" className="ml-1 hover:text-white transition-colors cursor-pointer md:ml-2">Notes</a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-teal-400 font-medium md:ml-2 capitalize">{semester} Semester</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize">{semester} Semester Notes</h1>
            <button
              onClick={() => router.push('/notes')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm flex items-center shadow"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </button>
          </div>
        </div>

        {/* Subjects Mobile Dropdown & Desktop Horizontal Tabs */}
        
        {/* Mobile Dropdown */}
        <div className="relative mb-6 md:hidden">
          <select
            className="w-full p-3 rounded-xl bg-gray-900 text-gray-300 appearance-none border border-gray-800 shadow-inner focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors font-medium text-sm"
            value={selectedSubject}
            onChange={(e) => selectSubject(e.target.value)}
          >
            {subjectsBySemester[semester]?.map(subj => {
              const count = subjectCounts[subj] !== undefined ? subjectCounts[subj] : '?';
              return (
                <option key={subj} value={subj}>
                  {subj} ({count})
                </option>
              );
            })}
          </select>
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Desktop Horizontal Tabs */}
        <div className="hidden md:block relative mb-6 bg-gray-900 rounded-xl p-2 shadow-inner border border-gray-800">
          {/* Scroll Buttons (Desktop only) */}
          <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
            <button onClick={scrollLeft} className="p-1 bg-gradient-to-r from-gray-900 via-gray-900 to-transparent text-gray-400 hover:text-white h-full px-2 z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
          <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
            <button onClick={scrollRight} className="p-1 bg-gradient-to-l from-gray-900 via-gray-900 to-transparent text-gray-400 hover:text-white h-full px-2 z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto no-scrollbar gap-2 md:px-8 py-1 items-center"
          >
            {subjectsBySemester[semester]?.map(subj => {
              const isSelected = selectedSubject === subj;
              const count = subjectCounts[subj] !== undefined ? subjectCounts[subj] : '?';
              
              return (
                <button
                  key={subj}
                  onClick={() => selectSubject(subj)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 
                    ${isSelected 
                      ? "bg-teal-500 text-gray-900 shadow-md transform scale-105" 
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <span>{subj}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${isSelected ? 'bg-teal-900 text-teal-100' : 'bg-gray-700 text-gray-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Subject Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-teal-400">{selectedSubject}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? (
                <span className="inline-block h-4 w-24 bg-gray-700 rounded animate-shimmer"></span>
              ) : (
                `${notes.length} ${notes.length === 1 ? 'Note' : 'Notes'} Available`
              )}
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min items-start pb-8">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg h-40 flex flex-col justify-between">
                <div className="w-full flex justify-between">
                  <div className="h-5 w-2/3 bg-gray-700 rounded animate-shimmer"></div>
                  <div className="h-5 w-5 bg-gray-700 rounded-full animate-shimmer"></div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-full bg-gray-700 rounded animate-shimmer"></div>
                  <div className="h-4 w-5/6 bg-gray-700 rounded animate-shimmer"></div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="h-6 w-6 bg-gray-700 rounded-full animate-shimmer mr-2"></div>
                  <div className="h-3 w-1/3 bg-gray-700 rounded animate-shimmer"></div>
                </div>
              </div>
            ))
          ) : notes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <h3 className="text-xl font-medium text-gray-300">No notes found</h3>
              <p className="text-gray-500 mt-2">Notes for this subject haven't been uploaded yet.</p>
            </div>
          ) : (
            notes.map((note, index) => {
              const isFav = userFavorites.includes(note._id);
              return (
                <div
                  key={note._id}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl border border-gray-700 shadow-lg hover:shadow-2xl hover:border-teal-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() =>
                    router.push({
                      pathname: `/notes/${semester}/${note._id}`,
                      query: { subject: selectedSubject },
                    })
                  }
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full group-hover:bg-teal-500/20 transition-colors"></div>

                  {/* Favorite toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(note._id);
                    }}
                    className={`absolute top-3 right-3 text-2xl z-10 p-1 rounded-full transition-transform hover:scale-110 focus:outline-none ${isFav ? "text-yellow-400" : "text-gray-500 hover:text-yellow-300"
                      }`}
                  >
                    {isFav ? "★" : "☆"}
                  </button>

                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-teal-400 transition-colors truncate pr-8">
                    {note.title || "Untitled Note"}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {note.content || "No description provided for this note."}
                  </p>
                  
                  {/* Views & Votes */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                    <div className="flex items-center" title="Views">
                      <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {note.views || 0}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleVote(e, note._id, "upvote")} 
                        className={`flex items-center hover:text-teal-400 transition-colors ${note.upvotes?.includes(session?.user?.id) ? 'text-teal-400' : ''}`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2 20h4v-9H2v9zm20-8.5c0-1.1-.9-2-2-2h-6.3l.9-4.2.1-.3c0-.4-.2-.8-.4-1.1L13.2 3l-6.6 6.6c-.4.4-.6.9-.6 1.4v7c0 1.1.9 2 2 2h8.5c.8 0 1.5-.5 1.8-1.2l2.9-6.8c.1-.2.1-.5.1-.7v-1.5z"/></svg>
                        {note.upvotes?.length || 0}
                      </button>
                      <button 
                        onClick={(e) => handleVote(e, note._id, "downvote")} 
                        className={`flex items-center hover:text-red-400 transition-colors ${note.downvotes?.includes(session?.user?.id) ? 'text-red-400' : ''}`}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4h-4v9h4V4zM2 12.5c0 1.1.9 2 2 2h6.3l-.9 4.2-.1.3c0 .4.2.8.4 1.1L10.8 21l6.6-6.6c.4-.4.6-.9.6-1.4v-7c0-1.1-.9-2-2-2H7.5c-.8 0-1.5.5-1.8 1.2l-2.9 6.8c-.1.2-.1.5-.1.7v1.5z"/></svg>
                        {note.downvotes?.length || 0}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-gray-700/50 pt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                    
                    <div className="text-teal-400 text-xs font-medium flex items-center group-hover:translate-x-1 transition-transform">
                      Read
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
