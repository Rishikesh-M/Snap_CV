
import React, { useState, useEffect } from 'react';
import { UserPortfolio, AuthUser } from '../types.ts';
import { db } from '../services/db.ts';

interface PortfolioViewProps {
  portfolio: UserPortfolio;
  onEdit?: () => void;
  currentUser?: AuthUser | null;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'S': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'A': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'B': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio: initialPortfolio, onEdit, currentUser }) => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const isOwner = currentUser && portfolio.userId === currentUser.id;

  const [isFollowing, setIsFollowing] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setIsFollowing(portfolio.internalFollowers?.includes(currentUser.id) || false);
      const myRating = portfolio.ratings?.find(r => r.userId === currentUser.id);
      setUserRating(myRating ? myRating.value : 0);
    }
    setFollowersCount(portfolio.internalFollowers?.length || 0);

    // Calculate average rating
    if (portfolio.ratings && portfolio.ratings.length > 0) {
      const sum = portfolio.ratings.reduce((acc, curr) => acc + curr.value, 0);
      setAverageRating(Math.round((sum / portfolio.ratings.length) * 10) / 10);
    } else {
      setAverageRating(0);
    }
  }, [portfolio, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Please login to follow users.");
      return;
    }
    const updated = await db.toggleFollow(portfolio.id, currentUser.id);
    if (updated) setPortfolio(updated);
  };

  const handleRate = async (value: number) => {
    if (!currentUser) {
      alert("Please login to rate users.");
      return;
    }
    const updated = await db.ratePortfolio(portfolio.id, currentUser.id, value);
    if (updated) setPortfolio(updated);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${portfolio.fullName} - Professional Portfolio`,
      text: `Check out ${portfolio.fullName}'s professional portfolio generated via PortfolioX!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24 space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-10 md:gap-24 text-center md:text-left">
        <div className="flex-1 space-y-6 sm:space-y-8 order-2 md:order-1">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-tight sm:leading-none text-white">
                {portfolio.fullName}
              </h1>
              {/* Rating Display */}
              <div className="flex flex-col items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="text-2xl font-black">{averageRating || '-'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{portfolio.ratings?.length || 0} Ratings</span>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-purple-400 font-semibold tracking-tight">{portfolio.role}</p>
          </div>

          <p className="text-base sm:text-xl text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
            {portfolio.bio}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-8 sm:gap-10 py-2">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">{followersCount}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">App Followers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">{portfolio.stats.repos}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">GH Repos</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">{portfolio.stats.followers}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">GH Followers</div>
            </div>
            {portfolio.grade && (
              <div>
                <div className={`text-3xl sm:text-4xl font-black ${getGradeColor(portfolio.grade).split(' ')[0]}`}>{portfolio.grade}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Grade</div>
              </div>
            )}
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">{portfolio.stats.projectsCount}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Projects</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 pt-4 sm:pt-6">
            {!isOwner && (
              <button
                onClick={handleFollowToggle}
                className={`flex-1 sm:flex-none px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl transition-all ${isFollowing ? 'bg-white/10 text-white border border-white/20' : 'purple-gradient text-white shadow-purple-600/30 hover:scale-[1.03]'}`}
              >
                {isFollowing ? 'Following' : 'Follow +'}
              </button>
            )}

            {/* Rating Interaction */}
            {!isOwner && currentUser && (
              <div className="flex items-center gap-1 bg-white/5 px-4 rounded-xl border border-white/10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={star <= userRating ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={star <= userRating ? "text-amber-400" : "text-slate-600 hover:text-amber-400/50"}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Public Contact Links */}
            {!isOwner && portfolio.contact && (
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {portfolio.contact.email && (
                  <a href={`mailto:${portfolio.contact.email}`} className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-300 transition-all font-bold text-slate-300 text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    Email
                  </a>
                )}
                {portfolio.contact.twitter && (
                  <a href={`https://twitter.com/${portfolio.contact.twitter}`} target="_blank" rel="noreferrer" className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-300 transition-all font-bold text-slate-300 text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                    Twitter
                  </a>
                )}
                {portfolio.contact.linkedin && (
                  <a href={`https://linkedin.com/in/${portfolio.contact.linkedin}`} target="_blank" rel="noreferrer" className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-600/40 hover:text-blue-300 transition-all font-bold text-slate-300 text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                    LinkedIn
                  </a>
                )}
                {portfolio.contact.website && (
                  <a href={portfolio.contact.website.startsWith('http') ? portfolio.contact.website : `https://${portfolio.contact.website}`} target="_blank" rel="noreferrer" className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 transition-all font-bold text-slate-300 text-xs flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                    Website
                  </a>
                )}
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              Share
            </button>
            {isOwner && onEdit && (
              <button
                onClick={onEdit}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-slate-400 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="relative group shrink-0 order-1 md:order-2">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[32px] sm:rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-[32px] sm:rounded-[40px] overflow-hidden border border-white/10 rotate-2 group-hover:rotate-0 transition-transform duration-700">
            <img
              src={portfolio.avatar}
              alt={portfolio.fullName}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
            />
          </div>
        </div>
      </section>

      {/* Grid of Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-12 pt-10">
        <div className="lg:col-span-2 space-y-12 sm:space-y-16">
          {/* Projects */}
          <section className="space-y-8 sm:space-y-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-4">
              Projects
              <span className="h-px flex-1 bg-white/5"></span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {portfolio.projects.map((project) => (
                <div key={project.id} className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all group">
                  <div className="text-[10px] font-black text-purple-500/60 uppercase tracking-widest mb-3">{project.type}</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">{project.name}</h3>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GitHub Repos */}
          <section className="space-y-8 sm:space-y-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-4">
              Open Source
              <span className="h-px flex-1 bg-white/5"></span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {portfolio.githubProjects.map((gp) => (
                <div key={gp.id} className="p-5 sm:p-6 rounded-2xl bg-[#0f172a]/50 border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 group">
                  <div>
                    <h4 className="font-bold text-lg sm:text-xl mb-1 group-hover:text-blue-400 transition-colors">{gp.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{gp.description}</p>
                  </div>
                  <div className="self-start sm:self-center text-[9px] sm:text-[10px] font-black uppercase text-slate-600 border border-white/5 px-3 py-1 rounded-full whitespace-nowrap">{gp.type}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {/* Skills Sidebar */}
          <section className="space-y-8 sticky top-24">
            <div className="bg-glass p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl font-black text-white">Arsenal</h2>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, i) => (
                  <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] sm:text-xs font-bold text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Mastery</h3>
                {portfolio.learningProgress.map((prog, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      <span className="text-slate-400">{prog.label}</span>
                      <span className="text-white">{prog.percentage}%</span>
                    </div>
                    <div className="h-1 sm:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full purple-gradient rounded-full"
                        style={{ width: `${prog.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
