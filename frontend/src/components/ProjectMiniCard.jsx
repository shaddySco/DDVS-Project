import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectMiniCard({ project, icon, color }) {
    const colorMap = {
        'neon-gold': 'text-neon-gold border-neon-gold/30 bg-neon-gold/5 group-hover/mini:bg-neon-gold/10 group-hover/mini:border-neon-gold/50',
        'neon-blue': 'text-neon-blue border-neon-blue/30 bg-neon-blue/5 group-hover/mini:bg-neon-blue/10 group-hover/mini:border-neon-blue/50',
        'neon-purple': 'text-neon-purple border-neon-purple/30 bg-neon-purple/5 group-hover/mini:bg-neon-purple/10 group-hover/mini:border-neon-purple/50',
    };

    const activeColorClass = colorMap[color] || colorMap['neon-blue'];

    return (
        <Link to={`/project/${project.id}`} className="block group/mini h-full">
            <div className="glass-card p-4 flex items-center gap-4 h-full border-white/5 bg-white/[0.02] hover:bg-white/[0.05]">

                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gaming-card shrink-0 border border-white/10 relative group-hover/mini:border-white/30 transition-colors">
                    {project.media_url ? (
                        <img
                            src={project.media_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/mini:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] opacity-30 font-mono font-bold tracking-tighter">
                            NO DATA
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover/mini:text-neon-blue transition-colors mb-1">
                        {project.title}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest bg-white/5 px-1.5 py-0.5 rounded">
                            {project.category?.slice(0, 3)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate">
                            by {project.author_name}
                        </span>
                    </div>
                </div>

                {/* Metric Badge */}
                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border transition-all duration-300 ${activeColorClass}`}>
                    <span className="text-base leading-none mb-0.5">{icon}</span>
                    <span className="font-mono font-bold text-[9px] leading-none">
                        {icon === '⚡' ? project.total_votes : icon === '💬' ? project.comments_count : project.reposts_count}
                    </span>
                </div>
            </div>
        </Link>
    );
}
