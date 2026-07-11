import React, { useState } from 'react';
import { 
  GraduationCap, Briefcase, DollarSign, Tag as TagIcon, 
  Users, Shield, Menu, X, MessageCircle, UserPlus, 
  Search, Bell, MapPin, Briefcase as WorkIcon, Home, Settings, Eye, EyeOff, LogOut
} from 'lucide-react';
import { Role, UserProfile } from '../types';

interface NavItem {
  label: string;
  view: string;
  icon: any;
  roles: Role[];
}

interface SearchResult {
  type: 'job' | 'member' | 'scholarship';
  id: string;
  title: string;
  subtitle: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: string) => void;
  userRole: Role;
  user: UserProfile;
  isLoggedIn?: boolean;
  onToggleStatus?: () => void;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onNotificationsClick?: () => void;
  searchData?: { jobs: any[]; members: any[]; scholarships: any[] };
  onSearchSelect?: (type: string, id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, userRole, user, isLoggedIn = false, onToggleStatus, onLogout, onLoginClick, onNotificationsClick, searchData, onSearchSelect }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults: SearchResult[] = searchQuery.trim().length < 2 ? [] : [
    ...(searchData?.jobs || [])
      .filter((j: any) => j.title?.toLowerCase().includes(searchQuery.toLowerCase()) || j.company_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((j: any) => ({ type: 'job' as const, id: j.id, title: j.title, subtitle: j.company_name })),
    ...(searchData?.members || [])
      .filter((m: any) => m.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map((m: any) => ({ type: 'member' as const, id: m.uid, title: m.name, subtitle: m.role || 'Member' })),
    ...(searchData?.scholarships || [])
      .filter((s: any) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.provider?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 2)
      .map((s: any) => ({ type: 'scholarship' as const, id: s.id, title: s.name, subtitle: s.provider })),
  ];

  const navItems: NavItem[] = [
    { label: 'Home', view: 'home', icon: Home, roles: [Role.VISITOR, Role.STUDENT, Role.GRADUATE, Role.EMPLOYER, Role.ADMIN] },
    { label: 'Jobs', view: 'jobs', icon: Briefcase, roles: [Role.VISITOR, Role.STUDENT, Role.GRADUATE, Role.EMPLOYER, Role.ADMIN] },
    { label: 'Network', view: 'members', icon: UserPlus, roles: [Role.STUDENT, Role.GRADUATE, Role.EMPLOYER, Role.ADMIN] },
    { label: 'Messages', view: 'messages', icon: MessageCircle, roles: [Role.STUDENT, Role.GRADUATE, Role.EMPLOYER, Role.ADMIN] },
    { label: 'Grants', view: 'scholarships', icon: DollarSign, roles: [Role.STUDENT, Role.GRADUATE, Role.ADMIN] },
    { label: 'Deals', view: 'deals', icon: TagIcon, roles: [Role.STUDENT, Role.GRADUATE, Role.ADMIN] },
    { label: 'Control', view: 'admin', icon: Shield, roles: [Role.ADMIN] },
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="h-24 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between gap-8 w-full">
        <div className="flex items-center gap-8 flex-grow">
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="bg-indigo-600 p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="hidden sm:inline font-serif font-black text-2xl tracking-tight">
              <span className="text-slate-900">Grad</span><span className="text-indigo-600">uate</span>
            </span>
          </div>

          <div className="flex-grow flex items-center relative group max-w-md">
            <Search className="absolute left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={18} />
            <input
              type="text"
              placeholder="Search jobs, people, scholarships..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-200 focus:bg-white transition-all shadow-sm"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onMouseDown={() => {
                      setSearchQuery('');
                      setShowResults(false);
                      if (result.type === 'job') setView('jobs');
                      else if (result.type === 'member') { setView('members'); }
                      else if (result.type === 'scholarship') setView('scholarships');
                      if (onSearchSelect) onSearchSelect(result.type, result.id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0 ${
                      result.type === 'job' ? 'bg-indigo-600' :
                      result.type === 'member' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                      {result.type === 'job' ? 'J' : result.type === 'member' ? 'P' : 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{result.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{result.subtitle} • {result.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50">
                <p className="text-slate-400 text-sm font-medium text-center">No results for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4">
            {visibleNav.map((item) => (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex flex-col items-center justify-center min-w-[76px] h-20 transition-all border-b-4 group relative ${
                  currentView === item.view 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon size={22} className="mb-1 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={onNotificationsClick}
            className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all relative"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div 
            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm cursor-pointer hover:border-indigo-600 transition-colors relative" 
            onClick={() => setView('profile')}
          >
             <img src={user.avatarUrl || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"} className="w-full h-full object-cover" alt="User" />
             <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.activeStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
          </div>
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row w-full px-8">
        <aside className="w-full lg:w-72 pt-8 lg:pt-10 shrink-0">
          <Card className="p-6 sticky top-36">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm cursor-pointer hover:scale-105 transition-transform relative"
                onClick={() => setView('profile')}
              >
                 <img src={user.avatarUrl || "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"} className="w-full h-full object-cover" alt="Avatar" />
                 <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.activeStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 leading-tight truncate">{user.name}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    {user.role === Role.ADMIN ? 'System Admin' : 'Verified'}
                  </p>
                  <button 
                    onClick={onToggleStatus}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                    title={user.activeStatus === 'online' ? "Switch to Offline" : "Switch to Online"}
                  >
                    {user.activeStatus === 'online' ? <Eye size={10} className="text-emerald-500" /> : <EyeOff size={10} className="text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 shrink-0">
                  <WorkIcon size={14} />
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed line-clamp-2">
                  {user.headline || user.role}
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="bg-slate-50 p-1.5 rounded-lg shrink-0">
                  <MapPin size={14} />
                </div>
                <span className="text-xs font-bold text-slate-500">{user.location || "Remote / Global"}</span>
              </div>
            </div>
            <button 
              onClick={() => setView('profile')}
              className="w-full mt-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            >
              My Profile
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full mt-3 py-3 bg-white border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} /> Log Out
              </button>
            )}
          </Card>
        </aside>

        <main className="flex-grow pt-8 lg:pt-10 pb-24 md:pb-12 min-w-0 lg:pl-10">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex flex-col p-8 animate-in fade-in duration-300">
           <div className="flex justify-between items-center mb-12 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-serif font-black text-white">Graduate</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors">
                <X size={32} />
              </button>
           </div>
           <div className="grid sm:grid-cols-2 gap-6 w-full overflow-y-auto">
              {visibleNav.map((item) => (
                <button
                  key={item.view}
                  onClick={() => { setView(item.view); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-6 px-8 py-6 rounded-3xl text-2xl font-serif font-black transition-all ${
                    currentView === item.view 
                      ? 'bg-indigo-600 text-white shadow-2xl' 
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon size={32} />
                  {item.label}
                </button>
              ))}
              <button
                  onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-6 px-8 py-6 rounded-3xl text-2xl font-serif font-black transition-all bg-white/5 text-slate-400 hover:text-white hover:bg-white/10`}
                >
                  <Users size={32} />
                  Profile
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

// Fixed: Added 'id' prop to the Card component interface and applied it to the underlying div element to support anchor linking and selection by ID.
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; id?: string }> = ({ children, className = '', onClick, id }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Tag: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-slate-100 text-slate-600' }) => (
  <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>
    {children}
  </span>
);