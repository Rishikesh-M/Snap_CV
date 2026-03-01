
import React, { useState, useEffect } from 'react';

interface GeneratorFormProps {
  onGenerate: (links: { github: string; linkedin: string; otherLink: string; context?: string }) => void;
  isLoading: boolean;
  initialLinks?: { github: string; linkedin: string; otherLink: string; context?: string };
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, initialLinks }) => {
  const [github, setGithub] = useState(initialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(initialLinks?.linkedin || '');
  const [otherLink, setOtherLink] = useState(initialLinks?.otherLink || '');
  const [context, setContext] = useState(initialLinks?.context || '');

  // Update state if initialLinks change (e.g. when entering edit mode)
  useEffect(() => {
    if (initialLinks) {
      setGithub(initialLinks.github);
      setLinkedin(initialLinks.linkedin);
      setOtherLink(initialLinks.otherLink);
      setContext(initialLinks.context || '');
    }
  }, [initialLinks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ github, linkedin, otherLink, context });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 animate-in zoom-in duration-500">
      <div className="text-center mb-12 space-y-4">
        <div className="text-5xl">🚀</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Portfolio Generator</h1>
        <p className="text-slate-400 text-lg">Create your professional portfolio instantly from your social profiles.</p>
      </div>

      <div className="bg-glass p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex justify-between items-center">
              GitHub Profile URL
              <span className="text-xs font-normal text-slate-500">github.com/username</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/username"
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-700"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex justify-between items-center">
              LinkedIn Profile URL
              <span className="text-xs font-normal text-slate-500">linkedin.com/in/username</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://linkedin.com/in/username"
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-700"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex justify-between items-center">
              Other Link (Portfolio / Blog / Project)
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Optional</span>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
              </span>
              <input
                type="url"
                placeholder="https://your-portfolio.com"
                className="w-full pl-12 pr-4 py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-700 font-medium text-white"
                value={otherLink}
                onChange={(e) => setOtherLink(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 flex justify-between items-center">
              Additional Context (Resume / Bio / Details)
              <span className="text-[10px] font-normal text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Optional</span>
            </label>
            <textarea
              rows={4}
              placeholder="Paste your resume summary, bio, or specific details you want included..."
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-700 resize-none text-sm"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 purple-gradient rounded-xl font-bold text-white shadow-xl shadow-purple-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Synthesizing Profile...' : 'Generate Portfolio'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-slate-600 text-sm">
        PortfolioX uses a semantic parser to intelligently organize your professional identity.
      </p>
    </div>
  );
};

export default GeneratorForm;
