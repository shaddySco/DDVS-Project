export const RANKS = [
  { 
    id: 1,
    name: "INITIATE", 
    minXp: 0, 
    icon: "🌱", 
    color: "text-slate-400", 
    bg: "bg-slate-500",
    border: "border-slate-500",
    shadow: "shadow-slate-500/20",
    desc: "Just starting their journey in the decentralized web."
  },
  { 
    id: 2,
    name: "CONTRIBUTOR", 
    minXp: 100, 
    icon: "🔨", 
    color: "text-cyan-400", 
    bg: "bg-cyan-500",
    border: "border-cyan-500",
    shadow: "shadow-cyan-500/20",
    desc: "Active participant verifying projects and building portfolio."
  },
  { 
    id: 3,
    name: "ARCHITECT", 
    minXp: 500, 
    icon: "💠", 
    color: "text-blue-500", 
    bg: "bg-blue-500",
    border: "border-blue-500", 
    shadow: "shadow-blue-500/20",
    desc: "Experienced builder defining the structure of the new web."
  },
  { 
    id: 4,
    name: "GUARDIAN", 
    minXp: 1000, 
    icon: "🛡️", 
    color: "text-purple-500", 
    bg: "bg-purple-500",
    border: "border-purple-500", 
    shadow: "shadow-purple-500/20",
    desc: "Trusted community leader protecting protocol integrity."
  },
  { 
    id: 5,
    name: "TITAN", 
    minXp: 2500, 
    icon: "👑", 
    color: "text-yellow-500", 
    bg: "bg-yellow-500",
    border: "border-yellow-500", 
    shadow: "shadow-yellow-500/40",
    desc: "Legendary developer with immense influence and reputation."
  }
];

export const getRankByXp = (xp) => {
  return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
};

export const getNextRank = (xp) => {
  return RANKS.find(r => r.minXp > xp) || null;
};
