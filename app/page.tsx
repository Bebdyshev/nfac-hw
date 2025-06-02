"use client";

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SunIcon, MoonIcon } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReactConfetti from 'react-confetti';

// Theme Context
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DURATION_OPTIONS = [10, 20, 30];

interface Quote {
  id: number;
  text: string;
  author: string;
}

// Theme Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('appTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main Home Component
function TimerComponent() {
  const { theme, toggleTheme } = useContext(ThemeContext)!;
  const [showConfetti, setShowConfetti] = useState(false);

  const [name, setName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [timeLeft, setTimeLeft] = useState(selectedDuration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fetchedQuote, setFetchedQuote] = useState<Quote | null>(null);
  const [showNameAlert, setShowNameAlert] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardVelocity, setCardVelocity] = useState({ dx: 1, dy: 1 });
  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });
  const [isCardInitialized, setIsCardInitialized] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isMovingToCenter, setIsMovingToCenter] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    const storedName = localStorage.getItem('timerUserName');
    if (storedName) setName(storedName);
    setCompletionCount(parseInt(localStorage.getItem('timerCompletionCount') || '0', 10));
  }, []);

  useEffect(() => { if (name && isClientMounted) localStorage.setItem('timerUserName', name); }, [name, isClientMounted]);

  const fetchNewQuote = async () => {
    setFetchedQuote(null);
    try {
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Failed to fetch quote');
      const quoteData: Quote = await response.json();
      setFetchedQuote(quoteData);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setFetchedQuote({ id: 0, text: "Keep it up! Every step forward is progress.", author: "Your App" });
    }
  };

  useEffect(() => {
    let timerIntervalId: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      timerIntervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      setShowConfetti(true);
      fetchNewQuote();
      if (isClientMounted) {
        const newCount = parseInt(localStorage.getItem('timerCompletionCount') || '0', 10) + 1;
        localStorage.setItem('timerCompletionCount', newCount.toString());
        setCompletionCount(newCount);
      }
      setTimeout(() => setShowConfetti(false), 5000);
    }
    return () => { if (timerIntervalId) clearInterval(timerIntervalId); };
  }, [isActive, timeLeft, isClientMounted]);

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement && isClientMounted) {
      const updateDimensionsAndPos = () => {
        const width = cardElement.offsetWidth;
        const height = cardElement.offsetHeight;
        setCardDimensions({ width, height });
        if (!isCardInitialized) {
           setCardPosition({ x: (window.innerWidth - width) / 2, y: (window.innerHeight - height) / 2 });
           setIsCardInitialized(true);
        }
      };
      updateDimensionsAndPos();
      const resizeObserver = new ResizeObserver(updateDimensionsAndPos);
      resizeObserver.observe(cardElement);
      window.addEventListener('resize', updateDimensionsAndPos);
      return () => {
        resizeObserver.unobserve(cardElement);
        window.removeEventListener('resize', updateDimensionsAndPos);
      };
    }
  }, [isClientMounted, isCardInitialized]);

  useEffect(() => {
    if (!isClientMounted || !isCardInitialized || cardDimensions.width === 0) return;
    let animationFrameId: number;
    if (!isActive) { 
      setIsMovingToCenter(true);
      const targetX = (window.innerWidth - cardDimensions.width) / 2;
      const targetY = (window.innerHeight - cardDimensions.height) / 2;
      const animate = () => {
        if (!isMovingToCenter && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          return;
        }
        setCardPosition(prevPos => {
          const dx = targetX - prevPos.x;
          const dy = targetY - prevPos.y;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            setIsMovingToCenter(false);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            return { x: targetX, y: targetY };
          }
          return { x: prevPos.x + dx * 0.08, y: prevPos.y + dy * 0.08 };
        });
        if (isMovingToCenter) animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    } else {
      setIsMovingToCenter(false); 
      const animate = () => {
        setCardPosition(prevPos => {
          let newX = prevPos.x + cardVelocity.dx;
          let newY = prevPos.y + cardVelocity.dy;
          let newDx = cardVelocity.dx;
          let newDy = cardVelocity.dy;
          if (newX <= 0 || newX + cardDimensions.width >= window.innerWidth) newDx = -newDx;
          if (newY <= 0 || newY + cardDimensions.height >= window.innerHeight) newDy = -newDy;
          newX = Math.max(0, Math.min(newX, window.innerWidth - cardDimensions.width));
          newY = Math.max(0, Math.min(newY, window.innerHeight - cardDimensions.height));
          if (newDx !== cardVelocity.dx || newDy !== cardVelocity.dy) setCardVelocity({ dx: newDx, dy: newDy });
          return { x: newX, y: newY };
        });
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isClientMounted, isCardInitialized, cardDimensions, cardVelocity, isMovingToCenter]);

  const handleStart = () => {
    if (name.trim() === '') {
      setShowNameAlert(true);
      return;
    }
    setTimeLeft(selectedDuration);
    setIsActive(true);
    setIsCompleted(false);
    setFetchedQuote(null);
    setIsMovingToCenter(false); 

    if (isClientMounted && cardDimensions.width > 0 && cardDimensions.height > 0) {
      setCardPosition({
        x: (window.innerWidth - cardDimensions.width) / 2,
        y: (window.innerHeight - cardDimensions.height) / 2,
      });
      setCardVelocity({ 
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5
      });
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(selectedDuration);
    setFetchedQuote(null);
    setShowConfetti(false);
  };

  const progressValue = isActive && isClientMounted ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0;

  return (
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden text-slate-800 dark:text-white transition-colors duration-300 ease-in-out">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <AlertDialog open={showNameAlert} onOpenChange={setShowNameAlert}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Требуется имя</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Пожалуйста, введите ваше имя, чтобы начать таймер.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNameAlert(false)} className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card
        ref={cardRef}
        className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-2xl transition-opacity duration-300"
        style={ isClientMounted ? {
          position: 'absolute',
          left: `${cardPosition.x}px`,
          top: `${cardPosition.y}px`,
          width: cardDimensions.width > 0 ? `${cardDimensions.width}px` : 'auto',
          visibility: isCardInitialized ? 'visible' : 'hidden',
          opacity: isCardInitialized ? 1 : 0,
        } : {
          position: 'absolute',
          visibility: 'hidden',
          opacity: 0,
        }}
      >
        <CardHeader className="text-center relative pt-6 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400">
            Таймер-Мотиуатор
          </CardTitle>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="absolute top-3 right-3 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5 text-yellow-400" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && (
            <div className="px-1 pt-1">
              <Progress value={progressValue} className="w-full h-2 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-teal-500 dark:[&>div]:from-green-400 dark:[&>div]:to-teal-400" />
            </div>
          )}

          {!isCompleted && !isActive && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Введите ваше имя:
                </label>
                <Input
                  type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Например, Керей"
                  className="bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Выберите время (сек):
                </label>
                <Select value={selectedDuration.toString()} onValueChange={(val) => { const dur = parseInt(val); setSelectedDuration(dur); if (!isActive) setTimeLeft(dur); }}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-purple-500">
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                    {DURATION_OPTIONS.map(opt => <SelectItem key={opt} value={opt.toString()} className="hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700">{opt} секунд</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="text-center animate-fadeInScaleUp space-y-3">
              {fetchedQuote ? (
                <>
                  <p className="text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400">
                    {name}, ты справился!
                  </p>
                  <blockquote className="mt-2 p-3 border-l-4 border-green-500 dark:border-green-400 bg-slate-50 dark:bg-slate-700/50 rounded-r-md">
                    <p className="italic text-slate-700 dark:text-slate-300 text-sm sm:text-base">"{fetchedQuote.text}"</p>
                    <footer className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">- {fetchedQuote.author}</footer>
                  </blockquote>
                </>
              ) : (
                <p className="text-xl sm:text-2xl font-semibold text-green-600 dark:text-green-400">
                  Загрузка цитаты...
                </p>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300">Вы успешно завершили таймер {completionCount} раз(а)!</p>
              <Button onClick={handleReset} variant="outline"
                className="mt-2 bg-yellow-400 hover:bg-yellow-500 border-yellow-400 hover:border-yellow-500 text-slate-900 font-semibold hover:text-slate-900 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:border-yellow-500 dark:hover:border-yellow-600 dark:text-slate-900 dark:hover:text-slate-900 py-2 px-4 text-sm sm:text-base"
              > Попробовать ещё раз </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {isActive && (
                <div className="animate-pulseFast">
                  <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-1"> {name}, осталось: </p>
                  <p className="text-5xl sm:text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400">
                    {timeLeft}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-2">
                {!isActive && (
                  <Button onClick={handleStart} disabled={!isCardInitialized || (isActive || name.trim() === '')} size="lg" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold w-full sm:w-auto disabled:opacity-60 py-3 text-base sm:text-lg">
                    Старт таймера
                  </Button>
                )}
                {isActive && (
                  <Button onClick={handleReset} variant="destructive" size="lg" className="w-full sm:w-auto py-3 text-base sm:text-lg">
                    Сброс
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        {(isClientMounted && !isCompleted && !isActive && completionCount > 0) && (
           <CardFooter className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 justify-center pb-3 pt-2">
                <p>Вы уже завершили таймер {completionCount} раз(а). Так держать!</p>
           </CardFooter>
        )}
      </Card>
      <style jsx global>{`
        @keyframes fadeInScaleUp { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        .animate-fadeInScaleUp { animation: fadeInScaleUp 0.5s ease-out forwards; }
        @keyframes pulseFast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.02); } }
        .animate-pulseFast { animation: pulseFast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </main>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <TimerComponent />
    </ThemeProvider>
  );
}
