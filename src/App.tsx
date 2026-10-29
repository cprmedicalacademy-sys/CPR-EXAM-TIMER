/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Bell,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Megaphone,
  CheckCircle2,
  Search,
  PlusCircle,
  X,
  Sliders,
  Tv,
  Edit2,
  Mic,
  AlertCircle,
  Trash2,
  RotateCw,
  GraduationCap
} from 'lucide-react';

export type ExamCategory = 'FCPS' | 'BCS' | 'Residency' | 'Diploma' | 'General';

export interface ExamItem {
  id: string;
  category: ExamCategory;
  date: string;
  day: string;
  topic: string;
  time: string;
  durationMinutes: number;
  custom?: boolean;
}

const DEFAULT_ROUTINE: ExamItem[] = [
  { id: '1', category: 'Residency', date: '07/10/26', day: 'Wednesday', topic: 'Patho 1 (Inflammation Healing Repair + Cell Injury & Adaptation)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '2', category: 'Residency', date: '10/10/26', day: 'Saturday', topic: 'Patho 2 ( Neoplasia + Genetics + Immunology )', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '3', category: 'Residency', date: '12/10/26', day: 'Monday', topic: 'Micro 1 (Bacteriology)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '4', category: 'Residency', date: '14/10/26', day: 'Wednesday', topic: 'Micro 2 ( Virology + Parasitology + Mycology )', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '5', category: 'Residency', date: '17/10/26', day: 'Saturday', topic: 'Pharmacology', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '6', category: 'FCPS', date: '19/10/26', day: 'Monday', topic: 'Clinical / Faculty Paper 1', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '7', category: 'Residency', date: '21/10/26', day: 'Wednesday', topic: 'Physio 1 ( CVS+ Respiratory +Renal + Acid Base + Neurophysiology )', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '8', category: 'Residency', date: '24/10/26', day: 'Saturday', topic: 'Physio 2 (Endocrine + GIT+ Metabolism, Vitamins & Minerals)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '9', category: 'Residency', date: '26/10/26', day: 'Monday', topic: 'Anatomy 1 (Abdomen + Thorax+ Histology)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '10', category: 'FCPS', date: '28/10/26', day: 'Wednesday', topic: 'Anatomy 2 (Extremity +Embryology+ Head neck & Neuroanatomy)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '11', category: 'BCS', date: '30/10/26', day: 'Friday', topic: 'MOCK 1 (Comprehensive Test)', time: '3.00 - 3.30 PM', durationMinutes: 30 },
  { id: '12', category: 'Diploma', date: '01/11/26', day: 'Sunday', topic: 'MOCK 2 (Final Model Test)', time: '3.00 - 3.30 PM', durationMinutes: 30 }
];

const PRESET_NOTICES = [
  'Strictly maintain exam time. Mobile phones and unauthorized materials are strictly prohibited in the exam hall.',
  'Please write your Roll Number and Registration Number clearly on the top right corner of the answer sheet.',
  'Warning: 5 Minutes Remaining! Complete and review your answers, and tie additional sheets securely.',
  'Exam Time has Ended! Stop writing immediately, place your pens down, and remain seated for collection.'
];

const CATEGORY_COLORS: Record<ExamCategory, { bg: string; text: string; border: string }> = {
  FCPS: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  BCS: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  Residency: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Diploma: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  General: { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-600' }
};

export default function App() {
  // Routine list state
  const [routine, setRoutine] = useState<ExamItem[]>(() => {
    const saved = localStorage.getItem('cpr_exam_routine_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ROUTINE;
      }
    }
    return DEFAULT_ROUTINE;
  });

  // Selected active exam
  const [activeExam, setActiveExam] = useState<ExamItem>(() => {
    return routine[0] || {
      id: 'default',
      category: 'General',
      date: 'Today',
      day: 'Current',
      topic: 'Medical Exam',
      time: '3.00 - 3.30 PM',
      durationMinutes: 30
    };
  });

  // Timer states
  const [totalSeconds, setTotalSeconds] = useState<number>(30 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  // Audio & Alarm settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [alarm1MinEnabled, setAlarm1MinEnabled] = useState<boolean>(true);
  const [voiceAnnouncementEnabled, setVoiceAnnouncementEnabled] = useState<boolean>(true);
  const [voiceAnnouncementText, setVoiceAnnouncementText] = useState<string>('Exam Time End! Stop writing and put down your pens.');
  const [autoBell5Min, setAutoBell5Min] = useState<boolean>(true);
  const [autoBellEnd, setAutoBellEnd] = useState<boolean>(true);

  // Smart board & display settings
  const [screenMode, setScreenMode] = useState<'dark' | 'contrast' | 'amoled'>('dark');
  const [focusMode, setFocusMode] = useState<boolean>(false); // Hides sidebar for massive board display
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showEndTakeover, setShowEndTakeover] = useState<boolean>(false);

  // Hall Notice
  const [hallNotice, setHallNotice] = useState<string>(PRESET_NOTICES[0]);
  const [isEditingNotice, setIsEditingNotice] = useState<boolean>(false);

  // Search filter and Category filter (FCPS, BCS, Residency, Diploma)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | ExamCategory>('All');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Settings form states
  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
  const [modalTopic, setModalTopic] = useState<string>('');
  const [modalCategory, setModalCategory] = useState<ExamCategory>('Residency');
  const [modalDate, setModalDate] = useState<string>('');
  const [modalTime, setModalTime] = useState<string>('3.00 - 3.30 PM');
  const [modalDuration, setModalDuration] = useState<number>(30);

  // New Exam form states
  const [newTopic, setNewTopic] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ExamCategory>('FCPS');
  const [newDate, setNewDate] = useState<string>('');
  const [newDay, setNewDay] = useState<string>('Friday');
  const [newTime, setNewTime] = useState<string>('3.00 - 3.30 PM');
  const [newDuration, setNewDuration] = useState<number>(30);

  // Live clock
  const [currentDateTime, setCurrentDateTime] = useState<{ time: string; date: string }>({
    time: '00:00:00 AM',
    date: 'Loading...'
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const warned5MinRef = useRef<boolean>(false);
  const warned1MinRef = useRef<boolean>(false);

  // Sync routine to localStorage
  useEffect(() => {
    localStorage.setItem('cpr_exam_routine_v2', JSON.stringify(routine));
  }, [routine]);

  // Live Clock loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = now.toLocaleDateString('en-US', options);

      setCurrentDateTime({
        time: formattedTime,
        date: formattedDate
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API Voice Announcement
  const speakAnnouncement = useCallback((textToSpeak: string) => {
    if (!soundEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }, [soundEnabled]);

  // Web Audio chime & alarm sound generator
  const playSound = useCallback((type: 'single' | 'triple' | 'alarm_1min' | 'end_siren') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'single') {
        // Clear brass bell tone (587.33 Hz - D5)
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, now);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } else if (type === 'alarm_1min') {
        // High-alert urgent rhythmic alarm buzzer (4 alternating dual-beeps)
        for (let i = 0; i < 4; i++) {
          const startTime = now + (i * 0.28);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = i % 2 === 0 ? 'sine' : 'square';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 740, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.23);
        }
      } else if (type === 'triple' || type === 'end_siren') {
        // Grand triple brass exam gong chime
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const toneTime = ctx.currentTime;
            const osc = ctx.createOscillator();
            const oscHarmonic = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, toneTime);
            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(1046.5, toneTime);

            gainNode.gain.setValueAtTime(0.45, toneTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, toneTime + 1.8);

            osc.connect(gainNode);
            oscHarmonic.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(toneTime);
            oscHarmonic.start(toneTime);
            osc.stop(toneTime + 1.8);
            oscHarmonic.stop(toneTime + 1.8);
          }, i * 500);
        }
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }, [soundEnabled]);

  // Main countdown timer loop with 1-min alarm and Exam End voice triggers
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          // Exam Time Reached 0 (Ended!)
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setHasEnded(true);
            setShowEndTakeover(true);

            // 1. Play grand exam end gong
            if (autoBellEnd) {
              playSound('triple');
            }

            // 2. Play spoken audio voice: "Exam Time End! Stop writing..."
            if (voiceAnnouncementEnabled) {
              setTimeout(() => {
                speakAnnouncement(voiceAnnouncementText);
              }, 700);
            }

            return 0;
          }

          const nextSec = prev - 1;

          // 1-Minute Warning Alarm Trigger (at exactly 60 seconds)
          if (nextSec === 60 && alarm1MinEnabled && !warned1MinRef.current) {
            warned1MinRef.current = true;
            playSound('alarm_1min');
            if (voiceAnnouncementEnabled) {
              setTimeout(() => {
                speakAnnouncement('Warning! Last one minute remaining. Please wrap up your writing.');
              }, 1200);
            }
          }

          // 5-Minute Warning Bell Trigger (at exactly 300 seconds)
          if (nextSec === 300 && autoBell5Min && !warned5MinRef.current) {
            warned5MinRef.current = true;
            playSound('single');
            if (voiceAnnouncementEnabled) {
              setTimeout(() => {
                speakAnnouncement('Five minutes remaining.');
              }, 800);
            }
          }

          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isRunning,
    autoBell5Min,
    alarm1MinEnabled,
    autoBellEnd,
    voiceAnnouncementEnabled,
    voiceAnnouncementText,
    playSound,
    speakAnnouncement
  ]);

  // Handle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Error enabling fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Timer Controls
  const handleStart = () => {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(totalSeconds);
      setHasEnded(false);
      setShowEndTakeover(false);
      warned5MinRef.current = false;
      warned1MinRef.current = false;
    }
    setIsRunning(true);
    setHasEnded(false);
    setShowEndTakeover(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setHasEnded(false);
    setShowEndTakeover(false);
    warned5MinRef.current = false;
    warned1MinRef.current = false;
  };

  const adjustTime = (secondsDelta: number) => {
    setRemainingSeconds(prev => {
      const updated = Math.max(0, prev + secondsDelta);
      if (updated > 60) warned1MinRef.current = false;
      if (updated > 300) warned5MinRef.current = false;
      if (updated > 0) {
        setHasEnded(false);
        setShowEndTakeover(false);
      }
      return updated;
    });
    setTotalSeconds(prev => Math.max(60, prev + secondsDelta));
  };

  const setPresetDuration = (minutes: number) => {
    setIsRunning(false);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setHasEnded(false);
    setShowEndTakeover(false);
    warned5MinRef.current = false;
    warned1MinRef.current = false;
  };

  // Exam Selection
  const selectExam = (exam: ExamItem) => {
    setActiveExam(exam);
    setIsRunning(false);
    const secs = exam.durationMinutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setHasEnded(false);
    setShowEndTakeover(false);
    warned5MinRef.current = false;
    warned1MinRef.current = false;
  };

  // DELETE EXAM LOGIC (Requested by user)
  const handleDeleteExam = (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const updated = routine.filter(item => item.id !== idToDelete);
    setRoutine(updated);

    // If the active exam was deleted, switch to the first remaining exam or fallback
    if (activeExam.id === idToDelete) {
      if (updated.length > 0) {
        selectExam(updated[0]);
      } else {
        const fallbackExam: ExamItem = {
          id: 'new-fallback',
          category: 'FCPS',
          date: 'Today',
          day: 'New',
          topic: 'Custom Exam',
          time: '3.00 - 3.30 PM',
          durationMinutes: 30
        };
        selectExam(fallbackExam);
      }
    }
    setDeleteConfirmId(null);
  };

  // CLEAR ALL EXAMS
  const handleClearAllExams = () => {
    if (window.confirm('Are you sure you want to delete all exams from the schedule? You can add new ones anytime.')) {
      setRoutine([]);
      const blankExam: ExamItem = {
        id: 'blank',
        category: 'FCPS',
        date: 'Today',
        day: 'Session',
        topic: 'Exam Smart Timer Session',
        time: '3.00 - 3.30 PM',
        durationMinutes: 30
      };
      selectExam(blankExam);
    }
  };

  // RESTORE DEFAULT ROUTINE
  const handleRestoreDefaults = () => {
    if (window.confirm('Restore official sample routine (FCPS, BCS, Residency, Diploma)?')) {
      setRoutine(DEFAULT_ROUTINE);
      selectExam(DEFAULT_ROUTINE[0]);
    }
  };

  // Open settings with current exam pre-selected
  const handleOpenSettings = () => {
    const idx = routine.findIndex(r => r.id === activeExam.id);
    setSelectedRoutineIndex(idx >= 0 ? idx : 0);
    setModalTopic(activeExam.topic);
    setModalCategory(activeExam.category || 'FCPS');
    setModalDate(activeExam.date);
    setModalTime(activeExam.time);
    setModalDuration(activeExam.durationMinutes);
    setIsSettingsOpen(true);
  };

  const handleRoutineSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSelectedRoutineIndex(index);
    const exam = routine[index];
    if (exam) {
      setModalTopic(exam.topic);
      setModalCategory(exam.category);
      setModalDate(`${exam.date} (${exam.day})`);
      setModalTime(exam.time);
      setModalDuration(exam.durationMinutes);
    }
  };

  const handleApplySettings = () => {
    const updatedExam: ExamItem = {
      ...activeExam,
      topic: modalTopic || 'Exam Smart Timer',
      category: modalCategory,
      date: modalDate || 'Today',
      time: modalTime || '3.00 - 3.30 PM',
      durationMinutes: modalDuration || 30
    };
    selectExam(updatedExam);
    
    // Also update this exam in routine list if present
    setRoutine(prev => prev.map(item => item.id === activeExam.id ? updatedExam : item));
    setIsSettingsOpen(false);
  };

  const handleAddNewExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newExamItem: ExamItem = {
      id: Date.now().toString(),
      category: newCategory,
      date: newDate || 'Custom Date',
      day: newDay,
      topic: newTopic,
      time: newTime,
      durationMinutes: newDuration,
      custom: true
    };

    setRoutine(prev => [newExamItem, ...prev]);
    selectExam(newExamItem);
    setIsAddExamOpen(false);
    setNewTopic('');
  };

  // Time calculations (Hours, Minutes, Seconds)
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;

  // Filtered Routine by search query and category (FCPS, BCS, Residency, Diploma)
  const filteredRoutine = routine.filter(item => {
    const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    const matchesSearch = item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery) ||
      item.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Visual status configuration
  let statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let statusText = 'Ready to Start';
  let timerTextColor = 'text-blue-400 glow-blue';
  let timerBgBorder = 'border-slate-800 bg-slate-950/80';

  if (hasEnded || remainingSeconds === 0) {
    statusBadgeColor = 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-950';
    statusText = 'Exam Time Over! Stop Writing';
    timerTextColor = 'text-rose-500 glow-red animate-pulse';
    timerBgBorder = 'border-rose-600/70 bg-rose-950/40 ring-4 ring-rose-600/30';
  } else if (isRunning) {
    if (remainingSeconds <= 60) {
      statusBadgeColor = 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900';
      statusText = 'ALARM: LAST 1 MINUTE!';
      timerTextColor = 'text-rose-400 glow-red';
      timerBgBorder = 'border-rose-500 bg-rose-950/30 animate-pulse';
    } else if (remainingSeconds <= 300) {
      statusBadgeColor = 'bg-amber-500 text-slate-950 font-black animate-pulse';
      statusText = 'Warning: 5 Mins Remaining';
      timerTextColor = 'text-amber-400 glow-amber';
      timerBgBorder = 'border-amber-500/60 bg-amber-950/20';
    } else {
      statusBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      statusText = 'Exam in Progress';
      timerTextColor = 'text-blue-400 glow-blue';
      timerBgBorder = 'border-blue-900/40 bg-slate-950/80';
    }
  } else if (remainingSeconds < totalSeconds && remainingSeconds > 0) {
    statusBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    statusText = 'Exam Paused';
    timerTextColor = 'text-blue-300';
  }

  // Color scheme variants
  const rootBg = screenMode === 'amoled'
    ? 'bg-black text-slate-100'
    : screenMode === 'contrast'
    ? 'bg-slate-900 text-white'
    : 'bg-slate-950 text-slate-100';

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-rose-600 selection:text-white transition-colors duration-300 ${rootBg}`}>
      
      {/* Top Header Bar */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl z-20">
        
        {/* Branding & Medical Institute Title */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-white p-2 rounded-2xl shadow-md flex items-center space-x-2 border border-slate-700/80 hover:scale-105 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="leading-tight pr-1">
              <span className="font-black text-slate-900 tracking-wider text-base sm:text-lg block">
                CPR <span className="text-blue-700 font-extrabold">Medical</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Academy Chattogram
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="bg-rose-600 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black text-white shadow-sm shadow-rose-900/50">
                Smart Board
              </span>
              Exam Smart Timer
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-400 font-bold">FCPS</span> &bull;
              <span className="text-amber-400 font-bold">BCS</span> &bull;
              <span className="text-blue-400 font-bold">Residency</span> &bull;
              <span className="text-purple-400 font-bold">Diploma</span>
              <span className="hidden lg:inline text-slate-500">| Motij Tower (5th Floor), Chawkbazar, Chattogram</span>
            </p>
          </div>
        </div>

        {/* Real-time Clock, Audio test, Focus mode, Fullscreen */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap">
          
          {/* Live Real Clock */}
          <div className="bg-slate-800/90 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2.5 shadow-inner">
            <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
            <div>
              <div className="text-sm sm:text-base font-mono-numbers font-bold text-white tracking-wider">
                {currentDateTime.time}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold truncate max-w-[150px]">
                {currentDateTime.date}
              </div>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSound('single');
            }}
            title={soundEnabled ? 'Master Sound is ON' : 'Master Sound is MUTED'}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-blue-400 hover:text-white'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Voice Announcement Test Button */}
          <button
            onClick={() => speakAnnouncement(voiceAnnouncementText)}
            title="Test Voice Announcement ('Exam Time End')"
            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-emerald-400 transition flex items-center space-x-1.5 text-xs font-semibold"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Voice Test</span>
          </button>

          {/* 1-Min Alarm Test Button */}
          <button
            onClick={() => playSound('alarm_1min')}
            title="Test 1-Minute Warning Alarm Sound"
            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-rose-400 transition flex items-center space-x-1.5 text-xs font-semibold"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">1m Alarm</span>
          </button>

          {/* Bell Chime Manual Test Button */}
          <button
            onClick={() => playSound('single')}
            title="Ring Brass Bell (Single Chime)"
            className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-amber-400 transition"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Focus Mode (Max display for students) */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Show Exam Routine Sidebar' : 'Focus Mode (Maximize Timer For Hall)'}
            className={`p-2.5 rounded-xl border transition ${
              focusMode
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullScreen}
            title="Toggle Fullscreen Smart Board Display"
            className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition shadow"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings / Select Exam */}
          <button
            onClick={handleOpenSettings}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition shadow-md shadow-blue-900/40 text-xs sm:text-sm"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow container mx-auto px-3 sm:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
        
        {/* Left Column: Active Exam & Giant Board Timer */}
        <div className={`transition-all duration-300 space-y-4 md:space-y-5 ${focusMode ? 'lg:col-span-12 max-w-5xl mx-auto' : 'lg:col-span-8'}`}>
          
          {/* Active Exam Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 border-2 border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar inside Exam Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusBadgeColor} transition-all`}>
                  {statusText}
                </span>

                {/* Course Category Badge */}
                {activeExam.category && (
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${CATEGORY_COLORS[activeExam.category]?.bg} ${CATEGORY_COLORS[activeExam.category]?.text} ${CATEGORY_COLORS[activeExam.category]?.border}`}>
                    {activeExam.category}
                  </span>
                )}

                <span className="text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activeExam.date} ({activeExam.day})</span>
                </span>
              </div>

              <div className="text-slate-300 text-xs sm:text-sm font-medium bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="text-slate-400">Scheduled:</span>
                <span className="text-white font-bold">{activeExam.time}</span>
                <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
                  {activeExam.durationMinutes}m
                </span>
              </div>
            </div>

            {/* Active Exam Topic Title */}
            <div className="text-center my-4 sm:my-6">
              <p className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1.5 flex items-center justify-center gap-2">
                <span>Active Exam Topic</span>
                <button
                  onClick={handleOpenSettings}
                  className="text-slate-500 hover:text-blue-400 transition"
                  title="Edit Active Exam Topic"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </p>
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight glow-blue">
                {activeExam.topic}
              </h2>
            </div>

            {/* 1-Minute Warning Banner (Appears automatically in last 60 seconds) */}
            {isRunning && remainingSeconds <= 60 && remainingSeconds > 0 && (
              <div className="bg-rose-950/80 border-2 border-rose-500 rounded-2xl p-3 mb-4 text-center animate-pulse shadow-lg shadow-rose-950">
                <div className="flex items-center justify-center space-x-2 text-rose-300 font-black text-sm sm:text-base">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                  <span>FINAL 60 SECONDS! STOP STARTING NEW QUESTIONS &amp; FASTEN SCRIPTS!</span>
                </div>
              </div>
            )}

            {/* Giant Countdown Display Box */}
            <div className={`rounded-3xl p-5 sm:p-8 md:p-10 text-center shadow-inner my-4 md:my-6 transition-all duration-300 border-2 ${timerBgBorder} relative overflow-hidden`}>
              
              {/* Progress bar line at top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    remainingSeconds <= 60
                      ? 'bg-rose-500 animate-pulse'
                      : remainingSeconds <= 300
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Big Digits Display: Hours, Minutes, Seconds */}
              <div className="flex items-center justify-center space-x-1.5 sm:space-x-3 md:space-x-5 my-2 sm:my-3">
                {/* Hours Block */}
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[120px] md:min-w-[160px]">
                  <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-none ${timerTextColor} select-none transition-colors`}>
                    {formattedHours}
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mt-1.5 sm:mt-2.5">
                    Hours
                  </span>
                </div>

                <div className="flex flex-col items-center pb-4 sm:pb-6">
                  <span className={`font-mono-numbers text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black ${timerTextColor} opacity-60 select-none`}>
                    :
                  </span>
                </div>

                {/* Minutes Block */}
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[120px] md:min-w-[160px]">
                  <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-none ${timerTextColor} select-none transition-colors`}>
                    {formattedMinutes}
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mt-1.5 sm:mt-2.5">
                    Minutes
                  </span>
                </div>

                <div className="flex flex-col items-center pb-4 sm:pb-6">
                  <span className={`font-mono-numbers text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black ${timerTextColor} opacity-60 select-none`}>
                    :
                  </span>
                </div>

                {/* Seconds Block */}
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[120px] md:min-w-[160px]">
                  <span className={`font-mono-numbers text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight leading-none ${timerTextColor} select-none transition-colors`}>
                    {formattedSeconds}
                  </span>
                  <span className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mt-1.5 sm:mt-2.5">
                    Seconds
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-semibold text-slate-400 mt-2">
                <span>{progressPercent.toFixed(0)}% elapsed</span>
                <span>&bull;</span>
                <span>
                  {remainingSeconds <= 0
                    ? 'Exam Concluded'
                    : `${hours > 0 ? `${hours} hr ` : ''}${minutes} min ${seconds} sec remaining`}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-950/60 text-sm sm:text-base border border-emerald-500/50"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Exam</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-950/60 text-sm sm:text-base border border-amber-500/50"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold py-3.5 sm:py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 transition border border-slate-700 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset ({activeExam.durationMinutes >= 60 ? `${(activeExam.durationMinutes / 60).toFixed(activeExam.durationMinutes % 60 === 0 ? 0 : 1)}h` : `${activeExam.durationMinutes}m`})</span>
              </button>

              <button
                onClick={() => adjustTime(3600)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold py-3.5 sm:py-4 px-3 rounded-2xl flex items-center justify-center space-x-1.5 transition border border-slate-700 text-sm sm:text-base"
                title="Add 1 Hour to Clock"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>+1 Hour</span>
              </button>

              <button
                onClick={() => adjustTime(300)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold py-3.5 sm:py-4 px-3 rounded-2xl flex items-center justify-center space-x-1.5 transition border border-slate-700 text-sm sm:text-base"
                title="Add 5 Minutes to Clock"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>+5 Min</span>
              </button>

              <button
                onClick={() => adjustTime(60)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold py-3.5 sm:py-4 px-3 rounded-2xl flex items-center justify-center space-x-1.5 transition border border-slate-700 text-sm sm:text-base"
                title="Add 1 Minute to Clock"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+1 Min</span>
              </button>
            </div>

            {/* Quick Preset Buttons (15m, 30m, 45m, 1h, 1.5h, 2h, 2.5h, 3h, -1m, -5m, -1h) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-4 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                Preset Durations:
              </span>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {[
                  { label: '15m', mins: 15 },
                  { label: '30m', mins: 30 },
                  { label: '45m', mins: 45 },
                  { label: '1 Hr', mins: 60 },
                  { label: '1.5 Hr', mins: 90 },
                  { label: '2 Hr', mins: 120 },
                  { label: '2.5 Hr', mins: 150 },
                  { label: '3 Hr', mins: 180 }
                ].map(item => (
                  <button
                    key={item.mins}
                    onClick={() => setPresetDuration(item.mins)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition border ${
                      totalSeconds === item.mins * 60
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <span className="text-slate-600 px-1">|</span>
                <button
                  onClick={() => adjustTime(-60)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-bold flex items-center space-x-1"
                  title="Minus 1 minute"
                >
                  <Minus className="w-3 h-3 text-rose-400" />
                  <span>1m</span>
                </button>
                <button
                  onClick={() => adjustTime(-300)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-bold flex items-center space-x-1"
                  title="Minus 5 minutes"
                >
                  <Minus className="w-3 h-3 text-rose-400" />
                  <span>5m</span>
                </button>
                <button
                  onClick={() => adjustTime(-3600)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-bold flex items-center space-x-1"
                  title="Minus 1 hour"
                >
                  <Minus className="w-3 h-3 text-rose-400" />
                  <span>1h</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Hall Notice / Announcement Banner */}
          <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start space-x-3 max-w-2xl">
                <div className="bg-gradient-to-tr from-blue-600 to-blue-500 p-2.5 rounded-xl text-white shadow-md flex-shrink-0 mt-0.5">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-300">
                      Hall Instruction / Announcement
                    </h4>
                    <button
                      onClick={() => setIsEditingNotice(!isEditingNotice)}
                      className="text-slate-400 hover:text-white text-[11px] font-semibold underline ml-1"
                    >
                      {isEditingNotice ? 'Done' : 'Change Notice'}
                    </button>
                  </div>

                  {isEditingNotice ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={hallNotice}
                        onChange={e => setHallNotice(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Type announcement for exam hall..."
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_NOTICES.map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setHallNotice(preset);
                              setIsEditingNotice(false);
                            }}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 truncate max-w-[220px]"
                          >
                            Preset {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      {hallNotice}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Voice Announce & Ring Bell */}
              <div className="flex items-center space-x-2 ml-auto sm:ml-0 flex-shrink-0">
                <button
                  onClick={() => speakAnnouncement(voiceAnnouncementText)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950/60"
                  title="Speak 'Exam Time End' Announcement over Speakers"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Announce End</span>
                </button>

                <button
                  onClick={() => playSound('triple')}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-blue-900/40"
                  title="Ring Physical Triple Bell Chime"
                >
                  <Bell className="w-4 h-4 animate-bounce" />
                  <span>Ring Bell</span>
                </button>
              </div>
            </div>
          </div>

          {/* Smart Board Proctor Tools & Alarm Settings Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="font-bold text-slate-300">Screen Mode:</span>
                <button
                  onClick={() => setScreenMode('dark')}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    screenMode === 'dark' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Dark Hall
                </button>
                <button
                  onClick={() => setScreenMode('contrast')}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    screenMode === 'contrast' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  High Contrast
                </button>
                <button
                  onClick={() => setScreenMode('amoled')}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    screenMode === 'amoled' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  OLED Black
                </button>
              </div>

              {/* Sound & Alarm Toggles */}
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={alarm1MinEnabled}
                    onChange={e => setAlarm1MinEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span className="text-rose-400 font-bold">1-Min Alarm Sound</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={voiceAnnouncementEnabled}
                    onChange={e => setVoiceAnnouncementEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span className="text-emerald-400 font-bold">&quot;Exam Time End&quot; Voice</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoBell5Min}
                    onChange={e => setAutoBell5Min(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>5-Min Chime</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Routine Schedule & Quick Select (Hidden when Focus Mode is Active) */}
        {!focusMode && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
              
              {/* Header with Title and Add Exam */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-rose-500" />
                    <span>Exam Schedule &amp; Routine</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    FCPS &bull; BCS &bull; Residency &bull; Diploma
                  </p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsAddExamOpen(true)}
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 rounded-xl flex items-center space-x-1 transition shadow-md shadow-blue-900/40"
                    title="Add Custom Exam"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={handleClearAllExams}
                    className="text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600 p-1.5 rounded-xl border border-rose-800/40 transition"
                    title="Clear / Delete All Exams"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs: All, FCPS, BCS, Residency, Diploma */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 mb-2.5 text-[11px] scrollbar-none">
                {(['All', 'FCPS', 'BCS', 'Residency', 'Diploma'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap border ${
                      selectedCategoryFilter === cat
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white border-slate-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search subject, date, category..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Scrollable Schedule List with Delete Buttons */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filteredRoutine.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-3">
                    <p className="text-slate-400 text-xs">
                      No exams found in schedule.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setIsAddExamOpen(true)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        + Add New Exam
                      </button>
                      <button
                        onClick={handleRestoreDefaults}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Restore Defaults</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredRoutine.map((exam) => {
                    const isSelected = exam.id === activeExam.id;
                    const catStyle = CATEGORY_COLORS[exam.category || 'General'] || CATEGORY_COLORS.General;

                    return (
                      <div
                        key={exam.id}
                        onClick={() => selectExam(exam)}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group relative ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-500/80 shadow-lg shadow-blue-950/60 ring-1 ring-blue-500/40'
                            : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-1 flex-grow">
                          <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
                            {/* Category Pill */}
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                              {exam.category || 'EXAM'}
                            </span>

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                              isSelected ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-blue-400 border-slate-700'
                            }`}>
                              {exam.date}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {exam.day}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate" title={exam.topic}>
                            {exam.topic}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 block">
                              {exam.time}
                            </span>
                            <span className="text-[9px] text-slate-500 mt-0.5 block">
                              {exam.durationMinutes}m
                            </span>
                          </div>

                          {/* DELETE EXAM BUTTON */}
                          {deleteConfirmId === exam.id ? (
                            <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleDeleteExam(exam.id, e)}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow transition"
                                title="Confirm Delete"
                              >
                                Del
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-1 rounded-lg"
                                title="Cancel"
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(exam.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition opacity-80 group-hover:opacity-100"
                              title="Delete this exam from routine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Help & Routine Reset */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Click to load &bull; Trash to delete</span>
                </span>
                <button
                  onClick={handleRestoreDefaults}
                  className="text-[10px] font-semibold text-slate-400 hover:text-blue-400 transition"
                  title="Reset to default routine"
                >
                  Reset Defaults
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-3 px-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between container mx-auto">
        <div>
          <span className="font-bold text-slate-400">CPR Medical Academy</span> &bull; Exam Smart Timer (FCPS &bull; BCS &bull; Residency &bull; Diploma)
        </div>
        <div className="text-[11px] text-slate-500 mt-1 sm:mt-0">
          Smart Board Touch Screen &amp; Projector Optimized Display
        </div>
      </footer>

      {/* Exam End Takeover Screen / Banner */}
      {showEndTakeover && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-4 border-rose-600 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative">
            <button
              onClick={() => setShowEndTakeover(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-4 text-rose-500 animate-bounce">
              <Megaphone className="w-10 h-10" />
            </div>

            <span className="bg-rose-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Official Hall Announcement
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-2 glow-red">
              EXAM TIME HAS ENDED!
            </h2>
            <p className="text-lg sm:text-xl font-bold text-rose-300 mb-6">
              STOP WRITING IMMEDIATELY &bull; PUT DOWN YOUR PENS
            </p>

            <div className="bg-slate-950/80 border border-rose-900/60 rounded-2xl p-4 text-slate-300 text-sm mb-6 leading-relaxed">
              Examinees must remain seated. Fasten all script sheets securely and wait for the invigilator to collect the papers.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => speakAnnouncement(voiceAnnouncementText)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl flex items-center space-x-2 text-sm sm:text-base shadow-lg shadow-emerald-950/60"
              >
                <Mic className="w-5 h-5" />
                <span>Repeat Voice: &quot;Exam Time End&quot;</span>
              </button>

              <button
                onClick={() => playSound('triple')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center space-x-2 text-sm sm:text-base shadow-lg shadow-blue-950/60"
              >
                <Bell className="w-5 h-5" />
                <span>Ring Gong Bell</span>
              </button>

              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl flex items-center space-x-2 text-sm sm:text-base border border-slate-700"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset Timer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Settings / Configure Active Timer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" />
              <span>Exam Timer Configuration</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure current exam details, sound chimes, and delete past exams if needed.
            </p>

            <div className="space-y-4">
              {routine.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Select From Scheduled Routine
                  </label>
                  <select
                    value={selectedRoutineIndex}
                    onChange={handleRoutineSelectChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {routine.map((exam, index) => (
                      <option key={exam.id} value={index}>
                        [{exam.category}] {exam.date} ({exam.day}) - {exam.topic}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Active Exam Topic Name
                  </label>
                  <input
                    type="text"
                    value={modalTopic}
                    onChange={e => setModalTopic(e.target.value)}
                    placeholder="e.g. FCPS Surgery Paper 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Exam Course
                  </label>
                  <select
                    value={modalCategory}
                    onChange={e => setModalCategory(e.target.value as ExamCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="FCPS">FCPS</option>
                    <option value="BCS">BCS</option>
                    <option value="Residency">Residency</option>
                    <option value="Diploma">Diploma</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Exam Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={modalDuration}
                    onChange={e => setModalDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="300"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={modalTime}
                    onChange={e => setModalTime(e.target.value)}
                    placeholder="3.00 - 3.30 PM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Spoken Voice Announcement Config */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Spoken Voice Message on Exam End
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakAnnouncement(voiceAnnouncementText)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20"
                  >
                    Test Voice
                  </button>
                </div>
                <input
                  type="text"
                  value={voiceAnnouncementText}
                  onChange={e => setVoiceAnnouncementText(e.target.value)}
                  placeholder="Exam Time End! Stop writing and put down your pens."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sound Test Panel */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => playSound('alarm_1min')}
                    className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 font-bold"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Test 1-Min Alarm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playSound('triple')}
                    className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 font-bold"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Test Gong Bell</span>
                  </button>
                </div>

                {/* Delete active exam shortcut button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${activeExam.topic}" from routine?`)) {
                      handleDeleteExam(activeExam.id);
                      setIsSettingsOpen(false);
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Active Exam</span>
                </button>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplySettings}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-900/40"
                >
                  Apply &amp; Load Timer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Exam to Routine */}
      {isAddExamOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewExam}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsAddExamOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-rose-500" />
              <span>Add Exam to Routine</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Create a custom test for FCPS, BCS, Residency, or Diploma candidates.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Exam Topic / Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    placeholder="e.g. FCPS Surgery Paper 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Course
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ExamCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="FCPS">FCPS</option>
                    <option value="BCS">BCS</option>
                    <option value="Residency">Residency</option>
                    <option value="Diploma">Diploma</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Date (e.g. 05/11/26)
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    placeholder="05/11/26"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Day
                  </label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={e => setNewDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="300"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="3.00 - 3.30 PM"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg shadow-rose-900/40"
                >
                  Save &amp; Add Exam
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
