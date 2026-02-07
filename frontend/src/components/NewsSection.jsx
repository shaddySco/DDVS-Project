import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { formatDistanceToNow } from 'date-fns';

const NewsSection = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('/news');
                setNews(response.data.data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) return null;
    if (news.length === 0) return null;

    return (
        <div className="mb-32 w-full max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-white/10 flex-1"></div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Protocol Updates</h2>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                    <div key={item.id} className="glass-panel p-6 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></div>
                                <span className="text-xs text-neon-blue font-mono">SYSTEM UPDATE</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">{item.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.content}</p>

                        {item.image_url && (
                            <div className="rounded-lg overflow-hidden h-40 w-full mb-4">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neon-blue to-purple-500"></div>
                            <span className="text-xs text-gray-400">Author: <span className="text-white">{item.author?.username || 'DDVS System'}</span></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsSection;
