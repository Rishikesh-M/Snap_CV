
import React, { useState } from 'react';
import { UserPortfolio, Project } from '../types.ts';

interface PortfolioEditorProps {
    portfolio: UserPortfolio;
    onSave: (updatedPortfolio: UserPortfolio) => void;
    onCancel: () => void;
}

const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ portfolio, onSave, onCancel }) => {
    const [formData, setFormData] = useState<UserPortfolio>({ ...portfolio });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            stats: { ...prev.stats, [name]: parseInt(value) || 0 }
        }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contact: { ...prev.contact, [name]: value }
        }));
    };

    const handleSkillChange = (index: number, value: string) => {
        const newSkills = [...formData.skills];
        newSkills[index] = value;
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const addSkill = () => {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    };

    const removeSkill = (index: number) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    };

    const handleProjectChange = (index: number, field: keyof Project, value: string) => {
        const newProjects = [...formData.projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setFormData(prev => ({ ...prev, projects: newProjects }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-glass p-8 rounded-3xl border border-white/10 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white">Edit Profile</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Section */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Profile Picture</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-dashed border-white/20 group-hover:border-purple-500 transition-colors">
                                    <img
                                        src={formData.avatar || 'https://via.placeholder.com/150'}
                                        alt="Avatar Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none">
                                    <span className="text-[10px] uppercase font-bold text-white">Preview</span>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Image URL</label>
                                    <input
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username.png"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white text-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#0f1219] px-2 text-slate-500">Or upload file</span>
                                    </div>
                                </div>

                                <label className="flex items-center justify-center w-full px-4 py-3 border border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-purple-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                        <span className="text-xs font-bold uppercase tracking-wider">Choose Image File</span>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                                <input
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Stats</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Repos</label>
                                <input
                                    type="number"
                                    name="repos"
                                    value={formData.stats.repos}
                                    onChange={handleStatsChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Followers</label>
                                <input
                                    type="number"
                                    name="followers"
                                    value={formData.stats.followers}
                                    onChange={handleStatsChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Projects Used</label>
                                <input
                                    type="number"
                                    name="projectsCount"
                                    value={formData.stats.projectsCount}
                                    onChange={handleStatsChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.contact?.email || ''}
                                    onChange={handleContactChange}
                                    placeholder="hello@example.com"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Website</label>
                                <input
                                    name="website"
                                    value={formData.contact?.website || ''}
                                    onChange={handleContactChange}
                                    placeholder="https://mysite.dev"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Twitter (X)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-slate-500">@</span>
                                    <input
                                        name="twitter"
                                        value={formData.contact?.twitter || ''}
                                        onChange={handleContactChange}
                                        className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">LinkedIn Username</label>
                                <input
                                    name="linkedin"
                                    value={formData.contact?.linkedin || ''}
                                    onChange={handleContactChange}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <div key={index} className="flex items-center gap-1 bg-white/5 rounded-lg pr-2 overflow-hidden border border-white/10">
                                    <input
                                        value={skill}
                                        onChange={(e) => handleSkillChange(index, e.target.value)}
                                        className="px-3 py-2 bg-transparent outline-none text-sm text-white w-24"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(index)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                            >
                                + Add Skill
                            </button>
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Projects</h3>
                        <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                                <div key={project.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
                                            <input
                                                value={project.name}
                                                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                                            />
                                        </div>
                                        <div className="w-1/3 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                            <input
                                                value={project.type}
                                                onChange={(e) => handleProjectChange(index, 'type', e.target.value)}
                                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                                        <textarea
                                            value={project.description}
                                            onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-white text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            className="flex-1 py-4 purple-gradient rounded-xl font-bold text-white shadow-xl shadow-purple-600/20 hover:scale-[1.01] transition-all"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-4 bg-white/5 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PortfolioEditor;
