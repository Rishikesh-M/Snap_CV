
import React, { useState, useMemo } from 'react';
import { UserPortfolio, SortOption, DomainFilter, AuthUser } from '../types.ts';

interface DiscoveryGalleryProps {
  portfolios: UserPortfolio[];
  onViewPortfolio: (p: UserPortfolio) => void;
  onDeletePortfolio: (id: string) => void;
  currentUser: AuthUser | null;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'S': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'A': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'B': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};

const DOMAINS: DomainFilter[] = ['All', 'Frontend', 'Backend', 'Full Stack', 'Security', 'AI/ML'];

const DiscoveryGallery: React.FC<DiscoveryGalleryProps> = ({ portfolios, onViewPortfolio, onDeletePortfolio, currentUser }) => {
  const [filter, setFilter] = useState<DomainFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');

  const featuredPortfolio = useMemo(() => {
    return portfolios.length > 0 ? portfolios[0] : null;
  }, [portfolios]);

  const filteredPortfolios = useMemo(() => {
    let result = [...portfolios];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.fullName.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
    }

    if (filter !== 'All') {
      result = result.filter(p => p.domain === filter);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'popularity') return b.stats.followers - a.stats.followers;
      if (sortBy === 'best') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'quiz_points') return (b.quizStats?.points || 0) - (a.quizStats?.points || 0);
      return 0;
    });

    return result;
  }, [portfolios, filter, sortBy, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24 space-y-16 sm:space-y-24">
      {/* Featured Spotlight Section */}
      {!search && filter === 'All' && featuredPortfolio && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-glass rounded-[40px] p-6 sm:p-10 lg:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
              <div className="w-full lg:w-1/3 shrink-0">
                <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-[32px] overflow-hidden border border-white/10 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700 shadow-2xl">
                  <img src={featuredPortfolio.avatar} alt={featuredPortfolio.fullName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">Featured Selection</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/30">Spotlight</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Featured Profile</span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{featuredPortfolio.fullName}</h2>
                  <p className="text-xl text-slate-400 font-medium">{featuredPortfolio.role}</p>
                </div>
                <p className="text-slate-500 max-w-xl leading-relaxed text-sm sm:text-base italic">"{featuredPortfolio.bio}"</p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {featuredPortfolio.skills.map((s, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-slate-400">{s}</span>
                  ))}
                </div>
                <button
                  onClick={() => onViewPortfolio(featuredPortfolio)}
                  className="px-10 py-4 purple-gradient rounded-2xl font-black text-white shadow-xl shadow-purple-600/20 hover:scale-105 transition-all text-sm uppercase tracking-widest"
                >
                  Enter Portfolio
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discovery Header & Filters */}
      <div className="space-y-12">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white">Discover Portfolios</h1>
          <p className="text-lg text-slate-400 font-medium">Browse curated professional identities from across the community.</p>
        </div>

        <div className="flex flex-col gap-6 p-4 sm:p-8 bg-glass rounded-[32px] border border-white/5">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </span>
              <input
                type="text"
                placeholder="Find a developer or role..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium text-white placeholder:text-slate-600 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-slate-300 outline-none cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-widest appearance-none"
              >
                <option value="newest">Latest Added</option>
                <option value="name">A-Z Name</option>
                <option value="popularity">Follower Count</option>
                <option value="best">Highest Rated</option>
                <option value="quiz_points">Best Quizzer</option>
              </select>

              <div className="hidden lg:block h-10 w-px bg-white/10 mx-2"></div>

              <div className="flex gap-2 no-scrollbar overflow-x-auto w-full lg:w-auto">
                {DOMAINS.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setFilter(dom)}
                    className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === dom ? 'purple-gradient text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredPortfolios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPortfolios.map((p, idx) => {
            const isOwner = currentUser && p.userId === currentUser.id;
            const isNew = new Date(p.createdAt).getTime() > Date.now() - 86400000 * 7;

            return (
              <div
                key={p.id}
                className="group relative bg-glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col hover:border-purple-500/30 hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => onViewPortfolio(p)}
              >
                {/* Badges */}
                <div className="absolute top-6 left-6 z-20 flex flex-col items-start gap-2">
                  <div className="flex gap-2">
                    {(p.grade) && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border ${getGradeColor(p.grade)}`}>
                        Grade {p.grade}
                      </span>
                    )}
                    {isNew && (
                      <span className="bg-emerald-500 text-emerald-950 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider">New</span>
                    )}
                    {p.stats.followers > 200 && (
                      <span className="bg-amber-500 text-amber-950 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Trending</span>
                    )}
                  </div>
                  {p.quizStats && p.quizStats.level > 1 && (
                    <span className="bg-purple-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-purple-500/20">
                      Lvl {p.quizStats.level} • {p.quizStats.points} XP
                    </span>
                  )}
                </div>

                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePortfolio(p.id); }}
                    className="absolute top-6 right-6 z-20 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </button>
                )}

                <div className="h-44 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#030712] -mb-32 z-10 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                    <img src={p.avatar} alt={p.fullName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                </div>

                <div className="pt-20 pb-8 px-8 text-center space-y-6 flex-1 flex flex-col items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">{p.fullName}</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{p.role}</p>
                  </div>

                  <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed px-4">
                    {p.bio}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {p.skills.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 border border-white/5">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 mt-auto w-full flex justify-between border-t border-white/5 text-center">
                    <div className="flex-1">
                      <div className="text-xl font-black text-white">{p.stats.repos}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">Repos</div>
                    </div>
                    <div className="w-px bg-white/5 h-8 self-center"></div>
                    <div className="flex-1">
                      <div className="text-xl font-black text-white">{p.stats.followers}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">Followers</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-40 text-center space-y-8 animate-in fade-in zoom-in">
          <div className="text-7xl">🔍</div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Identity Not Found</h3>
            <p className="text-slate-500">We couldn't find any portfolios matching your criteria.</p>
          </div>
          <button
            onClick={() => { setFilter('All'); setSearch(''); }}
            className="px-10 py-4 bg-white/5 rounded-2xl text-purple-400 font-black hover:bg-white/10 transition-all uppercase tracking-widest border border-white/10"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoveryGallery;
