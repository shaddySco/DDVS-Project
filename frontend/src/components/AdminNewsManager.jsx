import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';

const AdminNewsManager = () => {
    const [news, setNews] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '', image_url: '', is_published: true });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchNews = async () => {
        try {
            const res = await axios.get('/news'); // This helps seeing what is public, but admin needs ALL news. 
            // Currently our API /news only returns published. Admin might need a separate endpoint or param?
            // For now let's use the public one, or add ?all=true if backend supported it. 
            // The prompt didn't strictly require draft mode, so let's stick to simple CRUD.
            setNews(res.data.data);
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await axios.get('/news');
                if (mounted) setNews(res.data.data);
            } catch (error) {
                console.error("Error fetching news:", error);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`/news/${editId}`, formData);
            } else {
                await axios.post('/news', formData);
            }
            fetchNews();
            resetForm();
        } catch (error) {
            console.error("Error saving news:", error);
            alert("Failed to save news.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this update?")) return;
        try {
            await axios.delete(`/news/${id}`);
            fetchNews();
        } catch (error) {
            console.error("Error deleting news:", error);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            content: item.content,
            image_url: item.image_url || '',
            is_published: item.is_published
        });
        setIsEditing(true);
        setEditId(item.id);
    };

    const resetForm = () => {
        setFormData({ title: '', content: '', image_url: '', is_published: true });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6">{isEditing ? 'Edit Update' : 'Post New Update'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Content</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none h-32"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Image URL (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            className="bg-neon-blue text-black font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-white transition-colors"
                        >
                            {isEditing ? 'Update Post' : 'Publish Update'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-gray-500 hover:text-white"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">History</h3>
                {news.map(item => (
                    <div key={item.id} className="glass-panel p-4 border border-white/5 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">{item.title}</h4>
                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(item)} className="text-xs uppercase bg-white/5 hover:bg-white/10 px-3 py-1 rounded text-white">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-xs uppercase bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded text-red-500">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminNewsManager;
