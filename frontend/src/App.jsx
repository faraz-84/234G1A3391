import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Info,
  User,
  Clock,
  LogOut,
  Bell,
  Search,
  Settings,
  Terminal,
  X,
  ChevronRight,
  Shield,
  Zap,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Tab and search filters
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected notification for modal detailed view
  const [selectedNotif, setSelectedNotif] = useState(null);
  
  // Log buffer state
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const logsEndRef = useRef(null);

  // Settings Drawer Toggle
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    TEST_SERVER_URL: 'http://4.224.186.213/evaluation-service',
    EMAIL: '',
    FULL_NAME: '',
    MOBILE_NO: '',
    GITHUB_USERNAME: '',
    ROLL_NO: '',
    ACCESS_CODE: '',
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    hasClientCredentials: false
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(null);
  const [configError, setConfigError] = useState(null);
  
  // Student Profile details loaded from backend
  const [profile, setProfile] = useState({
    name: 'Student',
    rollNo: '234G1A3392',
    email: '234g1a3392@srit.ac.in'
  });

  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('srit_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('srit_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  // Fetch initial configuration & profile
  const fetchConfigAndProfile = useCallback(async () => {
    try {
      const profileRes = await axios.get(`${API_BASE}/profile`);
      setProfile(profileRes.data);
    } catch (err) {
      console.log('Could not fetch student profile', err);
    }

    try {
      const configRes = await axios.get(`${API_BASE}/config`);
      setConfig(configRes.data);
    } catch (err) {
      console.log('Could not fetch config from server', err);
    }
  }, []);

  useEffect(() => {
    fetchConfigAndProfile();
  }, [fetchConfigAndProfile]);

  // Load notifications from backend
  const loadNotifications = useCallback(async (nLimit, hiddenIds) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        params: {
          n: nLimit,
          readIds: hiddenIds.join(',')
        }
      });
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Server connection failed. Run backend server first.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(limit, readIds);
  }, [limit, readIds, loadNotifications]);

  // Poll logs every 3 seconds
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/logs`);
        if (response.data?.success) {
          setLogs(response.data.logs || []);
        }
      } catch (err) {
        // Suppress logs fetching errors to prevent UI spam
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll logs terminal to bottom when new logs arrive
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  const handleMarkAsRead = (id) => {
    setReadIds(prev => [...prev, id]);
  };

  const handleResetHistory = () => {
    setReadIds([]);
  };

  // Config Form handlers
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigSuccess(null);
    setConfigError(null);
    try {
      const res = await axios.post(`${API_BASE}/config`, {
        TEST_SERVER_URL: config.TEST_SERVER_URL,
        EMAIL: config.EMAIL,
        FULL_NAME: config.FULL_NAME,
        MOBILE_NO: config.MOBILE_NO,
        GITHUB_USERNAME: config.GITHUB_USERNAME,
        ROLL_NO: config.ROLL_NO,
        ACCESS_CODE: config.ACCESS_CODE
      });
      if (res.data?.success) {
        setConfigSuccess('Configuration saved successfully! Running in Mock/Saved settings.');
        fetchConfigAndProfile();
        loadNotifications(limit, readIds);
      }
    } catch (err) {
      setConfigError(err.response?.data?.message || err.message || 'Failed to save configuration');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleRegisterOnServer = async () => {
    setConfigSaving(true);
    setConfigSuccess(null);
    setConfigError(null);
    try {
      const res = await axios.post(`${API_BASE}/register`);
      if (res.data?.success) {
        setConfigSuccess('Registration Success! clientID and clientSecret generated and saved.');
        fetchConfigAndProfile();
        loadNotifications(limit, readIds);
      }
    } catch (err) {
      setConfigError(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setConfigSaving(false);
    }
  };

  const getCategoryTheme = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return {
          badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
          gradient: 'from-violet-500/15 via-transparent to-transparent',
          glow: 'shadow-violet-500/5 border-violet-500/30',
          accent: 'text-violet-400 border-violet-500/10',
          btn: 'bg-violet-600 hover:bg-violet-700 text-white',
          icon: <Briefcase className="w-5 h-5 text-violet-400" />
        };
      case 'result':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          gradient: 'from-emerald-500/15 via-transparent to-transparent',
          glow: 'shadow-emerald-500/5 border-emerald-500/30',
          accent: 'text-emerald-400 border-emerald-500/10',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <GraduationCap className="w-5 h-5 text-emerald-400" />
        };
      case 'event':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          gradient: 'from-amber-500/15 via-transparent to-transparent',
          glow: 'shadow-amber-500/5 border-amber-500/30',
          accent: 'text-amber-400 border-amber-500/10',
          btn: 'bg-amber-600 hover:bg-amber-700 text-slate-900 font-semibold',
          icon: <Calendar className="w-5 h-5 text-amber-400" />
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          gradient: 'from-slate-500/15 via-transparent to-transparent',
          glow: 'shadow-slate-500/5 border-slate-500/30',
          accent: 'text-slate-400 border-slate-500/10',
          btn: 'bg-slate-700 hover:bg-slate-600 text-white',
          icon: <Info className="w-5 h-5 text-slate-400" />
        };
    }
  };

  const getLogColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'text-rose-400 font-bold';
      case 'fatal': return 'text-red-500 font-black bg-red-950/40 px-1 rounded border border-red-500/20';
      case 'warn': return 'text-amber-400 font-semibold';
      case 'info': return 'text-sky-300';
      case 'debug': return 'text-slate-500';
      default: return 'text-slate-300';
    }
  };

  const formatTimeElapsed = (timestampStr) => {
    if (!timestampStr) return '';
    try {
      const isoString = timestampStr.replace(' ', 'T');
      const parsed = Date.parse(isoString);
      if (isNaN(parsed)) return timestampStr;
      
      const diffMs = Date.now() - parsed;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return timestampStr;
    }
  };

  // Filter & Search logic
  const filteredNotifications = notifications.filter(notif => {
    const matchesCategory = activeTab === 'all' || notif.Type?.toLowerCase() === activeTab;
    const matchesSearch = notif.Message?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notif.Type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          notif.ID?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const spotlightNotif = filteredNotifications[0];
  const listNotifications = filteredNotifications.slice(1);

  // Category counts
  const getCategoryCount = (cat) => {
    return notifications.filter(n => n.Type?.toLowerCase() === cat).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased relative overflow-x-hidden font-sans">
      
      {/* Decorative neon ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/10 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-emerald-600/5 to-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header bar */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative group cursor-pointer">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Bell className="w-5 h-5 text-white relative z-10 animate-wiggle" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SRIT Priority Inbox
                <span className="text-[10px] font-medium tracking-normal text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">v1.2</span>
              </h1>
              <p className="text-xs text-slate-500">Student Notification Intelligence Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {config.hasClientCredentials ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shadow-sm cursor-default hover:bg-emerald-500/15 transition">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Gateway
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium shadow-sm cursor-default hover:bg-amber-500/15 transition">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Mock Gateway
              </span>
            )}

            <button
              onClick={() => loadNotifications(limit, readIds)}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all border border-slate-800/80 disabled:opacity-50 active:scale-95 flex items-center justify-center"
              title="Refresh feed"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/30 shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar panel */}
        <section className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/40 border border-slate-900/80 rounded-2xl p-6 relative overflow-hidden group shadow-md backdrop-blur-md">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none transition-transform duration-300 group-hover:scale-110">
              <User className="w-36 h-36" />
            </div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              Student Info
              <User className="w-3.5 h-3.5" />
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xl shadow-inner">
                {profile.name[0] || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white truncate">{profile.name}</p>
                <p className="text-xs text-indigo-400 font-mono font-medium">{profile.rollNo}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Metrics / Insights */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              Feed Insights
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Priority Heap Load</span>
                  <span className="font-mono text-indigo-400 font-semibold">{notifications.length} / {limit}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((notifications.length / limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Dismissed Alerts</span>
                  <span className="font-mono text-emerald-400 font-semibold">{readIds.length}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((readIds.length / (readIds.length + notifications.length || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 flex justify-between border-t border-slate-900 text-[11px] text-slate-500">
                <span>Sorting Protocol</span>
                <span className="font-mono text-indigo-500">O(M log N) Min-Heap</span>
              </div>
            </div>
          </div>

          {/* Quick Priorities weights list */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Weight Metrics
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-900/60 hover:border-slate-800 transition">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span> Placements
                </span>
                <span className="font-mono font-bold text-violet-400 bg-violet-400/5 px-2 py-0.5 rounded border border-violet-400/10">Weight: 3</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-900/60 hover:border-slate-800 transition">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Results
                </span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Weight: 2</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-900/60 hover:border-slate-800 transition">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Events
                </span>
                <span className="font-mono font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">Weight: 1</span>
              </div>
            </div>
          </div>

          {/* Control Settings */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Capacity Controller
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-2">
                  <span>MAX NOTIFICATIONS:</span>
                  <span className="font-mono text-indigo-400">{limit}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Dismiss Filters
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{readIds.length} hidden</span>
                </div>
                {readIds.length > 0 && (
                  <button
                    onClick={handleResetHistory}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feed Column */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Error banner */}
          {error && (
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-5 flex gap-4 shadow-lg shadow-rose-950/5 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-400">Gateway Sync Error</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  {error}
                </p>
                <div className="mt-3">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-xs text-rose-300 underline font-semibold hover:text-rose-200 transition"
                  >
                    Configure credentials in Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900/30 border border-slate-900 rounded-2xl backdrop-blur-md">
            
            {/* Tab filters */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Feed', count: notifications.length },
                { id: 'placement', label: 'Placements', count: getCategoryCount('placement') },
                { id: 'result', label: 'Results', count: getCategoryCount('result') },
                { id: 'event', label: 'Events', count: getCategoryCount('event') }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
                      : 'bg-slate-950/60 text-slate-400 border-slate-900 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search priority index..."
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            /* Skeleton Loading */
            <div className="space-y-4">
              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 animate-pulse flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-800/40 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-800/40 rounded w-16"></div>
                </div>
                <div className="h-5 bg-slate-800/40 rounded w-3/4"></div>
                <div className="h-3.5 bg-slate-800/40 rounded w-1/2"></div>
              </div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 animate-pulse flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/40 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-slate-800/40 rounded w-1/4"></div>
                    <div className="h-3.5 bg-slate-800/40 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-base font-bold text-slate-400">Zero Critical Alerts</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-normal">
                {readIds.length > 0 
                  ? 'All campus updates have been read. Click reset history to show them again.'
                  : 'No notification stream found. Modify your filters or check back later.'
                }
              </p>
              {readIds.length > 0 && (
                <button
                  onClick={handleResetHistory}
                  className="mt-5 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore Dismissed Alerts
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Highlight #1 Spotlight Item */}
              {spotlightNotif && activeTab === 'all' && !searchTerm && (
                <div 
                  onClick={() => setSelectedNotif(spotlightNotif)}
                  className={`relative group overflow-hidden bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950/80 hover:to-slate-900/40 border border-indigo-500/30 hover:border-indigo-400/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-950/10 active:scale-[0.99]`}
                >
                  {/* Glowing light bars */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2.5 mb-3">
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                          Top Priority Spotlight
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {spotlightNotif.Timestamp}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-relaxed group-hover:text-indigo-200 transition-colors">
                        {spotlightNotif.Message}
                      </h3>
                      <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-500">
                        <span className="font-mono">ID: {spotlightNotif.ID}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-900">
                          Category: {spotlightNotif.Type}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(spotlightNotif.ID);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-900 hover:border-slate-800 transition active:scale-95"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => setSelectedNotif(spotlightNotif)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl border border-indigo-500/30 transition active:scale-95 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1"
                      >
                        Action Drawer
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed List (Regular list items) */}
              <div className="space-y-3.5">
                {(spotlightNotif && activeTab === 'all' && !searchTerm ? listNotifications : filteredNotifications).map((notif) => {
                  const theme = getCategoryTheme(notif.Type);
                  return (
                    <div 
                      key={notif.ID}
                      onClick={() => setSelectedNotif(notif)}
                      className={`group relative overflow-hidden bg-slate-950/80 hover:bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer active:scale-[0.995] shadow-sm`}
                    >
                      {/* Gradient border indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${theme.badge}`}></div>

                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200">
                        {theme.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                          <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${theme.badge}`}>
                            {notif.Type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {notif.Timestamp}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono ml-auto">
                            {formatTimeElapsed(notif.Timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium group-hover:text-slate-100 transition-colors">
                          {notif.Message}
                        </p>
                        <span className="text-[9px] text-slate-600 block mt-2 font-mono select-all truncate">
                          ID: {notif.ID}
                        </span>
                      </div>

                      <div className="shrink-0 self-center md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.ID);
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 transition active:scale-95"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Real-time Logs Terminal Console Component */}
      {showLogs && (
        <section className="bg-slate-950 border-t border-slate-900 shadow-2xl relative z-30 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Title bar */}
            <div className="flex items-center justify-between py-2.5 border-b border-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Live Logger Middleware Gateway Terminal
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-900 hover:border-slate-800 transition"
                >
                  Clear Console
                </button>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs view */}
            <div className="h-44 overflow-y-auto py-3 font-mono text-[11px] leading-relaxed space-y-1 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-4">Terminal waiting for middleware system logs... trigger a refresh to log events.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex gap-2 hover:bg-slate-900/40 py-0.5 px-1 rounded transition-colors">
                    <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-slate-500 shrink-0 uppercase">[{log.stack}]</span>
                    <span className={`${getLogColor(log.level)} shrink-0 uppercase`}>[{log.level}]</span>
                    <span className="text-indigo-400 shrink-0">[{log.package}]</span>
                    <span className="text-slate-300 truncate">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef}></div>
            </div>
          </div>
        </section>
      )}

      {/* Logs Trigger Button if closed */}
      {!showLogs && (
        <button
          onClick={() => setShowLogs(true)}
          className="fixed bottom-6 right-6 p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-indigo-400 rounded-full shadow-2xl z-30 transition hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Open logs console"
        >
          <Terminal className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {/* Settings Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Backdrop */}
          <div 
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          ></div>
          
          {/* Drawer body */}
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full relative z-10 flex flex-col shadow-2xl p-6 overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                Connection & Profiles Setup
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification config Status */}
            {configSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <p>{configSuccess}</p>
              </div>
            )}
            {configError && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{configError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveConfig} className="space-y-4.5 mt-5 flex-1">
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Test Server URL
                </label>
                <input
                  type="text"
                  name="TEST_SERVER_URL"
                  value={config.TEST_SERVER_URL}
                  onChange={handleConfigChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="FULL_NAME"
                    value={config.FULL_NAME}
                    onChange={handleConfigChange}
                    required
                    placeholder="Sabeel"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="ROLL_NO"
                    value={config.ROLL_NO}
                    onChange={handleConfigChange}
                    required
                    placeholder="234G1A3392"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  University Email Address
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  value={config.EMAIL}
                  onChange={handleConfigChange}
                  required
                  placeholder="234g1a3392@srit.ac.in"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="MOBILE_NO"
                    value={config.MOBILE_NO}
                    onChange={handleConfigChange}
                    placeholder="9999999999"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    name="GITHUB_USERNAME"
                    value={config.GITHUB_USERNAME}
                    onChange={handleConfigChange}
                    placeholder="sabeel-github"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Access Code</span>
                  <span className="text-[10px] text-indigo-400 lowercase tracking-normal">from invitation email</span>
                </label>
                <input
                  type="text"
                  name="ACCESS_CODE"
                  value={config.ACCESS_CODE}
                  onChange={handleConfigChange}
                  required
                  placeholder="yourAccessCode"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <button
                  type="submit"
                  disabled={configSaving}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-xs border border-slate-800 hover:border-slate-700 transition active:scale-98 disabled:opacity-50"
                >
                  {configSaving ? 'Saving...' : 'Save Config parameters to .env'}
                </button>

                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-white font-bold block">Live Gateway Registration</span>
                      <span className="text-[10px] text-slate-500">Query clientID/clientSecret with saved Access Code</span>
                    </div>
                    {config.hasClientCredentials ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/20">Registered</span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/20">Awaiting Auth</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRegisterOnServer}
                    disabled={configSaving || !config.EMAIL || !config.ACCESS_CODE}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/30 transition active:scale-98 disabled:opacity-50 disabled:bg-slate-900 disabled:text-slate-650"
                  >
                    {configSaving ? 'Registering...' : 'Register & Update Credentials'}
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 leading-normal">
              <span className="font-bold text-slate-400 block mb-1">Developer Credentials cached:</span>
              <p>Client ID: {config.CLIENT_ID || 'Not Registered'}</p>
              <p>Client Secret: {config.CLIENT_SECRET || 'Not Registered'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detailed Preview Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            onClick={() => setSelectedNotif(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          ></div>
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl relative z-10 p-6 shadow-2xl flex flex-col overflow-hidden animate-zoomIn">
            
            {/* Header category style */}
            {(() => {
              const theme = getCategoryTheme(selectedNotif.Type);
              return (
                <>
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                      {selectedNotif.Type} Alert
                    </span>
                    <button 
                      onClick={() => setSelectedNotif(null)}
                      className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-center shrink-0">
                        {theme.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-slate-500 font-semibold block uppercase">Message Content</span>
                        <p className="text-base text-slate-200 font-medium leading-relaxed mt-1">
                          {selectedNotif.Message}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 border border-slate-850/80 rounded-2xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Posted Date</span>
                        <span className="text-slate-300 font-medium font-mono">{selectedNotif.Timestamp}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Heap Identifier</span>
                        <span className="text-slate-300 font-medium font-mono select-all">{selectedNotif.ID}</span>
                      </div>
                    </div>

                    {/* Dynamic Context Action Buttons */}
                    <div className="pt-2">
                      {selectedNotif.Type?.toLowerCase() === 'placement' && (
                        <div className="bg-violet-950/20 border border-violet-500/10 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs text-violet-400 font-bold block">Placement drive details:</span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            This notification indicates a priority job announcement. Applications require an updated resume upload on the portal.
                          </p>
                          <a 
                            href="#apply" 
                            onClick={(e) => { e.preventDefault(); alert("Mocking Application submission request..."); }}
                            className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 ${theme.btn}`}
                          >
                            Apply for Opportunity
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {selectedNotif.Type?.toLowerCase() === 'result' && (
                        <div className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs text-emerald-400 font-bold block">Results published details:</span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Official exam scores are signed. If you seek re-evaluation, make a request within 5 working days of publication.
                          </p>
                          <a 
                            href="#results" 
                            onClick={(e) => { e.preventDefault(); alert("Downloading mock marksheet PDF..."); }}
                            className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 ${theme.btn}`}
                          >
                            Download official Grade Sheet
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {selectedNotif.Type?.toLowerCase() === 'event' && (
                        <div className="bg-amber-950/20 border border-amber-500/10 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs text-amber-400 font-bold block">Event Details:</span>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Register now to obtain access passes and refreshments coupons. Registrations are binding.
                          </p>
                          <a 
                            href="#register" 
                            onClick={(e) => { e.preventDefault(); alert("Registering seat for event..."); }}
                            className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 ${theme.btn}`}
                          >
                            Register Pass
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        handleMarkAsRead(selectedNotif.ID);
                        setSelectedNotif(null);
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-semibold transition active:scale-95"
                    >
                      Dismiss & Close
                    </button>
                    <button
                      onClick={() => setSelectedNotif(null)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition active:scale-95"
                    >
                      Close Window
                    </button>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 mt-12 bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-650">
          <p>© 2026 Sumathi Reddy Institute of Technology (SRIT). Powered by Priority Min-Heap Algorithm.</p>
          <div className="flex gap-4">
            <span className="cursor-default">SRIT Campus Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
