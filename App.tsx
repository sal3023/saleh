
import React, { useState, useEffect } from 'react';
import { AIStory, GenerationStatus, BlogData, SocialLinks } from './types';
import { 
  generateAIStory,
  generateSceneImage,
  generateSceneAudio
} from './geminiService';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'studio' | 'revenue' | 'settings' | 'apk_export'>('dashboard');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentStory, setCurrentStory] = useState<AIStory | null>(() => {
    const saved = localStorage.getItem('current_story');
    return saved ? JSON.parse(saved) : null;
  });
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const saved = localStorage.getItem('social_links');
    return saved ? JSON.parse(saved) : { blogger: '' };
  });

  useEffect(() => {
    if (currentStory) localStorage.setItem('current_story', JSON.stringify(currentStory));
    localStorage.setItem('social_links', JSON.stringify(socialLinks));
  }, [currentStory, socialLinks]);

  const handleGenerate = async () => {
    setStatus(GenerationStatus.SCRIPTING);
    setProgress(10);
    try {
      const story = await generateAIStory("الطفل الشجاع وكنز الأرقام", 'kids');
      setCurrentStory(story);
      setStatus(GenerationStatus.GENERATING_ASSETS);
      
      const updatedScenes = [...story.scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        const [img, audio] = await Promise.all([
          generateSceneImage(updatedScenes[i].imagePrompt),
          generateSceneAudio(updatedScenes[i].narration)
        ]);
        updatedScenes[i].videoUrl = img;
        updatedScenes[i].audioData = audio;
        setCurrentStory({ ...story, scenes: [...updatedScenes] });
        setProgress(p => p + (90 / updatedScenes.length));
      }
      setStatus(GenerationStatus.COMPLETED);
      setView('studio');
    } catch (e) {
      console.error(e);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#020205] text-slate-200 flex flex-col font-['Tajawal']" dir="rtl">
      {/* Navbar */}
      <header className="h-16 md:h-20 bg-black/90 border-b border-white/5 px-4 md:px-10 flex items-center justify-between backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-black font-black text-sm">🤖</span>
          </div>
          <h1 className="text-xs md:text-xl font-black">StoryProfit <span className="text-amber-500">PRO</span></h1>
        </div>

        <nav className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'dashboard', label: 'الرئيسية' },
            { id: 'studio', label: 'الإنتاج' },
            { id: 'revenue', label: 'الأرباح' },
            { id: 'apk_export', label: 'تصدير APK' },
            { id: 'settings', label: 'الإعدادات' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${view === tab.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden mobile-nav">
        {[
          { id: 'dashboard', icon: '🏠', label: 'الرئيسية' },
          { id: 'studio', icon: '🎬', label: 'الإنتاج' },
          { id: 'revenue', icon: '💰', label: 'الأرباح' },
          { id: 'apk_export', icon: '📱', label: 'تطبيق' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === tab.id ? 'text-amber-500 scale-110' : 'text-slate-500'}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[8px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar pb-24 md:pb-10">
        {view === 'dashboard' && (
          <div className="max-w-4xl mx-auto py-10 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">ابدأ جني الأرباح <br/><span className="text-amber-500">بضغطة زر واحدة.</span></h2>
            <p className="text-sm md:text-lg text-slate-400">نظام ذكاء اصطناعي متكامل يكتب، يرسم، يقرأ، وينشر القصص بدلاً عنك.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={handleGenerate}
                disabled={status !== GenerationStatus.IDLE}
                className="px-10 py-6 bg-amber-500 text-black rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-xl disabled:opacity-50"
              >
                {status === GenerationStatus.IDLE ? '🚀 توليد قصة الآن' : '⏳ جاري العمل...'}
              </button>
              <button 
                onClick={() => setView('apk_export')}
                className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xl hover:bg-white/10 transition-all"
              >
                📱 تصدير لـ APK
              </button>
            </div>

            {status !== GenerationStatus.IDLE && (
              <div className="mt-10 space-y-4 max-w-sm mx-auto">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">Progress: {Math.round(progress)}%</p>
              </div>
            )}
          </div>
        )}

        {view === 'apk_export' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10">
             <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black rounded-full mb-2">تجهيز التطبيق للأندرويد</div>
                <h2 className="text-3xl font-black text-white">بيانات التحويل إلى APK</h2>
                <p className="text-slate-400 text-sm">انسخ هذه البيانات وضعها في موقع التحويل الذي فتحته.</p>
             </div>

             <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border-white/10 space-y-8">
                {/* Field 1: Name */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 block uppercase px-2">1. اسم التطبيق (App Name)</label>
                    <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-4">
                        <span className="text-sm font-bold text-white">StoryProfit AI</span>
                        <button onClick={() => copyText("StoryProfit AI")} className="text-amber-500 font-black text-[10px]">نسخ 📋</button>
                    </div>
                </div>

                {/* Field 2: URL */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 block uppercase px-2">2. رابط الموقع (Website URL)</label>
                    <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-4">
                        <span className="text-[10px] md:text-xs font-mono text-emerald-400 truncate max-w-[200px] md:max-w-md">{window.location.href}</span>
                        <button onClick={() => copyText(window.location.href)} className="text-amber-500 font-black text-[10px]">نسخ 📋</button>
                    </div>
                </div>

                {/* Field 3: Email */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 block uppercase px-2">3. البريد الإلكتروني (Email Address)</label>
                    <div className="p-4 bg-amber-500/10 border border-dashed border-amber-500/30 rounded-2xl text-center">
                        <p className="text-[10px] text-amber-200 font-bold">ضع إيميلك الشخصي في موقع التحويل لتستلم التطبيق عليه.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <a href="https://www.web2apk.com" target="_blank" className="flex-1 bg-amber-500 text-black py-4 rounded-2xl font-black text-center text-xs hover:scale-105 transition-all shadow-lg shadow-amber-500/20">فتح موقع التحويل مجاناً</a>
                </div>

                {copied && (
                  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full text-[10px] font-black shadow-xl animate-bounce">
                    ✅ تم النسخ إلى الحافظة
                  </div>
                )}
             </div>
          </div>
        )}

        {view === 'studio' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {currentStory ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">{currentStory.title}</h3>
                  <button onClick={() => setView('revenue')} className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">خطط الربح 💰</button>
                </div>
                {currentStory.scenes.map((scene, i) => (
                  <div key={i} className="glass-card rounded-[2rem] overflow-hidden border-white/5">
                    <img src={scene.videoUrl} className="w-full aspect-video object-cover" />
                    <div className="p-6 space-y-4">
                      <p className="text-sm leading-relaxed text-slate-300">{scene.narration}</p>
                      {scene.audioData && (
                        <button 
                          onClick={() => new Audio(`data:audio/mp3;base64,${scene.audioData}`).play()}
                          className="flex items-center gap-2 text-amber-500 font-bold text-xs"
                        >
                          <span className="w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center">▶️</span>
                          استماع للتعليق الصوتي
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <p className="text-slate-500 font-bold">لم تكتشف أي كنوز بعد. ابدأ بصناعة قصة!</p>
              </div>
            )}
          </div>
        )}

        {view === 'revenue' && (
          <div className="max-w-5xl mx-auto space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] border-emerald-500/20">
                   <h3 className="text-xl font-black text-emerald-500 mb-4">يوتيوب (YouTube Kids)</h3>
                   <p className="text-xs text-slate-400 mb-6 font-bold leading-relaxed">النيش: قصص تعليمية قصيرة للأطفال. <br/>CPM المتوقع: $7 - $12</p>
                   <div className="space-y-3">
                      <div className="text-[10px] font-black text-slate-500 uppercase">الكلمات المفتاحية المقترحة:</div>
                      <div className="flex flex-wrap gap-2">
                         {currentStory?.youtubeData?.tags.map((tag, i) => (
                           <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-bold text-emerald-400">#{tag}</span>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="glass-card p-8 rounded-[2.5rem] border-amber-500/20">
                   <h3 className="text-xl font-black text-amber-500 mb-4">التسويق بالعمولة (Affiliate)</h3>
                   <div className="space-y-4">
                      {currentStory?.monetization?.suggestedProducts.map((p, i) => (
                        <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                           <span className="text-[10px] font-bold">🛒 {p}</span>
                           <span className="text-[8px] text-amber-500 font-black">ربح مالي 💰</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="hidden md:flex h-12 bg-black border-t border-white/5 px-10 items-center justify-between text-[10px] font-black text-slate-600">
        <div>CORE: GEMINI 3 FLASH PRO</div>
        <div className="text-emerald-500">OPTIMIZED FOR ANDROID 14+</div>
      </footer>
    </div>
  );
}
