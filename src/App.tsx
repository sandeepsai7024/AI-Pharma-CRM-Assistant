/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart as LucideBarChart, 
  Activity, 
  Users, 
  Calendar, 
  Settings, 
  FileText, 
  PieChart as LucidePieChart, 
  ChevronRight,
  PlusCircle,
  Search,
  Mail,
  MessageSquare,
  User,
  AlertCircle,
  FileDown,
  Brain,
  Menu,
  X,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

const ENGAGEMENT_TREND_DATA = [
  { name: 'Mon', value: 65 },
  { name: 'Tue', value: 72 },
  { name: 'Wed', value: 68 },
  { name: 'Thu', value: 85 },
  { name: 'Fri', value: 79 },
  { name: 'Sat', value: 82 },
  { name: 'Sun', value: 88 },
];

const PRODUCT_ADOPTION_DATA = [
  { name: 'CardioFlow', value: 450, color: '#10b981' },
  { name: 'GlucoEase', value: 320, color: '#3b82f6' },
  { name: 'OncoRelief', value: 210, color: '#8b5cf6' },
  { name: 'DermoShield', value: 180, color: '#f59e0b' },
  { name: 'NeuroPulse', value: 120, color: '#ef4444' },
];

const CHANNEL_MIX_DATA = [
  { name: 'Email', value: 40 },
  { name: 'Phone', value: 25 },
  { name: 'In-Person', value: 35 },
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
import { motion, AnimatePresence } from 'motion/react';
import { Engagement, AIStrategyResponse } from './types';
import { SAMPLE_DOCTORS, DOCTOR_TYPES, CHANNELS, GOALS } from './constants';
import { generateEngagementStrategy } from './services/geminiService';

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${
      type === 'success' ? 'bg-emerald-900 border-emerald-500 text-emerald-50' : 'bg-red-900 border-red-500 text-red-50'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
      <X size={14} />
    </button>
  </motion.div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
      active ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
    {active && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
  </button>
);

const KPICard = ({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) => (
  <motion.div 
    whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-default transition-all"
  >
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
    <div className={`text-[10px] font-bold mt-2 ${trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-600 italic'}`}>
      {trend} {trend.startsWith('+') ? 'vs last month' : ''}
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'strategy' | 'products' | 'compliance'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState<Engagement[]>(SAMPLE_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Engagement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIStrategyResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Engagement | null>(null);
  const [tasks, setTasks] = useState([
    { id: 1, title: "High Risk: Dr. Mitchell", desc: "Patient adherence concerns raised. Educational materials required.", completed: false, urgency: 'high' },
    { id: 2, title: "Follow-up: Dr. Wilson", desc: "Discussed trial phase 3 results. Request full paper.", completed: false, urgency: 'medium' },
    { id: 3, title: "New Referral: Birmingham Center", desc: "OncologyRelief procurement review.", completed: true, urgency: 'low' },
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Engagement>>({
    doctor_type: 'General Physician',
    preferred_channel: 'Email',
    interaction_goal: 'Product awareness',
    engagement_history: []
  });

  const handleGenerateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor_name || !formData.hospital) return;

    setIsGenerating(true);
    setAiResponse(null);
    try {
      const fullEngagement: Engagement = {
        ...formData as Engagement,
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
      };
      const response = await generateEngagementStrategy(fullEngagement);
      setAiResponse(response);
      setActiveTab('strategy');
      // Save to local state if needed
      setDoctors([fullEngagement, ...doctors]);
      showToast("AI Strategy generated successfully!");
    } catch (error) {
      showToast("Error generating strategy. Verify API key.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7D9A8F] rounded-lg flex items-center justify-center text-white">
              <Activity size={18} />
            </div>
            <h1 className="font-bold text-slate-700 tracking-tight leading-none">PharmaCRM AI</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <SidebarItem icon={LucidePieChart} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={Users} label="Doctor Engagement" active={activeTab === 'doctors'} onClick={() => { setActiveTab('doctors'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={Brain} label="AI Strategy Hub" active={activeTab === 'strategy'} onClick={() => { setActiveTab('strategy'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={FileText} label="Product Suite" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} />
          <SidebarItem icon={Activity} label="Compliance Hub" active={activeTab === 'compliance'} onClick={() => { setActiveTab('compliance'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Compliance Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto">
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-600 p-2 -ml-2">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block text-[11px] text-slate-400 font-bold uppercase tracking-wider">UK Region › Manchester</div>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-200"></div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base">
               {activeTab === 'dashboard' && 'Territory Overview'}
               {activeTab === 'doctors' && 'Directory Hub'}
               {activeTab === 'strategy' && 'Strategy Blueprint'}
               {activeTab === 'products' && 'Medical Product Suite'}
               {activeTab === 'compliance' && 'Regulatory Monitoring'}
            </h2>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="pl-9 pr-4 py-1.5 rounded-full bg-slate-100 text-xs focus:outline-none w-48 border border-transparent focus:border-emerald-200 transition-all" 
                placeholder="Search specialists..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'doctors') setActiveTab('doctors');
                }}
              />
            </div>
            <button className="btn-primary !py-1.5 !px-3 md:!px-4 !text-[10px] md:!text-xs" onClick={() => { setActiveTab('doctors'); setFormData({}); }}>
              <PlusCircle size={14} />
              <span className="hidden xs:inline">New Engagement</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <KPICard label="Total HCPs" value={doctors.length.toString()} trend="+12%" icon={Users} color="medical" />
              <KPICard label="Engagement Rate" value="78%" trend="+5%" icon={Activity} color="success" />
              <KPICard label="Pending Tasks" value="14" trend="-2%" icon={Calendar} color="warning" />
              <KPICard label="Risk Profiles" value="3" trend="+1" icon={AlertCircle} color="danger" />

              <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Engagement Trends Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        Engagement Trend
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly territory performance</p>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+14.2%</div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ENGAGEMENT_TREND_DATA}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }} 
                          dy={10}
                        />
                        <YAxis 
                          hide 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px' 
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Product Adoption Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target size={18} className="text-blue-500" />
                        Product Adoption
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top performing therapeutics</p>
                    </div>
                  </div>
                  <div className="h-64 w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PRODUCT_ADOPTION_DATA} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          width={70}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {PRODUCT_ADOPTION_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Channel Mix Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-full lg:col-span-1">
                   <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <LucidePieChart size={18} className="text-purple-500" />
                      Channel Mix
                   </h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={CHANNEL_MIX_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {CHANNEL_MIX_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                         />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              </div>

              <div className="col-span-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm md:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700">
                       <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                       Recent HCP Sentiment
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {doctors.map(d => (
                      <motion.div 
                        key={d.id} 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setViewingDoctor(d)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100 gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0">
                            {d.doctor_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{d.doctor_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{d.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-3 sm:pt-0">
                           <div className="text-right">
                             <p className="text-xs font-bold text-emerald-600">{d.engagement_score}%</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Engagement</p>
                           </div>
                           <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                             d.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                           }`}>
                             {d.sentiment}
                           </div>
                           <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors hidden sm:block" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                   <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-700">
                      <AlertCircle size={20} className="text-amber-500" />
                      Priority Tasks
                   </h3>
                   <div className="space-y-4">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`p-4 rounded-2xl border transition-all ${
                            task.completed ? 'bg-slate-50/50 border-slate-100 opacity-60' : 
                            task.urgency === 'high' ? 'bg-amber-50/50 border-amber-100' : 'bg-blue-50/50 border-blue-100'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button 
                              onClick={() => {
                                const newTasks = tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t);
                                setTasks(newTasks);
                                if (!task.completed) showToast(`Task completed!`);
                              }}
                              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'
                              }`}
                            >
                              {task.completed && <X size={12} strokeWidth={4} />}
                            </button>
                            <div className="flex-1">
                              <p className={`text-xs font-bold mb-0.5 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </p>
                              <p className="text-[10px] text-slate-500 leading-relaxed italic">{task.desc}</p>
                            </div>
                            {task.urgency === 'high' && !task.completed && (
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
                            )}
                          </div>
                        </div>
                      ))}
                   </div>
                   <button className="w-full mt-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest border-t border-slate-100 pt-4">
                      View Calendar Schedule
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'doctors' && (
            <motion.div 
               key="doctors"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Form Section */}
              <div className="col-span-1">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm md:sticky md:top-24">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <PlusCircle size={20} className="text-medical-600" />
                    New HCP Engagement
                  </h3>
                  <form onSubmit={handleGenerateStrategy} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Doctor Name</label>
                      <input 
                        className="input-field mt-1" 
                        placeholder="e.g. Dr. Jane Smith" 
                        required 
                        value={formData.doctor_name || ''}
                        onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                        <select 
                          className="input-field mt-1"
                          value={formData.doctor_type}
                          onChange={(e) => setFormData({...formData, doctor_type: e.target.value as any})}
                        >
                          {DOCTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Region</label>
                        <input 
                          className="input-field mt-1" 
                          placeholder="e.g. London, UK" 
                          required 
                          value={formData.region || ''}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Hospital / Clinic</label>
                      <input 
                        className="input-field mt-1" 
                        placeholder="e.g. St. Mary's Hospital" 
                        required 
                        value={formData.hospital || ''}
                        onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Product</label>
                      <input 
                        className="input-field mt-1" 
                        placeholder="e.g. Zyrtec 10mg" 
                        required 
                        value={formData.product_name || ''}
                        onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Engagement Goal</label>
                      <select 
                        className="input-field mt-1"
                        value={formData.interaction_goal}
                        onChange={(e) => setFormData({...formData, interaction_goal: e.target.value as any})}
                      >
                        {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                     <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">History / Context</label>
                      <textarea 
                        className="input-field mt-1 h-32 resize-none" 
                        placeholder="Describe previous interactions or specific interests..."
                        value={formData.engagement_history?.[0] || ''}
                        onChange={(e) => setFormData({...formData, engagement_history: [e.target.value]})}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isGenerating} 
                      className="btn-primary w-full h-12 text-lg shadow-md hover:shadow-lg disabled:opacity-75"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                             <Activity size={20} />
                          </motion.div>
                          Generating AI Strategy...
                        </>
                      ) : (
                        <>
                          <Brain size={20} />
                          Generate Strategy
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    className="input-field pl-12 h-14 text-lg border-none shadow-sm" 
                    placeholder="Search HCPs by name, hospital or region..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredDoctors.map(doctor => (
                    <motion.div 
                      key={doctor.id} 
                      whileHover={{ y: -2 }}
                      onClick={() => setViewingDoctor(doctor)}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group cursor-pointer"
                    >
                       <div className="flex items-start justify-between">
                         <div className="flex gap-4">
                           <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-xl">
                             {doctor.doctor_name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div>
                             <h4 className="font-bold text-lg text-slate-800">{doctor.doctor_name}</h4>
                             <p className="text-xs text-slate-500">{doctor.doctor_type} • {doctor.hospital}</p>
                             <div className="mt-2 flex items-center gap-2">
                               <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest border border-slate-200">
                                 {doctor.region}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="mt-6 flex flex-wrap gap-2">
                         {doctor.engagement_history.map((h, i) => (
                           <div key={i} className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-[10px] border border-slate-100 flex items-center gap-2 italic">
                             <div className="w-1 h-1 rounded-full bg-emerald-500" />
                             {h}
                           </div>
                         ))}
                       </div>

                       <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Mail size={14} className="text-emerald-600" />
                              {doctor.preferred_channel}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Activity size={14} className="text-emerald-600" />
                              {doctor.interaction_goal}
                            </div>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); setFormData(doctor); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                           className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                         >
                           Update Profile
                           <ChevronRight size={14} />
                         </button>
                       </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && !aiResponse && (
            <motion.div 
               key="strategy-empty"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                <Brain size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Strategy</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Generate an AI-powered engagement strategy by selecting a doctor from the directory or creating a new engagement record.
              </p>
              <button onClick={() => setActiveTab('doctors')} className="btn-primary">
                Explore Directory
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
               key="products"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { name: "CardioFlow Plus", category: "Cardiology", status: "Active", stock: "High" },
                { name: "GlucoEase XT", category: "Endocrinology", status: "Active", stock: "Medium" },
                { name: "OncoRelief Gen3", category: "Oncology", status: "New", stock: "High" },
                { name: "DermoShield", category: "Dermatology", status: "Active", stock: "Low" },
                { name: "NeuroPulse", category: "Neurology", status: "Phase IV", stock: "Medium" }
              ].map((p, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                      <FileText size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'New' ? 'bg-medical-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg mb-1">{p.name}</h4>
                  <p className="text-xs text-slate-500 mb-6">{p.category}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory</p>
                       <p className={`text-xs font-bold ${p.stock === 'Low' ? 'text-amber-600' : 'text-slate-700'}`}>{p.stock} Supply</p>
                    </div>
                    <button className="btn-secondary !text-[10px] !py-1 !px-3">Detail View</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div 
               key="compliance"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="space-y-6"
            >
              <div className="bg-emerald-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
                 <div className="w-24 h-24 rounded-full border-8 border-emerald-500/30 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                   98%
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold mb-2">Regional Compliance Score</h3>
                    <p className="text-emerald-100/70 text-sm leading-relaxed max-w-lg">
                      Your Manchester territory is currently operating with high regulatory alignment. AI guards are active for all digital communications.
                    </p>
                 </div>
                 <button className="md:ml-auto btn-primary bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black">
                   Download Protocol
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Engagement Ethics", value: "Verified", status: "bg-success-600/10 text-success-600" },
                  { title: "Adherence Reporting", value: "Real-time", status: "bg-medical-500/10 text-medical-600" },
                  { title: "Clinical Citations", value: "Approved Only", status: "bg-success-600/10 text-success-600" },
                  { title: "Data Privacy (GDPR)", value: "Encrypted", status: "bg-success-600/10 text-success-600" }
                ].map((c, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{c.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: {c.value}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${c.status.split(' ')[1].replace('text-', 'bg-')}`}></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && aiResponse && (
            <motion.div 
               key="strategy"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="space-y-8"
            >
              {/* Profile Card & Main Strategy */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-full lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-xl shrink-0">
                       {formData.doctor_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{formData.doctor_name || 'Dr. Sarah Mitchell'}</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formData.doctor_type} • {formData.hospital}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Target Product</div>
                      <div className="text-sm font-bold text-slate-700">{formData.product_name}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Preferred Channel</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Mail size={14} className="text-emerald-600" />
                        {formData.preferred_channel}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 col-span-full">
                      <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Engagement Objective</div>
                      <div className="text-sm font-bold text-emerald-900">{formData.interaction_goal}</div>
                      <p className="text-[10px] text-emerald-700/70 mt-1 line-clamp-2">Strategy generated specifically for this medical context.</p>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                    Reset Configuration
                  </button>
                </div>

                <div className="col-span-full lg:col-span-8 flex flex-col gap-6">
                   <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 flex flex-col flex-1" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f7fdfb 100%)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                           <h3 className="text-lg font-bold text-slate-800 tracking-tight">AI Engagement Strategy</h3>
                         </div>
                         <span className="w-fit text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                           Clinical Optimized
                         </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="border-l-2 border-emerald-200 pl-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Strategy Summary</h4>
                            <p className="text-xs text-slate-600 leading-relaxed italic">{aiResponse.summary}</p>
                          </div>
                          
                          <div className="border-l-2 border-slate-200 pl-4 opacity-70">
                            <h4 className="text-sm font-bold text-slate-800 mb-1">Next Best Action</h4>
                            <ul className="space-y-2">
                              {aiResponse.next_best_actions.slice(0, 2).map((a, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2 italic">
                                   <ChevronRight size={12} className="mt-0.5 text-emerald-500 shrink-0" />
                                   {a}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2 mb-1">
                               <AlertCircle size={14} />
                               Compliance Guardrail
                            </h4>
                            <p className="text-[10px] text-amber-700 italic leading-normal">
                              {aiResponse.risk_alert.message}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
                           <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Suggested Discussion Points</h4>
                           <ul className="space-y-3">
                             <li className="flex gap-3 items-start">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                               <p className="text-xs leading-tight text-slate-700 font-medium">
                                 {aiResponse.discussion_points.clinical_relevance}
                               </p>
                             </li>
                             <li className="flex gap-3 items-start">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                               <p className="text-xs leading-tight text-slate-700 font-medium">
                                 {aiResponse.discussion_points.patient_adherence}
                               </p>
                             </li>
                             <li className="flex gap-3 items-start">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                               <p className="text-xs leading-tight text-slate-700 font-medium">
                                 {aiResponse.discussion_points.safety_profile}
                               </p>
                             </li>
                           </ul>
                           <div className="pt-4 border-t border-slate-100">
                             <button 
                               onClick={() => alert("Downloading Report...")}
                               className="w-full py-2.5 border-2 border-emerald-500 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                             >
                               <FileDown size={14} />
                               Export Strategy Paper
                             </button>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-1">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sentiment Index</h4>
                           <div className="text-xl font-bold text-slate-800">Positive <span className="text-xs font-normal text-slate-400 italic">(+0.4)</span></div>
                         </div>
                         <div className="flex gap-1 items-end h-8">
                            {[0.2, 0.4, 0.3, 0.6, 1].map((h, i) => (
                              <div key={i} className="w-1.5 rounded-full bg-emerald-500" style={{ height: `${h * 100}%` }}></div>
                            ))}
                         </div>
                      </div>
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-1">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engagement Score</h4>
                           <div className="text-xl font-bold text-slate-800">8.4 <span className="text-xs font-normal text-slate-400 italic">/10</span></div>
                         </div>
                         <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div className="w-[84%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* CRM Integration Section */}
              <div className="bg-[#1A1F1E] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                         <Activity size={16} />
                       </div>
                       <h4 className="text-white font-mono uppercase tracking-[0.2em] text-[10px] font-bold">Omnichannel Engagement Template</h4>
                    </div>
                    <button className="text-emerald-500 hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <Mail size={14} />
                       Sync to Outreach Hub
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="font-mono text-[11px] leading-relaxed text-slate-400 italic group-hover:text-slate-300 transition-colors">
                       <p className="mb-4">// CRM System Note Generation</p>
                       {aiResponse.crm_notes}
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Omnichannel Flow</p>
                       {aiResponse.omnichannel_ideas.map((idea, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[8px] text-emerald-400 font-bold">
                              {idx + 1}
                            </div>
                            <span className="text-[10px] text-slate-300">{idea}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] -translate-y-1/2 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>

      {/* Quick View Drawer */}
      <AnimatePresence>
        {viewingDoctor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingDoctor(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-200">
                    {viewingDoctor.doctor_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{viewingDoctor.doctor_name}</h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{viewingDoctor.doctor_type}</p>
                  </div>
                </div>
                <button onClick={() => setViewingDoctor(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Engagement</p>
                    <p className="text-lg font-bold text-slate-800">{viewingDoctor.engagement_score}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sentiment</p>
                    <p className="text-lg font-bold text-slate-800">{viewingDoctor.sentiment}</p>
                  </div>
                </div>

                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Metadata</h4>
                  <div className="space-y-3">
                     {[
                       { icon: Activity, label: 'Current Objective', value: viewingDoctor.interaction_goal },
                       { icon: Mail, label: 'Communication Channel', value: viewingDoctor.preferred_channel },
                       { icon: Target, label: 'Hospital Affiliation', value: viewingDoctor.hospital },
                       { icon: TrendingUp, label: 'Regional Sector', value: viewingDoctor.region }
                     ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                           <item.icon size={16} />
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</p>
                           <p className="text-xs font-bold text-slate-700">{item.value}</p>
                         </div>
                       </div>
                     ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Narratives</h4>
                  <div className="space-y-4">
                    {viewingDoctor.engagement_history.map((h, i) => (
                      <div key={i} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-none">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm" />
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{h}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setFormData(viewingDoctor); setActiveTab('doctors'); setViewingDoctor(null); }}
                  className="btn-secondary !py-3"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => { setFormData(viewingDoctor); handleGenerateStrategy({ preventDefault: () => {} } as any); setViewingDoctor(null); }}
                  className="btn-primary !py-3"
                >
                  Generate Strategy
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
