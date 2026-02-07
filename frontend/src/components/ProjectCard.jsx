import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
    return (
        <Link to={`/project/${project.id}`} className="group/card block">
            <div className="flex flex-col h-full">
                {/* Image Container with Cyberpunk Border */}
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gaming-card border border-glass-stroke group-hover/card:border-neon-blue/50 transition-all duration-500 shadow-lg group-hover/card:shadow-neon-blue mb-6">

                    {/* Image or Placeholder */}
                    {project.media_url ? (
                        <img
                            src={project.media_url}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gaming-card relative">
                            <div className="absolute inset-0 bg-[#050b14] opacity-50"></div>
                            <span className="text-6xl mb-4 opacity-20">⚡</span>
                            <span className="text-xs font-mono uppercase tracking-widest opacity-40">No Signal Data</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-black text-neon-purple shadow-xl uppercase tracking-wider">
                            {project.category || "Uncategorized"}
                        </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex items-center justify-center gap-12 z-10">
                        <div className="flex flex-col items-center gap-2 -translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 delay-75">
                            <span className="text-3xl drop-shadow-neon">⚡</span>
                            <span className="font-mono font-bold text-sm text-neon-gold">{project.total_votes || 0}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 delay-100">
                            <span className="text-3xl">💬</span>
                            <span className="font-mono font-bold text-sm text-white">{project.comments_count || 0}</span>
                        </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                </div>

                {/* Content */}
                <div className="flex items-start justify-between px-2">
                    <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-xl tracking-tight text-white group-hover/card:text-neon-blue transition-colors mb-2 truncate leading-tight">
                            {project.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-[0_0_5px_#BC13FE]"></span>
                            <span className="font-mono text-xs uppercase tracking-wider text-gray-300">
                                {project.author_name || "Anonymous"}
                            </span>
                        </div>
                    </div>

                    {/* ID Hash Decoration */}
                    <div className="hidden md:flex flex-col items-end opacity-30 group-hover:opacity-100 transition-opacity">
                        <span className="font-mono text-[9px] text-neon-blue">#{String(project.id).padStart(4, '0')}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
