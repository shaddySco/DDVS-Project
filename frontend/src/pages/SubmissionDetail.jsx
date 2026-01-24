import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import CommentSection from "../components/CommentSection";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth(); // Axios interceptor handles the token

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [reposting, setReposting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Note: The backend route is usually /submissions/{id} based on api.php
    axios
      .get(`/submissions/${id}`) 
      .then((res) => setSubmission(res.data))
      .catch(err => {
        console.error(err);
        setMessage("Failed to load project data.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      alert("Please connect your wallet to vote.");
      return;
    }

    setVoting(true);
    try {
      // Use the standard endpoint seen in Community.jsx
      const res = await axios.post("/votes", { submission_id: submission.id, type: "up" });
      
      setSubmission(prev => ({
        ...prev,
        total_votes: res.data.total_votes,
        has_voted: true
      }));
      setMessage("Vote cast successfully! +Reputation");
    } catch (err) {
      if (err.response?.status === 409) {
        alert("You have already voted on this submission.");
      } else {
        alert("Voting failed. Ensure you are logged in.");
      }
    } finally {
      setVoting(false);
    }
  };

  const handleRepost = async () => {
    if (!user) return alert("Login to repost");
    setReposting(true);
    try {
      await axios.post(`/submissions/${submission.id}/repost`);
      setSubmission(prev => ({
        ...prev,
        reposts_count: (prev.reposts_count || 0) + 1
      }));
      alert("Reposted to your feed!");
    } catch (err) {
      alert(err.response?.status === 409 ? "Already reposted!" : "Repost failed");
    } finally {
      setReposting(false);
    }
  };

  const renderMedia = () => {
    if (!submission.media_url) return (
      <div className="h-48 md:h-64 bg-slate-900/50 flex items-center justify-center relative overflow-hidden group">
         <div className="text-center opacity-30">
            <div className="text-6xl mb-2">⚡</div>
            <div className="text-sm tracking-widest uppercase">No Visual Signal</div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
      </div>
    );

    const isVid = submission.media_url.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi)/);

    return (
      <div className="h-48 md:h-64 bg-slate-900/50 flex items-center justify-center relative overflow-hidden group">
         {isVid ? (
           <video src={submission.media_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" autoPlay muted loop />
         ) : (
           <img src={submission.media_url} alt="Project Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
      <div className="text-neon-blue animate-pulse text-2xl font-bold tracking-widest uppercase">Initializing Protocol...</div>
      <div className="mt-8 w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <div className="h-full bg-neon-blue absolute animate-progress shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
      </div>
    </div>
  );

  if (!submission) return (
    <div className="min-h-screen pt-32 flex items-center justify-center px-4">
      <div className="glass-panel p-12 text-center max-w-lg border border-red-500/20 shadow-2xl">
        <div className="text-8xl mb-8 animate-bounce">🛡️</div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Signal Lost</h2>
        <p className="text-gray-400 mb-8 leading-relaxed font-medium">This project's data stream has been fragmented or moved to a restricted sector.</p>
        <Link to="/community">
          <Button variant="primary" className="px-10 h-14 rounded-full shadow-neon-blue">Return to Nexus</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      
      {/* 1. HERO HEADER */}
      <div className="relative mb-12 rounded-3xl overflow-hidden glass-panel border-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 mix-blend-overlay"></div>
        
        {renderMedia()}

        <div className="relative z-10 px-8 py-10 -mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
           <div className="flex-1">
             <div className="flex flex-wrap items-center gap-3 mb-6">
               <span className="px-4 py-1 rounded-full bg-neon-blue/20 border-2 border-neon-blue/40 text-neon-blue text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                 {submission.category || "Unclassified"}
               </span>
               <span className={`px-4 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] ${submission.ownership_status === 'verified' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'}`}>
                 {submission.ownership_status === 'verified' ? 'Protocol Verified' : 'Status Pending'}
               </span>
               {submission.transaction_hash && (
                  <span className="px-4 py-1 rounded-full bg-neon-purple/20 border-2 border-neon-purple/40 text-neon-purple text-[10px] font-black uppercase tracking-[0.2em]">On-Chain</span>
               )}
             </div>

             <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-none tracking-tighter drop-shadow-2xl">
               {submission.title}
             </h1>

             <div className="flex items-center gap-4">
               <Link to={`/profile/${submission.user_id}`} className="group/author flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-xl font-bold text-white shadow-lg transition-transform group-hover/author:scale-110 group-hover/author:border-neon-purple">
                   {submission.author?.username?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <span className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-0.5">Architect</span>
                   <span className="text-white font-bold group-hover:text-neon-purple transition-colors">{submission.author?.username || "Anonymous"}</span>
                 </div>
               </Link>
               <div className="h-8 w-px bg-white/10 hidden md:block"></div>
               <div className="hidden md:block">
                  <span className="block text-gray-500 text-[10px] uppercase font-black tracking-widest mb-0.5">Deployment</span>
                  <span className="text-gray-300 font-bold">{submission.created_at}</span>
               </div>
             </div>
           </div>

           <div className="flex flex-col gap-4 shrink-0">
              <a href={submission.repository_url} target="_blank" rel="noreferrer">
                <Button variant="primary" className="w-full md:w-auto px-8 h-14 rounded-2xl flex items-center justify-center gap-3 shadow-neon-blue">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-3-7-3"></path></svg>
                   Access Source Registry
                </Button>
              </a>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* 2. LEFT COLUMN: DETAILS & VERIFICATION */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Description */}
          <div className="glass-panel p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             </div>
             <h3 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-4 uppercase tracking-tighter">Project Brief</h3>
             <p className="text-gray-300 leading-relaxed text-xl whitespace-pre-wrap font-medium">
               {submission.description}
             </p>
          </div>

          {/* Verification Certificate */}
          {submission.ownership_status === "verified" && (
            <div className="relative p-10 rounded-3xl border-2 border-green-500/30 bg-green-900/10 overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.1)]">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
               </div>
               
               <h3 className="text-2xl font-black text-green-400 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                 <span className="p-2 bg-green-500/10 rounded-lg">🛡️</span> On-Chain Authentication
               </h3>
               
               <div className="space-y-6 font-mono text-sm max-w-2xl">
                 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-green-500/10 pb-4">
                   <span className="text-gray-500 uppercase font-black text-xs">Security Status</span>
                   <span className="text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded">DECENTRALIZED_VERIFIED</span>
                 </div>
                 <div className="flex flex-col gap-2 border-b border-green-500/10 pb-4">
                   <span className="text-gray-500 uppercase font-black text-xs">Cryptographic Proof Hash</span>
                   <span className="text-green-300 break-all text-xs opacity-80 leading-loose">{submission.attestation_hash || "NULL_SEC_RECORD"}</span>
                 </div>
                 <div className="flex flex-col md:flex-row md:items-center justify-between">
                   <span className="text-gray-500 uppercase font-black text-xs">Timestamp</span>
                   <span className="text-gray-200 font-black">{submission.verified_at}</span>
                 </div>
               </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="glass-panel p-10">
            <h3 className="text-2xl font-black text-white mb-8 border-b border-white/5 pb-4 uppercase tracking-tighter">Protocol Signals</h3>
            <CommentSection submissionId={id} />
          </div>
        </div>

        {/* 3. RIGHT COLUMN: ACTIONS & STATS */}
        <div className="lg:col-span-1 space-y-8">
           
           {/* Action Card (Upgraded Icons) */}
           <div className="glass-panel p-8 shadow-2xl relative overflow-hidden border-2 border-white/5">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-neon-purple/20 blur-3xl pointer-events-none"></div>
              
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-10 text-center relative z-10">
                Consensus Metrics
              </h3>
              
              <div className="flex justify-center items-baseline gap-3 mb-12 relative z-10">
                <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {submission.total_votes || 0}
                </span>
                <span className="text-neon-gold uppercase text-xs font-black tracking-widest">Votes</span>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8 relative z-10">
                 <Button 
                   variant={submission.has_voted ? "glass" : "primary"} 
                   className={`h-16 rounded-2xl text-lg font-black uppercase transition-all flex items-center justify-center gap-3 ${submission.has_voted ? "border-neon-gold/50 text-neon-gold shadow-[0_0_20px_rgba(255,182,0,0.2)]" : "shadow-neon-blue"}`}
                   onClick={handleVote}
                   disabled={voting || submission.has_voted}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={submission.has_voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5-6 5 6"></path><path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                   {voting ? "Syncing..." : submission.has_voted ? "Validated" : "Upvote"}
                 </Button>

                 <Button 
                   variant="glass" 
                   className="h-16 rounded-2xl text-lg font-black uppercase flex items-center justify-center gap-3 hover:border-neon-purple/50 group"
                   onClick={handleRepost}
                   disabled={reposting}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-neon-purple transition-colors"><path d="m17 2 4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
                   {reposting ? "..." : "Repost"}
                 </Button>
              </div>

              {message && (
                <div className="text-center p-4 rounded-xl bg-neon-blue/10 text-neon-blue text-[10px] font-black uppercase tracking-widest animate-pulse mb-6">
                  {message}
                </div>
              )}
              
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-loose">
                  Governance Protocol <br/> v1.4 // consensus enabled
                </p>
              </div>
           </div>

           {/* Author Stats Mini (Polished) */}
           <div className="glass-panel p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Architect Protocol</h4>
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-xl transition-all group-hover:border-neon-blue group-hover:rotate-6">
                   {submission.author?.username?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <div className="font-black text-white text-xl tracking-tighter mb-1">{submission.author?.username || "Anonymous"}</div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-neon-gold bg-neon-gold/10 px-2 py-0.5 rounded tracking-widest">LVL {Math.floor((submission.author?.xp || 0)/500) + 1}</span>
                      <span className="text-[10px] font-black text-neon-purple uppercase tracking-widest">{submission.author?.developer_type || "Developer"}</span>
                   </div>
                 </div>
              </div>
              
              <Link to={`/profile/${submission.user_id}`} className="block mt-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-neon-purple transition-colors">
                 Access Full Record →
              </Link>
           </div>

        </div>

      </div>
    </div>
  );
}
