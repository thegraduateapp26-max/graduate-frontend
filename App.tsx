import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Layout, Card, Tag } from './components/Layout';
import { Role, UserProfile, VerificationStatus, Job, Scholarship, Story, Deal, Company, Review, PortfolioLink, Project, Endorsement, Thread, Message, JobAlert } from './types';
import { MOCK_JOBS, MOCK_SCHOLARSHIPS, MOCK_STORIES, MOCK_DEALS, DETAILED_MAJORS, MOCK_COMPANIES, MOCK_MEMBERS, MOCK_THREADS, ALL_LOCATIONS } from './constants';
import { 
  Search, Briefcase, MapPin, DollarSign, Heart, ExternalLink, 
  ChevronRight, Sparkles, MessageSquare, ArrowRight, Star, 
  Trash2, Plus, Clock, Globe, Filter, X, Tag as TagIcon, Send,
  TrendingUp, Bookmark, Calendar, Share2, ChevronDown, BookOpen,
  Building2, ArrowLeft, ShieldCheck, Mail, FileText, Lock, CheckCircle2, AlertCircle, GraduationCap,
  Github, Linkedin, Link as LinkIcon, Quote, LayoutGrid, MessageCircle, UserPlus, Zap, BadgeCheck, ShieldAlert,
  Wrench, Layers, Award, Users, GraduationCap as GrantIcon, Camera, Save, Info, Shield, HelpCircle, Accessibility, Bell, BellRing, Eye, EyeOff, Scale, Image as ImageIcon, Copy, Settings as SettingsIcon, History, Gift, HeartPulse, User, LogOut, Edit3, Check, RefreshCw
} from 'lucide-react';
import { getCareerAdvice, summarizeStory, getSmartReplies } from './services/geminiService';
import { fetchJobs, fetchScholarships, fetchUsers, createScholarship, deleteScholarship, login, signup, logout, updateUser, applyToJob, fetchMyApplications, type ApiJob, type ApiScholarship, type ApiUser, type ApiApplication } from './services/apiService';
import { AuthPage } from './components/AuthPage';

type InfoSection = 'about' | 'guidelines' | 'privacy' | 'help' | 'accessibility';

const POPULAR_KEYWORDS = [
  'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 
  'Frontend Developer', 'Cybersecurity', 'Machine Learning', 'Marketing Intern'
];

const App: React.FC = () => {
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get('view') || 'home'); 
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'portfolio' | 'projects' | 'endorsements' | 'skills' | 'alerts' | 'settings'>('portfolio');
  const [activeInfoSection, setActiveInfoSection] = useState<InfoSection | null>(null);
  const [isSharingStory, setIsSharingStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [newStoryForm, setNewStoryForm] = useState({ title: '', content: '' });

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifications = [
    { id: '1', title: 'New Connection', description: 'Sarah Chen sent you a message.', time: '2m ago', icon: MessageSquare },
    { id: '2', title: 'Job Match', description: 'New Software Engineer role matches your profile.', time: '1h ago', icon: Briefcase },
    { id: '3', title: 'Intelligence Update', description: 'Your profile verification is now complete.', time: '5h ago', icon: ShieldCheck },
  ];

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<Partial<UserProfile>>({});
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // AI Mentor State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuestionInput, setAiQuestionInput] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Job search enhancement states
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobLocationQuery, setJobLocationQuery] = useState('');
  const [jobAudienceFilter, setJobAudienceFilter] = useState<'all' | 'students' | 'graduates' | 'both'>('all');
  const [jobMajorFilter, setJobMajorFilter] = useState('All Majors');
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Job and Company detail states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [myApplications, setMyApplications] = useState<ApiApplication[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Employer Posting state
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [postJobError, setPostJobError] = useState<string | null>(null);
  const [newJobForm, setNewJobForm] = useState<Partial<Job>>({
    title: '',
    company_name: '',
    remote_type: 'remote',
    city: '',
    state: '',
    salary: '',
    description_detail: '',
    skills: [],
    qualifications: [],
  });

  // Admin CRUD State
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [scholarshipForm, setScholarshipForm] = useState<Partial<Scholarship>>({
    name: '',
    provider: '',
    amount_display: '',
    eligible_levels: ['Undergraduate'],
    deadline: Date.now() + 86400000 * 30,
    application_url: '',
    featured: false
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('graduate_token'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('graduate_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatarUrl === '__local__') {
          parsed.avatarUrl = localStorage.getItem('graduate_avatar') || '';
        }
        return parsed;
      }
    } catch {}
    return {
      uid: '',
      name: '',
      email: '',
      role: Role.GRADUATE,
      headline: '',
      isVerified: false,
      status: VerificationStatus.PENDING,
      activeStatus: 'online',
      major: '',
      school: '',
      skills: [],
      savedItems: [],
      location: '',
      avatarUrl: '',
      backgroundUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=400&fit=crop',
      portfolioLinks: [],
      projects: [],
      endorsements: [],
    };
  });

  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [scholarships, setScholarships] = useState<Scholarship[]>(MOCK_SCHOLARSHIPS);
  const [members, setMembers] = useState<UserProfile[]>(MOCK_MEMBERS);

  // Load real data from backend
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [apiJobs, apiScholarships, apiUsers] = await Promise.all([fetchJobs(), fetchScholarships(), fetchUsers()]);
        if (apiJobs.length > 0) {
          const mapped: Job[] = apiJobs.map((j: ApiJob) => ({
            id: j.id, company_id: j.id, title: j.title, company_name: j.company,
            logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(j.company)}&background=6366f1&color=fff&size=100`,
            remote_type: (j.jobType?.toLowerCase().includes('remote') ? 'remote' : j.jobType?.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite') as 'remote' | 'hybrid' | 'onsite',
            city: j.location?.split(',')[0]?.trim() || j.location || 'Remote',
            state: j.location?.split(',')[1]?.trim() || '',
            target_audience: 'both' as const,
            createdAt: j.createdAt ? new Date(j.createdAt).getTime() : Date.now(),
            skills: j.tags || [], status: j.isActive ? 'open' as const : 'closed' as const,
            salary: j.salaryRange || '', description_detail: j.description || '',
            qualifications: [], target_majors: ['All Majors'],
          }));
          setJobs(mapped);
        }
        if (apiScholarships.length > 0) {
          const mapped: Scholarship[] = apiScholarships.map((s: ApiScholarship) => ({
            id: s.id, name: s.title, provider: s.provider,
            amount_display: typeof s.amount === 'number' ? `$${s.amount.toLocaleString()}` : String(s.amount),
            deadline: s.deadline ? new Date(s.deadline).getTime() : Date.now() + 86400000 * 30,
            eligible_levels: s.tags || ['Undergraduate'], application_url: s.url || '', featured: false,
          }));
          setScholarships(mapped);
        }
        // Map backend users to frontend UserProfile shape
        if (apiUsers.length > 0) {
          const mappedMembers = apiUsers.map((u: ApiUser) => ({
            uid: u.id,
            name: u.name,
            email: '',
            role: (u.role as any) || Role.GRADUATE,
            headline: u.role.charAt(0).toUpperCase() + u.role.slice(1),
            isVerified: u.verificationStatus === 'approved',
            status: u.verificationStatus as any,
            activeStatus: 'offline' as const,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=200`,
            savedItems: [],
            skills: [],
            portfolioLinks: [],
            projects: [],
            endorsements: [],
          }));
          setMembers(mappedMembers);
        }
      } catch (err) {
        console.error('Failed to load backend data, falling back to mock data:', err);
      }
    };
    loadBackendData();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setMyApplications([]);
      return;
    }
    fetchMyApplications().then(setMyApplications).catch(err => console.error('Failed to load applications:', err));
  }, [isLoggedIn]);

  const handleApply = async (jobId: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setApplyingJobId(jobId);
    try {
      await applyToJob(jobId);
      const apps = await fetchMyApplications();
      setMyApplications(apps);
    } catch (err) {
      console.error('Failed to apply to job:', err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const [stories, setStories] = useState<Story[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowJobSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedProfile = useMemo(() => {
    if (viewedProfileId) return members.find(m => m.uid === viewedProfileId) || user;
    return user;
  }, [viewedProfileId, members, user]);

  const filteredMembers = useMemo(() => {
    const query = memberSearchQuery.toLowerCase().trim();
    const baseList = members.filter(m => m.uid !== user.uid);
    if (!query) return baseList;
    return baseList.filter(m => m.name.toLowerCase().includes(query) || (m.headline || '').toLowerCase().includes(query));
  }, [members, memberSearchQuery, user.uid]);

  const filteredJobsList = useMemo(() => {
    const keywordQuery = jobSearchQuery.toLowerCase().trim();
    const locationQuery = jobLocationQuery.toLowerCase().trim();
    
    return jobs.filter(job => {
      const matchesKeyword = !keywordQuery || 
        job.title.toLowerCase().includes(keywordQuery) || 
        job.company_name.toLowerCase().includes(keywordQuery) ||
        job.skills.some(s => s.toLowerCase().includes(keywordQuery));
        
      const matchesLocation = !locationQuery || 
        job.city.toLowerCase().includes(locationQuery) || 
        job.state.toLowerCase().includes(locationQuery) ||
        job.remote_type.toLowerCase().includes(locationQuery);

      const matchesAudience = jobAudienceFilter === 'all' || 
        job.target_audience === jobAudienceFilter || 
        job.target_audience === 'both';

      const matchesMajor = jobMajorFilter === 'All Majors' || 
        job.target_majors.some(m => m === jobMajorFilter || m === 'All Majors');

      return matchesKeyword && matchesLocation && matchesAudience && matchesMajor;
    });
  }, [jobs, jobSearchQuery, jobLocationQuery, jobAudienceFilter, jobMajorFilter]);

  const recommendedJobs = useMemo(() => {
    if (!user.major) return jobs.slice(0, 4);
    return jobs.filter(job => 
      job.target_majors.some(m => m === user.major || m === 'All Majors')
    ).slice(0, 4);
  }, [jobs, user.major]);

  const jobSuggestions = useMemo(() => {
    const query = jobSearchQuery.toLowerCase().trim();
    const suggestions: { type: 'keyword' | 'location', label: string }[] = [];
    
    if (query.length > 0) {
      POPULAR_KEYWORDS.filter(k => k.toLowerCase().includes(query)).forEach(k => suggestions.push({ type: 'keyword', label: k }));
      ALL_LOCATIONS.filter(l => l.toLowerCase().includes(query)).forEach(l => suggestions.push({ type: 'location', label: l }));
    } else {
      POPULAR_KEYWORDS.slice(0, 3).forEach(k => suggestions.push({ type: 'keyword', label: k }));
      ALL_LOCATIONS.slice(0, 2).forEach(l => suggestions.push({ type: 'location', label: l }));
    }
    
    return suggestions.slice(0, 6);
  }, [jobSearchQuery]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [activeThreadId, threads]);

  const activeThread = useMemo(() => threads.find(t => t.id === activeThreadId), [threads, activeThreadId]);
  const activePartner = useMemo(() => members.find(m => m.uid === activeThread?.participantId), [members, activeThread]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeThreadId) return;
    const newMessage: Message = { id: Math.random().toString(36).substr(2, 9), senderId: user.uid, text: messageInput, timestamp: Date.now() };
    setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: [...t.messages, newMessage], lastMessage: messageInput, timestamp: Date.now() } : t));
    setMessageInput('');
  };

  const startChatWithMember = (member: UserProfile) => {
    const existingThread = threads.find(t => t.participantId === member.uid);
    if (existingThread) { setActiveThreadId(existingThread.id); } 
    else {
      const newThread: Thread = { id: Math.random().toString(36).substr(2, 9), participantId: member.uid, lastMessage: 'Chat started', timestamp: Date.now(), unread: false, messages: [] };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    }
    setView('messages');
  };

  const openProfile = (memberId: string | null) => { setViewedProfileId(memberId); setView('profile'); window.scrollTo(0, 0); };

  const handleAiMentorSubmit = async () => {
    if (!aiQuestionInput.trim()) return;
    setIsAiLoading(true);
    setIsAiModalOpen(false);
    const result = await getCareerAdvice(user.role, aiQuestionInput);
    setAiAdvice(result);
    setIsAiLoading(false);
    setAiQuestionInput('');
    setTimeout(() => {
      document.getElementById('ai-advice-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleToggleStatus = () => setUser(prev => ({ ...prev, activeStatus: prev.activeStatus === 'online' ? 'offline' : 'online' }));

  const handleAuthSuccess = (userId: string, token: string, name?: string, role?: string) => {
    const freshUser = {
      uid: userId,
      name: name || '',
      email: '',
      headline: role ? role.charAt(0).toUpperCase() + role.slice(1) : '',
      avatarUrl: '',
      role: role === 'admin' ? Role.ADMIN :
        role === 'employer' ? Role.EMPLOYER :
        role === 'student' ? Role.STUDENT :
        role === 'professor' ? Role.PROFESSOR :
        role === 'recruiter' ? Role.RECRUITER :
        Role.GRADUATE,
      isVerified: false,
      status: VerificationStatus.PENDING,
      activeStatus: 'online' as const,
      major: '',
      school: '',
      skills: [],
      savedItems: [],
      location: '',
      backgroundUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=400&fit=crop',
      portfolioLinks: [],
      projects: [],
      endorsements: [],
    };
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setUser(freshUser);
    setView('home');
    try { localStorage.setItem('graduate_user', JSON.stringify(freshUser)); } catch {}
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.reload();
  };

  const handleSubmitStory = () => {
    if (!newStoryForm.title.trim() || !newStoryForm.content.trim()) return;
    const newStory: Story = {
      id: Math.random().toString(36).substr(2, 9),
      title: newStoryForm.title,
      subtitle: newStoryForm.content.substring(0, 100).replace(/\n/g, ' ') + '...',
      hero_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=center',
      featured: false,
      author: user.name,
      createdAt: Date.now(),
      content: newStoryForm.content
    };
    setStories(prev => [newStory, ...prev]);
    setNewStoryForm({ title: '', content: '' });
    setIsSharingStory(false);
  };

  const handleOpenJobDetail = (job: Job) => {
    setSelectedJob(job);
  };

  const handlePostJob = () => {
    const { title, company_name, description_detail, city, state, salary } = newJobForm;
    
    if (!title || !company_name || !description_detail || !city || !state || !salary) {
      setPostJobError("Required fields missing: Title, Company Name, City, State, Salary, and Description are mandatory.");
      return;
    }

    const job: Job = {
      id: Math.random().toString(36).substr(2, 9),
      company_id: user.company || 'c4', 
      company_name: company_name || user.name || 'Your Company',
      logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      title: title || '',
      remote_type: (newJobForm.remote_type as any) || 'remote',
      city: city || '',
      state: state || '',
      salary: salary || '',
      description_detail: description_detail || '',
      createdAt: Date.now(),
      skills: newJobForm.skills || [],
      qualifications: newJobForm.qualifications || [],
      status: 'open',
      target_audience: 'both',
      target_majors: ['All Majors'],
    };

    setJobs(prev => [job, ...prev]);
    setShowPostJobModal(false);
    setPostJobError(null);
    setNewJobForm({
      title: '', company_name: '', remote_type: 'remote', city: '', state: '', salary: '', description_detail: '', skills: [], qualifications: [],
    });
    setView('jobs');
  };

  // Admin Actions
  const handleApproveUser = (uid: string) => {
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, isVerified: true, status: VerificationStatus.APPROVED } : m));
    if (user.uid === uid) setUser(prev => ({ ...prev, isVerified: true, status: VerificationStatus.APPROVED }));
  };

  const handleRejectUser = (uid: string) => {
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, isVerified: false, status: VerificationStatus.REJECTED } : m));
    if (user.uid === uid) setUser(prev => ({ ...prev, isVerified: false, status: VerificationStatus.REJECTED }));
  };

  const handleToggleJobActive = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: j.status === 'open' ? 'closed' : 'open' } : j));
  };

  const handleDeleteScholarship = async (id: string) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await deleteScholarship(id);
        setScholarships(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        setScholarships(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const handleOpenEditScholarship = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setScholarshipForm({ ...scholarship });
    setShowScholarshipModal(true);
  };

  const handleSaveScholarship = async () => {
    if (!scholarshipForm.name || !scholarshipForm.provider) {
      alert('Name and Provider are required');
      return;
    }
    if (editingScholarship) {
      // For now just update locally - full edit API can be added later
      setScholarships(prev => prev.map(s => s.id === editingScholarship.id ? { ...s, ...scholarshipForm } as Scholarship : s));
    } else {
      try {
        const res = await createScholarship({
          title: scholarshipForm.name || '',
          provider: scholarshipForm.provider || '',
          amount: scholarshipForm.amount_display,
          deadline: scholarshipForm.deadline ? new Date(scholarshipForm.deadline).toISOString().split('T')[0] : undefined,
          url: scholarshipForm.application_url,
          tags: [],
        });
        const newS: Scholarship = {
          id: res.scholarship_id,
          ...scholarshipForm as Scholarship,
        };
        setScholarships(prev => [newS, ...prev]);
      } catch (err) {
        const newS: Scholarship = {
          id: Math.random().toString(36).substr(2, 9),
          ...scholarshipForm as Scholarship,
        };
        setScholarships(prev => [newS, ...prev]);
      }
    }
    setShowScholarshipModal(false);
    setEditingScholarship(null);
  };

  // Image Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, [type === 'avatar' ? 'avatarUrl' : 'backgroundUrl']: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEditing = () => {
    setProfileFormData({ ...user });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    const updated = { ...user, ...profileFormData };
    delete (updated as any)._skillInput;
    setUser(updated);
    try {
      // Store avatar separately due to size, store rest of profile without it
      if (updated.avatarUrl && updated.avatarUrl.startsWith('data:')) {
        localStorage.setItem('graduate_avatar', updated.avatarUrl);
      }
      const toStore = { ...updated, avatarUrl: updated.avatarUrl?.startsWith('data:') ? '__local__' : updated.avatarUrl };
      localStorage.setItem('graduate_user', JSON.stringify(toStore));
    } catch {}
    setIsEditingProfile(false);

    if (updated.uid) {
      updateUser(updated.uid, {
        name: updated.name,
        headline: updated.headline,
        school: updated.school,
        major: updated.major,
        location: updated.location,
        skills: updated.skills,
        avatarUrl: updated.avatarUrl,
      }).catch(err => console.error('Failed to save profile to server:', err));
    }
  };

  const renderJobs = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b-2 border-slate-100 pb-10">
        <h2 className="text-4xl font-serif font-black text-slate-900 mb-4">Career Intelligence</h2>
        <p className="text-slate-500 text-lg font-medium">Precision matched roles for verified graduates.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="text" placeholder="Keyword, Skill, Title..." className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 focus:border-indigo-600 transition-all shadow-sm outline-none" value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} />
           </div>
           <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="text" placeholder="Location or Remote..." className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 focus:border-indigo-600 transition-all shadow-sm outline-none" value={jobLocationQuery} onChange={(e) => setJobLocationQuery(e.target.value)} />
           </div>
           <div className="relative">
              <select className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-900 focus:border-indigo-600 outline-none appearance-none cursor-pointer" value={jobAudienceFilter} onChange={(e) => setJobAudienceFilter(e.target.value as any)}>
                <option value="all">All Audiences</option>
                <option value="students">For Students</option>
                <option value="graduates">For Graduates</option>
                <option value="both">Open to Both</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
           </div>
           <div className="relative">
              <select className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-4 font-black uppercase tracking-widest text-[10px] text-slate-900 focus:border-indigo-600 outline-none appearance-none cursor-pointer" value={jobMajorFilter} onChange={(e) => setJobMajorFilter(e.target.value)}>
                <option value="All Majors">Any Major</option>
                {DETAILED_MAJORS.flatMap(cat => cat.subcategories).filter(m => m !== 'All Majors').map(major => <option key={major} value={major}>{major}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
           </div>
        </div>
        {(user.role === Role.EMPLOYER || user.role === Role.ADMIN) && (
          <button onClick={() => { setShowPostJobModal(true); setPostJobError(null); }} className="mt-6 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all flex items-center gap-3 shadow-2xl active:scale-95">
            <Plus size={20}/> Post Executive Mandate
          </button>
        )}
      </div>

      {/* Recommended Section - Only show when not searching */}
      {!jobSearchQuery && !jobLocationQuery && jobAudienceFilter === 'all' && jobMajorFilter === 'All Majors' && recommendedJobs.length > 0 && (
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
            <Zap className="text-amber-500" size={24} /> Precision Matched for you
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedJobs.map(job => (
              <Card key={`rec-${job.id}`} onClick={() => handleOpenJobDetail(job)} className="p-6 group hover:border-indigo-600 transition-all border-2 border-transparent">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                    <img src={job.logo_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{job.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{job.city}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
           {jobSearchQuery || jobLocationQuery !== '' || jobAudienceFilter !== 'all' || jobMajorFilter !== 'All Majors' ? <Filter size={24} /> : <Layers size={24} />}
           {jobSearchQuery || jobLocationQuery !== '' || jobAudienceFilter !== 'all' || jobMajorFilter !== 'All Majors' ? "Filtered Results" : "Explore Active Roles"}
        </h3>
        {filteredJobsList.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredJobsList.map(job => (
              <Card key={job.id} onClick={() => handleOpenJobDetail(job)} className={`p-8 group hover:border-indigo-600 transition-all border-2 ${job.status === 'closed' ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-transparent'}`}>
                <div className="flex gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-50 shrink-0 shadow-sm">
                    <img src={job.logo_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{job.company_name}</span>
                      <Tag color={job.status === 'closed' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}>{job.status === 'closed' ? 'Closed' : job.remote_type}</Tag>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-600"/> {job.city}, {job.state}</span>
                      <span className="flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-500"/> {job.salary}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center">
             <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-8 shadow-inner"><Search size={48}/></div>
             <h3 className="text-3xl font-serif font-black text-slate-900 mb-4">No matching roles found</h3>
             <button onClick={() => { setJobSearchQuery(''); setJobLocationQuery(''); setJobAudienceFilter('all'); setJobMajorFilter('All Majors'); }} className="mt-10 px-10 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-100">Clear filters</button>
          </div>
        )}
      </section>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-16 animate-in fade-in duration-500">
      <div className="border-b-2 border-slate-100 pb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-black text-slate-900">Admin Command Center</h2>
          <p className="text-slate-500 text-lg font-medium">Global oversight and platform intelligence management.</p>
          <div className="flex gap-6 mt-6">
            <div className="bg-indigo-50 px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total Members</p>
              <p className="text-2xl font-black text-indigo-600">{members.length}</p>
            </div>
            <div className="bg-emerald-50 px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Active Jobs</p>
              <p className="text-2xl font-black text-emerald-600">{jobs.length}</p>
            </div>
            <div className="bg-amber-50 px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Scholarships</p>
              <p className="text-2xl font-black text-amber-600">{scholarships.length}</p>
            </div>
            <div className="bg-rose-50 px-6 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Pending</p>
              <p className="text-2xl font-black text-rose-600">{members.filter(m => m.status === VerificationStatus.PENDING).length}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setShowScholarshipModal(true); setEditingScholarship(null); setScholarshipForm({ name: '', provider: '', amount_display: '', eligible_levels: ['Undergraduate'], deadline: Date.now(), application_url: '', featured: false }); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
            <Plus size={18}/> New Scholarship
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Pending Verifications */}
        <section className="space-y-8">
           <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest"><ShieldCheck className="text-indigo-600" /> Member Pipeline</h3>
           <div className="space-y-4">
              {members.filter(m => m.status === VerificationStatus.PENDING).map(m => (
                <Card key={m.uid} className="p-8 flex items-center justify-between group hover:border-indigo-200 transition-all">
                   <div className="flex items-center gap-6">
                      <img src={m.avatarUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                      <div>
                         <h4 className="font-black text-slate-900">{m.name}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.role} • {m.major}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => handleApproveUser(m.uid)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Approve"><Check size={20}/></button>
                      <button onClick={() => handleRejectUser(m.uid)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Reject"><X size={20}/></button>
                   </div>
                </Card>
              ))}
              {members.filter(m => m.status === VerificationStatus.PENDING).length === 0 && (
                <div className="p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending submissions</div>
              )}
           </div>
        </section>

        {/* System Jobs Overview */}
        <section className="space-y-8">
           <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest"><Briefcase className="text-indigo-600" /> Active Mandates</h3>
           <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
              {jobs.map(j => (
                <Card key={j.id} className="p-6 flex items-center justify-between border-2 border-transparent">
                   <div className="flex items-center gap-4 min-w-0">
                      <img src={j.logo_url} className="w-12 h-12 rounded-xl object-cover grayscale opacity-50" />
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 text-sm truncate">{j.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{j.company_name} • {j.city}</p>
                      </div>
                   </div>
                   <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleToggleJobActive(j.id)} className={`p-2 rounded-lg transition-all ${j.status === 'open' ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`} title={j.status === 'open' ? 'Close Post' : 'Reopen Post'}>
                        {j.status === 'open' ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                      <button onClick={() => handleOpenJobDetail(j)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"><ExternalLink size={16}/></button>
                   </div>
                </Card>
              ))}
           </div>
        </section>
      </div>

      {/* Scholarship Management */}
      <section className="space-y-8">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest"><GrantIcon className="text-indigo-600" /> Funding Repositories</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scholarships.map(s => (
            <Card key={s.id} className={`p-8 flex flex-col h-full border-2 ${s.featured ? 'border-indigo-100 bg-indigo-50/5' : 'border-transparent'}`}>
              <div className="flex justify-between items-start mb-6">
                <Tag color="bg-emerald-50 text-emerald-700">{s.amount_display}</Tag>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEditScholarship(s)} className="p-2 bg-white text-slate-400 rounded-lg hover:text-indigo-600 transition-colors shadow-sm"><Edit3 size={16}/></button>
                  <button onClick={() => handleDeleteScholarship(s.id)} className="p-2 bg-white text-slate-400 rounded-lg hover:text-rose-600 transition-colors shadow-sm"><Trash2 size={16}/></button>
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-lg leading-tight mb-2 truncate" title={s.name}>{s.name}</h4>
              <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-6 truncate">{s.provider}</p>
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${s.featured ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s.featured ? 'Featured' : 'Standard'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(s.deadline).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const renderHome = () => {
    const featured = stories.find(s => s.featured) || stories[0];
    const otherStories = stories.length > 1 ? stories.filter(s => s.id !== featured?.id).slice(0, 3) : [];
    const topJobs = jobs.slice(0, 3);
    const topGrants = scholarships.slice(0, 4);

    return (
      <div className="space-y-16 animate-in fade-in duration-700">
        <div className="grid lg:grid-cols-3 gap-12">
          {featured ? (
            <>
              <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-[3rem] h-[550px] shadow-2xl border border-slate-100" onClick={() => setSelectedStory(featured)}>
                <img src={featured.hero_image_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-slate-900/40 to-transparent flex flex-col justify-end p-12">
                  <span className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] w-fit mb-6">Featured Story</span>
                  <h1 className="text-5xl font-serif font-black text-white leading-[1.1] mb-6">{featured.title}</h1>
                  <p className="text-white/80 text-xl font-medium max-w-xl mb-10">{featured.subtitle}</p>
                  <div className="flex items-center text-white font-black text-xs uppercase tracking-widest gap-3 bg-white/10 w-fit px-10 py-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">Read Full Article <ArrowRight size={18} /></div>
                </div>
              </div>
              <Card className="p-10 flex flex-col h-full overflow-hidden border-2 border-slate-50">
                <h2 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-3 mb-8">
                  <TrendingUp size={24} className="text-indigo-600" /> Hot Positions
                </h2>
                <div className="divide-y divide-slate-100 flex-grow">
                  {topJobs.map(job => (
                    <div key={job.id} className="py-6 cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => handleOpenJobDetail(job)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{job.company_name}</span>
                        <Tag color="bg-emerald-50 text-emerald-700">Live</Tag>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-slate-400 text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest mt-2"><MapPin size={12}/> {job.city}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setView('jobs')} className="w-full mt-6 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Browse Full Board</button>
              </Card>
            </>
          ) : (
            <>
              <div className="lg:col-span-2 relative overflow-hidden rounded-[3rem] h-[550px] shadow-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col justify-end p-12">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                <div className="relative z-10">
                  <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] w-fit mb-6 inline-block">Welcome to Graduate</span>
                  <h1 className="text-5xl font-serif font-black text-white leading-[1.1] mb-6">Your Career & Education Hub</h1>
                  <p className="text-white/80 text-xl font-medium max-w-xl mb-10">Connect with employers, find scholarships, and build your professional network.</p>
                  <button onClick={() => setShowAuthModal(true)} className="flex items-center text-white font-black text-xs uppercase tracking-widest gap-3 bg-white/10 w-fit px-10 py-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-indigo-600 transition-all">
                    Get Started <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <Card className="p-10 flex flex-col h-full overflow-hidden border-2 border-slate-50">
                <h2 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-3 mb-8">
                  <TrendingUp size={24} className="text-indigo-600" /> Hot Positions
                </h2>
                <div className="divide-y divide-slate-100 flex-grow">
                  {topJobs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium text-sm">No jobs posted yet.</div>
                  ) : topJobs.map(job => (
                    <div key={job.id} className="py-6 cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => handleOpenJobDetail(job)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{job.company_name}</span>
                        <Tag color="bg-emerald-50 text-emerald-700">Live</Tag>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-slate-400 text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest mt-2"><MapPin size={12}/> {job.city}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setView('jobs')} className="w-full mt-6 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Browse Full Board</button>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-10">
          <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-black text-slate-900">Community Insights</h2>
              <p className="text-slate-500 text-lg font-medium">Share your journey and inspire others in the Graduate network.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card onClick={() => setIsSharingStory(true)} className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-indigo-100 bg-indigo-50/10 group hover:border-indigo-600 hover:bg-white transition-all text-center min-h-[350px]">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6 shadow-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Plus size={40} /></div>
              <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">Share your story</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">Inspire the community with your academic and professional milestones.</p>
              <button className="mt-8 text-[11px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-3 group-hover:gap-5 transition-all">Write Submission <ArrowRight size={16}/></button>
            </Card>
            {stories.length === 0 && (
              <div className="col-span-3 flex items-center justify-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">No stories yet</p>
                  <p className="text-slate-500 text-sm font-medium">Be the first to share your journey with the Graduate community!</p>
                </div>
              </div>
            )}
            {otherStories.map(story => (
              <Card key={story.id} className="flex flex-col group cursor-pointer overflow-hidden min-h-[350px] border-2 border-slate-50" onClick={() => setSelectedStory(story)}>
                <div className="h-48 overflow-hidden relative">
                   <img src={story.hero_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-4">
                    <Tag color="bg-indigo-50 text-indigo-600">{story.author}</Tag>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-serif font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{story.title}</h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-3 mt-auto leading-relaxed">{story.subtitle}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                 <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><GrantIcon size={24} /></div>
                 <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-widest">Global Academic Funding</h2>
              </div>
              <button onClick={() => setView('scholarships')} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">View All Opportunities <ChevronRight size={16} /></button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topGrants.map(s => (
                <div key={s.id} className="bg-white p-7 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer" onClick={() => setView('scholarships')}>
                   <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate mb-1.5">{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{s.provider}</p>
                   </div>
                   <div className="text-emerald-600 font-black text-lg ml-6 shrink-0">{s.amount_display}</div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 rounded-[4rem] p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16 shadow-2xl">
           <div className="relative z-10 space-y-8 max-w-3xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 text-indigo-400 font-black text-xs uppercase tracking-[0.5em]"><Sparkles size={24} /> Professional Intelligence</div>
              <h2 className="text-6xl font-serif font-black leading-[1.1]">Consult with Gemini <br/>Career Intelligence.</h2>
              <p className="text-slate-400 text-2xl font-medium leading-relaxed">Leverage advanced reasoning for interview strategies, salary negotiations, and navigating specialized job markets.</p>
              <button onClick={() => setIsAiModalOpen(true)} className="px-14 py-7 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-white hover:text-indigo-900 transition-all shadow-2xl active:scale-95 flex items-center gap-5 mx-auto md:mx-0">
                {isAiLoading ? "Processing Signal..." : "Consult AI Mentor"} <ArrowRight size={24} />
              </button>
           </div>
        </div>

        {aiAdvice && (
          <Card id="ai-advice-card" className="border-l-[20px] border-indigo-600 p-12 bg-white animate-in slide-in-from-left-20 duration-1000 shadow-2xl">
             <div className="flex items-start gap-12">
               <div className="bg-indigo-50 p-8 rounded-[3rem] text-indigo-600 shrink-0 shadow-sm"><MessageSquare size={56} /></div>
               <div className="space-y-6">
                 <h3 className="font-black text-slate-900 uppercase tracking-[0.4em] text-xs">Intelligence Feed</h3>
                 <p className="text-slate-800 text-3xl font-medium italic font-serif leading-relaxed">"{aiAdvice}"</p>
                 <button onClick={() => setIsAiModalOpen(true)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline flex items-center gap-2">Ask a follow up <ArrowRight size={14}/></button>
               </div>
             </div>
          </Card>
        )}

        <div className="border-t border-slate-200 pt-10 mt-20 grid grid-cols-1 md:grid-cols-3 items-center gap-10">
          <div className="flex items-center justify-center md:justify-start gap-3 shrink-0">
            <div className="bg-slate-900 p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-serif font-black text-2xl tracking-tight text-slate-900">
              Graduate
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 lg:gap-x-12 gap-y-4">
            {[
              { id: 'about', label: 'About' },
              { id: 'guidelines', label: 'Community Guidelines' },
              { id: 'privacy', label: 'Privacy & Terms' },
              { id: 'help', label: 'Help Center' },
              { id: 'accessibility', label: 'Accessibility' },
            ].map(section => (
              <button key={section.id} onClick={() => setActiveInfoSection(section.id as InfoSection)} className="text-[12px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-indigo-600 transition-colors whitespace-nowrap">{section.label}</button>
            ))}
          </div>
          <div className="hidden md:block" /> 
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'home': return renderHome();
      case 'jobs': return renderJobs();
      case 'admin': return renderAdmin();
      case 'scholarships': return (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="border-b-2 border-slate-100 pb-10">
            <h2 className="text-4xl font-serif font-black text-slate-900">Grants & Scholarships</h2>
            <p className="text-slate-500 text-lg font-medium">Global funding opportunities for academic and research excellence.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {scholarships.map(s => (
              <Card key={s.id} className="p-10 flex flex-col group relative overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                   <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-xl shadow-sm">{s.amount_display}</div>
                   <p className="text-sm font-black text-slate-900 flex items-center gap-2"><Calendar size={14} className="text-indigo-600" /> {new Date(s.deadline).toLocaleDateString()}</p>
                </div>
                <h3 className="text-2xl font-serif font-black text-slate-900 mb-2 leading-tight">{s.name}</h3>
                <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2"><Building2 size={12}/> {s.provider}</p>
                <div className="flex flex-wrap gap-2 mb-10">
                   {s.eligible_levels.map(level => <Tag key={level} color="bg-slate-50 text-slate-600">{level}</Tag>)}
                </div>
                <button onClick={() => alert(`Initializing application for ${s.name}...`)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Start Application</button>
              </Card>
            ))}
          </div>
        </div>
      );
      case 'deals': return (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="border-b-2 border-slate-100 pb-10">
            <h2 className="text-4xl font-serif font-black text-slate-900">Member Perks</h2>
            <p className="text-slate-500 text-lg font-medium">Exclusive discounts for our student and graduate network.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-indigo-50 w-24 h-24 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-sm">
              <Gift size={48} />
            </div>
            <h3 className="text-3xl font-serif font-black text-slate-900 mb-4">Perks Coming Soon</h3>
            <p className="text-slate-500 font-medium text-lg max-w-md leading-relaxed">
              We're partnering with companies to bring exclusive deals and discounts to Graduate members. Check back soon!
            </p>
          </div>
        </div>
      );
      case 'profile': return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
          <input type="file" className="hidden" ref={avatarInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
          <input type="file" className="hidden" ref={backgroundInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />
          <Card className="relative overflow-hidden bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-2xl">
            <div className="h-64 sm:h-80 w-full relative overflow-hidden">
               <img src={displayedProfile.backgroundUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop"} className="w-full h-full object-cover" alt="Background" />
               {displayedProfile.uid === user.uid && (
                  <button onClick={() => backgroundInputRef.current?.click()} className="absolute bottom-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"><ImageIcon size={20} /></button>
               )}
            </div>
            <div className="px-12 pb-12 pt-0 -mt-20 relative z-10 flex flex-col items-center md:items-start">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-10 w-full">
                  <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl relative shrink-0">
                    <img src={displayedProfile.avatarUrl} className="w-full h-full object-cover" />
                    {displayedProfile.uid === user.uid && (
                      <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center text-white cursor-pointer"><Camera size={32} /></div>
                    )}
                  </div>
                  <div className="flex-grow text-center md:text-left pb-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                      <h1 className="text-5xl font-serif font-black text-slate-900 tracking-tight">{displayedProfile.name}</h1>
                      {displayedProfile.isVerified && <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><BadgeCheck size={20}/></div>}
                    </div>
                    <p className="text-2xl font-medium text-slate-600 max-w-2xl leading-relaxed">{displayedProfile.headline}</p>
                  </div>
                  <div className="flex gap-4 pb-4">
                     {displayedProfile.uid === user.uid ? (
                       <button onClick={handleStartEditing} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3"><SettingsIcon size={16}/> Edit Intelligence</button>
                     ) : (
                       <>
                         <button onClick={() => startChatWithMember(displayedProfile)} className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl active:scale-95 flex items-center gap-3"><MessageCircle size={16}/> Connect</button>
                         <button onClick={() => { navigator.share({ title: displayedProfile.name, url: window.location.href }).catch(() => alert('Copied profile link!')) }} className="p-4 bg-slate-100 text-slate-400 rounded-[1.5rem] hover:text-indigo-600 transition-all"><Share2 size={20}/></button>
                       </>
                     )}
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-slate-100 pt-10">
                  <div className="space-y-8">
                     <section>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2"><Info size={14}/> Vital Credentials</h4>
                        <div className="space-y-5">
                           <div className="flex items-center gap-4 text-slate-600"><div className="p-3 bg-slate-50 rounded-xl text-indigo-600"><GraduationCap size={18}/></div><div><p className="text-xs font-black text-slate-900">{displayedProfile.school || "Global Collective"}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Institution</p></div></div>
                           <div className="flex items-center gap-4 text-slate-600"><div className="p-3 bg-slate-50 rounded-xl text-indigo-600"><Award size={18}/></div><div><p className="text-xs font-black text-slate-900">{displayedProfile.major || "Advanced Studies"}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization</p></div></div>
                           <div className="flex items-center gap-4 text-slate-600"><div className="p-3 bg-slate-50 rounded-xl text-indigo-600"><MapPin size={18}/></div><div><p className="text-xs font-black text-slate-900">{displayedProfile.location || "Remote"}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Base</p></div></div>
                        </div>
                     </section>
                     {displayedProfile.skills && displayedProfile.skills.length > 0 && (
                        <section>
                           <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2"><Wrench size={14}/> Core Intelligence</h4>
                           <div className="flex flex-wrap gap-2">
                              {displayedProfile.skills.map(skill => <Tag key={skill} color="bg-indigo-50 text-indigo-700">{skill}</Tag>)}
                           </div>
                        </section>
                     )}
                  </div>
                  <div className="md:col-span-2 space-y-8">
                    <section>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2"><LayoutGrid size={14}/> High-Impact Projects</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {displayedProfile.projects?.filter(p => p.title && p.title.trim() !== '').map(project => (
                             <div key={project.id} className="group rounded-[2rem] overflow-hidden border-2 border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 transition-all p-4">
                                {project.imageUrl && !project.imageUrl.startsWith('data:') && (
                                <div className="h-40 rounded-2xl overflow-hidden mb-4 relative">
                                   <img src={project.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                     onError={(e) => { (e.target as HTMLImageElement).closest('.h-40')?.remove(); }} />
                                   {project.tags && project.tags.length > 0 && <div className="absolute top-3 right-3"><Tag color="bg-white/80 backdrop-blur-md text-indigo-600">{project.tags[0]}</Tag></div>}
                                </div>
                                )}
                                <h5 className="font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{project.title}</h5>
                                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">{project.description}</p>
                                <a href={project.link} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View Repository <ExternalLink size={12}/></a>
                             </div>
                          ))}
                          {(!displayedProfile.projects || displayedProfile.projects.length === 0) && (
                             <div className="col-span-2 p-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No public projects documented</div>
                          )}
                       </div>
                    </section>

                    {/* My Applications */}
                    {displayedProfile.uid === user.uid && (
                      <section className="mt-8 space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2"><FileText size={14}/> My Applications</h4>
                        {myApplications.length > 0 ? (
                          <div className="space-y-3">
                            {myApplications.map(app => (
                              <div key={app.id} className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <h5 className="font-black text-slate-900 truncate">{app.job?.title}</h5>
                                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate">{app.job?.company}{app.job?.location ? ` • ${app.job.location}` : ''}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                </div>
                                <Tag color={app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : app.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}>{app.status}</Tag>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No applications yet</div>
                        )}
                      </section>
                    )}

                    {/* Endorsements */}
                    {displayedProfile.endorsements && displayedProfile.endorsements.length > 0 && (
                      <section className="mt-8 space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2"><Quote size={14}/> Endorsements</h4>
                        {displayedProfile.endorsements.map(e => (
                          <div key={e.id} className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100">
                            <div className="flex items-center gap-4 mb-3">
                              {e.avatarUrl && <img src={e.avatarUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />}
                              <div>
                                <p className="font-black text-slate-900 text-sm">{e.fromName}</p>
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{e.relationship}</p>
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{e.text}"</p>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Write Endorsement - professors only */}
                    {displayedProfile.uid !== user.uid && user.role === Role.PROFESSOR && (
                      <section className="mt-6">
                        <button
                          onClick={() => {
                            const text = prompt('Write your endorsement for ' + displayedProfile.name + ':');
                            if (text && text.trim()) {
                              const newEndorsement: Endorsement = {
                                id: Math.random().toString(36).substr(2, 9),
                                fromName: user.name || 'Professor',
                                relationship: 'Professor',
                                text: text.trim(),
                                avatarUrl: user.avatarUrl,
                              };
                              setMembers(prev => prev.map(m =>
                                m.uid === displayedProfile.uid
                                  ? { ...m, endorsements: [...(m.endorsements || []), newEndorsement] }
                                  : m
                              ));
                            }
                          }}
                          className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14}/> Write Endorsement
                        </button>
                      </section>
                    )}
                  </div>
               </div>
            </div>
          </Card>
        </div>
      );
      case 'members': return (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between border-b-2 border-slate-100 pb-10">
            <div className="space-y-4 flex-grow"><h2 className="text-4xl font-serif font-black text-slate-900">Member Directory</h2><p className="text-slate-500 text-lg font-medium">Connect with verified peers and global industry mentors.</p></div>
            <div className="w-full md:w-96 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search global network..." className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-medium text-slate-900 focus:border-indigo-600 shadow-sm" value={memberSearchQuery} onChange={(e) => setMemberSearchQuery(e.target.value)} /></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMembers.map(member => (
              <Card key={member.uid} className="flex flex-col items-center text-center p-10 group hover:translate-y-[-10px] transition-all duration-500 border-2 border-slate-50">
                <div onClick={() => openProfile(member.uid)} className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl mb-8 cursor-pointer hover:scale-105 transition-transform"><img src={member.avatarUrl} className="w-full h-full object-cover" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{member.name}</h3>
                <button onClick={() => openProfile(member.uid)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Review Credentials</button>
              </Card>
            ))}
          </div>
        </div>
      );
      case 'messages': return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-[3.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
          <aside className="w-96 border-r border-slate-100 flex flex-col">
            <div className="p-10 border-b border-slate-100"><h2 className="text-3xl font-serif font-black text-slate-900">Inbox</h2></div>
            <div className="flex-grow overflow-y-auto divide-y divide-slate-50">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-medium">No conversations yet.</p>
                  <button onClick={() => setView('members')} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Find People</button>
                </div>
              ) : threads.map(thread => {
                const partner = members.find(m => m.uid === thread.participantId) || { name: 'Member', avatarUrl: '' };
                return (
                  <div key={thread.id} onClick={() => setActiveThreadId(thread.id)} className={`p-8 flex items-center gap-5 cursor-pointer transition-all hover:bg-slate-50 ${activeThreadId === thread.id ? 'bg-indigo-50/50' : ''}`}>
                    <img src={(partner as any).avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=6366f1&color=fff`} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-black text-slate-900 truncate">{partner.name}</h4>
                      <p className="text-xs text-slate-500 truncate font-medium">{thread.lastMessage}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
          <main className="flex-grow flex flex-col">
            {activeThread ? (
              <div className="flex flex-col h-full">
                <div className="p-12 flex-grow overflow-y-auto space-y-8">{activeThread.messages.map(m => (<div key={m.id} className={`flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[65%] p-6 rounded-[2.5rem] shadow-sm text-base font-medium leading-relaxed ${m.senderId === user.uid ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>{m.text}</div></div>))}<div ref={messagesEndRef} /></div>
                <div className="p-10 border-t border-slate-100"><div className="flex gap-5"><input type="text" placeholder="Send a message..." className="flex-grow bg-slate-50 border-none rounded-2xl px-8 py-5 text-base font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} /><button onClick={() => handleSendMessage()} className="p-6 bg-indigo-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-xl"><Send size={24}/></button></div></div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="bg-indigo-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <MessageSquare size={36} />
                </div>
                <h3 className="text-3xl text-slate-900 font-serif font-black mb-3">Your Inbox</h3>
                <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed mb-6">
                  No messages yet. Visit the Network page to find and connect with members.
                </p>
                <button
                  onClick={() => setView('members')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-lg"
                >
                  Browse Network
                </button>
              </div>
            )}
          </main>
        </div>
      );
      default: return renderHome();
    }
  };

  if (!isLoggedIn && (view === 'signin' || view === 'join')) {
    return <AuthPage initialMode={view === 'join' ? 'signup' : 'login'} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Layout currentView={view} setView={setView} userRole={isLoggedIn ? user.role : Role.VISITOR} user={user} isLoggedIn={isLoggedIn} onToggleStatus={handleToggleStatus} onLogout={handleLogout} onLoginClick={() => setShowAuthModal(true)} onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)} searchData={{ jobs, members, scholarships }} onSearchSelect={(type, id) => { if (type === 'job') { const job = jobs.find(j => j.id === id); if (job) { setSelectedJob(job); } } else if (type === 'member') { setViewedProfileId(id); setView('profile'); } else if (type === 'scholarship') { setView('scholarships'); } }}>
      {renderContent()}

      {showAuthModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative z-10 w-full max-w-md">
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

      {/* Notifications Dropdown Panel */}
      {isNotificationsOpen && (
        <div className="fixed top-24 right-8 z-[1000] w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Intelligence Feed</h3>
            <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={16}/></button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.map(n => (
              <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex gap-4">
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 h-fit"><n.icon size={16}/></div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 mb-0.5">{n.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed truncate">{n.description}</p>
                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">Clear All Updates</button>
        </div>
      )}
      
      {/* Scholarship Admin Modal */}
      {showScholarshipModal && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={() => setShowScholarshipModal(false)}></div>
          <Card className="relative z-10 w-full max-w-2xl bg-white rounded-[4rem] p-12 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-serif font-black text-slate-900">{editingScholarship ? 'Refine Funding' : 'New Opportunity'}</h2>
              <button onClick={() => setShowScholarshipModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Program Name</label>
                 <input type="text" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900" value={scholarshipForm.name} onChange={e => setScholarshipForm({...scholarshipForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Provider</label>
                    <input type="text" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900" value={scholarshipForm.provider} onChange={e => setScholarshipForm({...scholarshipForm, provider: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Grant Amount</label>
                    <input type="text" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900" placeholder="$10,000" value={scholarshipForm.amount_display} onChange={e => setScholarshipForm({...scholarshipForm, amount_display: e.target.value})} />
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl">
                 <input type="checkbox" id="featured" checked={scholarshipForm.featured} onChange={e => setScholarshipForm({...scholarshipForm, featured: e.target.checked})} className="w-5 h-5 rounded text-indigo-600" />
                 <label htmlFor="featured" className="text-sm font-black text-indigo-900 uppercase tracking-widest">Featured High Priority Opportunity</label>
              </div>
              <button onClick={handleSaveScholarship} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3">
                <Save size={18}/> {editingScholarship ? 'Update Records' : 'Deploy Program'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (() => {
        const allMajors = DETAILED_MAJORS.flatMap(cat => cat.subcategories);
        const majorQuery = profileFormData.major || '';
        const filteredMajors = allMajors.filter(m => m.toLowerCase().includes(majorQuery.toLowerCase())).slice(0, 6);
        const showMajorDropdown = majorQuery.length > 0 && filteredMajors.length > 0 && !allMajors.includes(majorQuery);
        const skillInput = (profileFormData as any)._skillInput || '';
        return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setIsEditingProfile(false)}></div>
          <Card className="relative z-10 w-full max-w-2xl bg-white rounded-[3rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-serif font-black text-slate-900">Update Intelligence</h2>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none" value={profileFormData.name || ''} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Headline</label>
                <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none" value={profileFormData.headline || ''} onChange={e => setProfileFormData({...profileFormData, headline: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">School</label>
                  <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none" value={profileFormData.school || ''} onChange={e => setProfileFormData({...profileFormData, school: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Location</label>
                  <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none" value={profileFormData.location || ''} onChange={e => setProfileFormData({...profileFormData, location: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Major</label>
                <input type="text" placeholder="Type to search or enter your major..." className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none"
                  value={profileFormData.major || ''} onChange={e => setProfileFormData({...profileFormData, major: e.target.value})} />
                {showMajorDropdown && (
                  <div className="absolute z-10 w-full bg-white border-2 border-indigo-100 rounded-2xl shadow-xl overflow-hidden mt-1">
                    {filteredMajors.map(m => (
                      <button key={m} onClick={() => setProfileFormData({...profileFormData, major: m})}
                        className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">{m}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Skills</label>
                <div className="flex flex-wrap gap-2 min-h-[40px] bg-slate-50 p-3 rounded-2xl">
                  {(profileFormData.skills || []).map((skill, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest">
                      {skill}
                      <button onClick={() => setProfileFormData({...profileFormData, skills: (profileFormData.skills || []).filter((_, idx) => idx !== i)})}
                        className="text-indigo-400 hover:text-rose-500 transition-colors ml-1"><X size={10}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a skill (e.g. Python, React)..."
                    className="flex-grow bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-bold text-slate-900 outline-none text-sm"
                    value={skillInput}
                    onChange={e => setProfileFormData({...profileFormData, _skillInput: e.target.value} as any)}
                    onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { setProfileFormData({...profileFormData, skills: [...(profileFormData.skills || []), skillInput.trim()], _skillInput: ''} as any); }}} />
                  <button onClick={() => { if (skillInput.trim()) { setProfileFormData({...profileFormData, skills: [...(profileFormData.skills || []), skillInput.trim()], _skillInput: ''} as any); }}}
                    className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-slate-900 transition-all">Add</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Projects</label>
                <div className="space-y-3">
                  {(profileFormData.projects || []).map((project, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl space-y-3 border-2 border-transparent hover:border-indigo-100 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Project {i + 1}</span>
                        <button onClick={() => setProfileFormData({...profileFormData, projects: (profileFormData.projects || []).filter((_, idx) => idx !== i)})}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                      </div>
                      <input type="text" placeholder="Project title" className="w-full bg-white p-3 rounded-xl border-none font-bold text-slate-900 outline-none text-sm"
                        value={project.title} onChange={e => { const u = [...(profileFormData.projects || [])]; u[i] = {...u[i], title: e.target.value}; setProfileFormData({...profileFormData, projects: u}); }} />
                      <input type="text" placeholder="Description" className="w-full bg-white p-3 rounded-xl border-none font-medium text-slate-700 outline-none text-sm"
                        value={project.description} onChange={e => { const u = [...(profileFormData.projects || [])]; u[i] = {...u[i], description: e.target.value}; setProfileFormData({...profileFormData, projects: u}); }} />
                      <input type="text" placeholder="Link (https://...)" className="w-full bg-white p-3 rounded-xl border-none font-medium text-slate-500 outline-none text-sm"
                        value={project.link} onChange={e => { const u = [...(profileFormData.projects || [])]; u[i] = {...u[i], link: e.target.value}; setProfileFormData({...profileFormData, projects: u}); }} />
                      <input type="text" placeholder="Tags (comma separated)" className="w-full bg-white p-3 rounded-xl border-none font-medium text-slate-500 outline-none text-sm"
                        value={(project.tags || []).join(', ')} onChange={e => { const u = [...(profileFormData.projects || [])]; u[i] = {...u[i], tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)}; setProfileFormData({...profileFormData, projects: u}); }} />
                    </div>
                  ))}
                  <button onClick={() => setProfileFormData({...profileFormData, projects: [...(profileFormData.projects || []), {id: Math.random().toString(36).substr(2,9), title: '', description: '', imageUrl: 'https://images.unsplash.com/photo-1551288049-bbbda540d3b9?w=800&h=450&fit=crop', link: '', tags: []}]})}
                    className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                    <Plus size={14}/> Add Project
                  </button>
                </div>
              </div>
              <button onClick={handleSaveProfile} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl mt-6">Save Credentials</button>
            </div>
          </Card>
        </div>
        );
      })()}

      {/* AI Mentor Query Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[650] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={() => setIsAiModalOpen(false)}></div>
          <Card className="relative z-10 w-full max-w-xl bg-white rounded-[3.5rem] p-12 border-none shadow-2xl">
             <div className="flex justify-between items-center mb-8"><div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Sparkles size={24}/></div><h2 className="text-3xl font-serif font-black text-slate-900">AI Intelligence</h2></div><button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button></div>
             <div className="space-y-6"><p className="text-slate-500 font-medium leading-relaxed">Ask Gemini for precision-targeted career advice, strategy for interview loops, or specialized industry transitions.</p><textarea autoFocus placeholder="Example: How do I transition from Computer Science to Product Management in 2025?" className="w-full bg-slate-50 p-6 rounded-[2rem] border-none font-bold text-slate-900 h-40 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" value={aiQuestionInput} onChange={e => setAiQuestionInput(e.target.value)} /><button onClick={handleAiMentorSubmit} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"><Zap size={18}/> Execute Query</button></div>
          </Card>
        </div>
      )}

      {/* Info Sections Modal */}
      {activeInfoSection && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={() => setActiveInfoSection(null)}></div>
          <Card className="relative z-10 w-full max-w-2xl bg-white rounded-[3rem] p-12 overflow-y-auto max-h-[85vh] border-none shadow-2xl">
             <div className="flex justify-between items-center mb-10"><h2 className="text-4xl font-serif font-black text-slate-900 uppercase tracking-tight">{activeInfoSection}</h2><button onClick={() => setActiveInfoSection(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"><X size={24}/></button></div>
             <div className="prose prose-slate max-w-none space-y-6">
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                   {activeInfoSection === 'about' && "Graduate is the definitive professional collective for modern scholars and industry-leading graduates. We are building the infrastructure for professional meritocracy, where academic excellence translates directly into high-impact career opportunities."}
                   {activeInfoSection === 'guidelines' && "Our network is built on verified trust. Members are expected to maintain the highest levels of professional integrity, academic honesty, and collaborative spirit. Intellectual property and personal boundaries are fundamental pillars of our discourse."}
                   {activeInfoSection === 'privacy' && "Your data sovereignty is our priority. We employ advanced encryption for all network communications and provide granular control over your professional exposure. We do not sell user data; our value is in the collective intelligence of our verified members."}
                   {activeInfoSection === 'help' && "The Command Center is available 24/7 for technical support and verification inquiries. Reach out to our system architects for any integration assistance or credentialing questions."}
                   {activeInfoSection === 'accessibility' && "Universal access to opportunity is a core human right. Graduate is engineered for compliance with global accessibility standards, ensuring our intelligence dashboard is usable by every verified member of our collective."}
                </p>
                <div className="pt-10 border-t border-slate-100 flex items-center gap-4"><div className="bg-indigo-600 p-2 rounded-xl text-white"><ShieldCheck size={20}/></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified System Document • 2025</span></div>
             </div>
          </Card>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-700" onClick={() => setSelectedJob(null)}></div>
          <Card className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[4rem] p-12 sm:p-20 shadow-2xl animate-in zoom-in-95 duration-500 border-none">
            <button onClick={() => setSelectedJob(null)} className="absolute top-10 right-10 bg-slate-100 p-5 rounded-[2rem] text-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={28}/></button>
            <div className="flex flex-col md:flex-row gap-12 mb-10 items-start">
               <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-xl shrink-0"><img src={selectedJob.logo_url} className="w-full h-full object-cover" /></div>
               <div className="space-y-4 flex-grow">
                  <h2 className="text-5xl font-serif font-black text-slate-900 leading-tight">{selectedJob.title}</h2>
                  <div className="flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pt-2"><span className="flex items-center gap-2"><Building2 size={18} className="text-indigo-600"/> {selectedJob.company_name}</span><span className="flex items-center gap-2"><MapPin size={18} className="text-indigo-600"/> {selectedJob.city}, {selectedJob.state}</span><span className="flex items-center gap-2"><DollarSign size={18} className="text-emerald-500"/> {selectedJob.salary}</span></div>
               </div>
            </div>
            <div className="mb-16">
              {myApplications.some(a => a.jobId === selectedJob.id) ? (
                <button disabled className="px-10 py-5 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 cursor-default">
                  <CheckCircle2 size={18}/> Already Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applyingJobId === selectedJob.id}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-60"
                >
                  {applyingJobId === selectedJob.id ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
            <div className="mt-8 prose prose-slate max-w-none">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-6">Description</h3>
               <p className="text-xl text-slate-600 leading-relaxed font-medium">{selectedJob.description_detail}</p>
               {selectedJob.skills && selectedJob.skills.length > 0 && (
                 <div className="mt-8">
                   <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-4">Required Skills</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedJob.skills.map(s => <Tag key={s} color="bg-indigo-50 text-indigo-600">{s}</Tag>)}
                   </div>
                 </div>
               )}
               {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                 <div className="mt-8">
                   <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-4">Qualifications</h4>
                   <ul className="space-y-2">
                     {selectedJob.qualifications.map((q, i) => (
                       <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                         <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                         {q}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
            </div>
          </Card>
        </div>
      )}

      {/* Post Job Modal (Employer) */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={() => setShowPostJobModal(false)}></div>
          <Card className="relative z-10 w-full max-w-2xl bg-white rounded-[4rem] p-10 sm:p-12 overflow-y-auto max-h-[90vh] shadow-3xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-serif font-black text-slate-900">Post Opportunity</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Executive Talent Acquisition</p>
              </div>
              <button onClick={() => setShowPostJobModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"><X size={24}/></button>
            </div>
            
            {postJobError && (
              <div className="mb-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-[1.5rem] flex items-start gap-4 text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={24} className="shrink-0" />
                <p className="font-bold text-sm leading-relaxed">{postJobError}</p>
              </div>
            )}

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Role Title *</label>
                  <input type="text" placeholder="e.g. Senior Product Architect" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.title} onChange={e => setNewJobForm({...newJobForm, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Company Name *</label>
                  <input type="text" placeholder="e.g. InnovateX Solutions" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.company_name} onChange={e => setNewJobForm({...newJobForm, company_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">City *</label>
                  <input type="text" placeholder="e.g. San Francisco" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.city} onChange={e => setNewJobForm({...newJobForm, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">State *</label>
                  <input type="text" placeholder="e.g. CA" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.state} onChange={e => setNewJobForm({...newJobForm, state: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Salary Range *</label>
                  <input type="text" placeholder="e.g. $120k - $150k" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.salary} onChange={e => setNewJobForm({...newJobForm, salary: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Modality</label>
                  <select className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.remote_type} onChange={e => setNewJobForm({...newJobForm, remote_type: e.target.value as any})}>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Required Skills (Comma separated)</label>
                  <input type="text" placeholder="React, TypeScript, Node" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" onChange={e => setNewJobForm({...newJobForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Qualifications (Comma separated)</label>
                  <input type="text" placeholder="BS degree, 3+ years experience" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" onChange={e => setNewJobForm({...newJobForm, qualifications: e.target.value.split(',').map(q => q.trim()).filter(q => q !== '')})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Description *</label>
                <textarea placeholder="Describe the mission, impact, and day-to-day for this role..." className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 h-40 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" value={newJobForm.description_detail} onChange={e => setNewJobForm({...newJobForm, description_detail: e.target.value})} />
              </div>

              <button onClick={handlePostJob} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-4">
                <Zap size={18}/> Broadcast Role
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Story Details Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-700" onClick={() => setSelectedStory(null)}></div>
          <Card className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-[4rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 border-none">
            <button onClick={() => setSelectedStory(null)} className="absolute top-8 right-8 z-20 bg-white/80 backdrop-blur-md p-4 rounded-3xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl border border-slate-100"><X size={24}/></button>
            <div className="w-full h-72 sm:h-[500px] shrink-0 overflow-hidden relative"><img src={selectedStory.hero_image_url} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div></div>
            <div className="px-10 sm:px-24 pb-24 -mt-24 relative z-10"><div className="flex items-center gap-6 mb-8 text-slate-400 font-black uppercase tracking-widest text-[11px]"><span className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600">{selectedStory.author}</span><span>{new Date(selectedStory.createdAt).toLocaleDateString()}</span></div><h1 className="text-5xl sm:text-8xl font-serif font-black text-slate-900 mb-16 leading-[1.05] tracking-tight">{selectedStory.title}</h1><div className="prose prose-slate max-w-none">{selectedStory.content.split('\n\n').map((para, i) => (<p key={i} className="text-2xl text-slate-700 leading-relaxed mb-12 font-medium">{para}</p>))}</div></div>
          </Card>
        </div>
      )}

      {isSharingStory && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={() => setIsSharingStory(false)}></div>
          <Card className="relative z-10 w-full max-w-3xl bg-white rounded-[4rem] p-12">
            <div className="flex justify-between items-center mb-8"><h2 className="text-4xl font-serif font-black text-slate-900">Your Journey</h2><button onClick={() => setIsSharingStory(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button></div>
            <div className="space-y-6"><input type="text" placeholder="Title" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 outline-none" value={newStoryForm.title} onChange={e => setNewStoryForm({...newStoryForm, title: e.target.value})} /><textarea placeholder="Story Content" className="w-full bg-slate-50 p-6 rounded-2xl border-none font-bold text-slate-900 h-60 outline-none" value={newStoryForm.content} onChange={e => setNewStoryForm({...newStoryForm, content: e.target.value})} /><button onClick={handleSubmitStory} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl">Publish Story</button></div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default App;