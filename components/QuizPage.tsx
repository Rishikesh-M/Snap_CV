import React, { useState, useEffect } from 'react';
import { UserPortfolio } from '../types.ts';

interface QuizPageProps {
    currentUserPortfolio: UserPortfolio | null;
    onUpdateStats: (points: number, level: number) => Promise<void>;
    onBack: () => void;
}

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number; // index
    points: number;
}

const LEVEL_THRESHOLDS = Array.from({ length: 15 }, (_, i) => (i + 1) * 1000);

const QUESTIONS_POOL: Question[] = [
    { id: 1, text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Mode Language"], correctAnswer: 0, points: 100 },
    { id: 2, text: "Which language runs in the browser?", options: ["Java", "C#", "JavaScript"], correctAnswer: 2, points: 100 },
    { id: 3, text: "What is React?", options: ["A Database", "A JavaScript Library", "An Operating System"], correctAnswer: 1, points: 100 },
    { id: 4, text: "CSS stands for?", options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets"], correctAnswer: 2, points: 100 },
    { id: 5, text: "Which tag is used for links?", options: ["<div>", "<a>", "<p>"], correctAnswer: 1, points: 100 },
    { id: 6, text: "What is git?", options: ["A Version Control System", "A Text Editor", "A Programming Language"], correctAnswer: 0, points: 100 },
    { id: 7, text: "HTTP starts with?", options: ["tcp://", "http://", "ftp://"], correctAnswer: 1, points: 100 },
    { id: 8, text: "Which company developed TypeScript?", options: ["Google", "Facebook", "Microsoft"], correctAnswer: 2, points: 100 },
    { id: 9, text: "What is an API?", options: ["Application Programming Interface", "Apple Phone Integration", "Advanced Peripheral Interface"], correctAnswer: 0, points: 100 },
    { id: 10, text: "JSON starts with?", options: ["{", "[", "<"], correctAnswer: 0, points: 100 },
    // Add more to allow higher levels, or reuse them for demo
];

// Helper to get questions for a level (simulation)
const getQuestionsForLevel = (level: number) => {
    // In a real app, you'd have disparate pools or fetch from AI
    // For now, we cycle through the pool
    return QUESTIONS_POOL.map(q => ({ ...q, id: q.id + level * 100, points: 100 + (level - 1) * 50 }));
};

const QuizPage: React.FC<QuizPageProps> = ({ currentUserPortfolio, onUpdateStats, onBack }) => {
    const [currentLevel, setCurrentLevel] = useState(currentUserPortfolio?.quizStats?.level || 1);
    const [totalPoints, setTotalPoints] = useState(currentUserPortfolio?.quizStats?.points || 0);
    const [levelPoints, setLevelPoints] = useState(0);

    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER'>('START');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            setQuestions(getQuestionsForLevel(currentLevel));
            setCurrentQIndex(0);
            setLevelPoints(0);
        }
    }, [gameState, currentLevel]);

    const handleStartLevel = () => {
        setGameState('PLAYING');
    };

    const handleAnswer = (optionIndex: number) => {
        setSelectedOption(optionIndex);
        const currentQ = questions[currentQIndex];

        if (optionIndex === currentQ.correctAnswer) {
            setFeedback('CORRECT');
            setTimeout(() => {
                const newLevelPoints = levelPoints + currentQ.points;
                setLevelPoints(newLevelPoints);

                // Check Level Completion
                if (newLevelPoints >= 1000) {
                    handleLevelComplete(newLevelPoints);
                } else {
                    nextQuestion();
                }
            }, 1000);
        } else {
            setFeedback('WRONG');
            setTimeout(() => {
                setGameState('GAME_OVER'); // Or just lose a life
            }, 1000);
        }
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setFeedback(null);
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            // Ran out of questions but didn't reach threshold? 
            // In this simple implementation, we just loop or end content.
            // Let's reset index to keep playing for points until 1000
            setCurrentQIndex(0);
        }
    };

    const handleLevelComplete = async (pointsEarned: number) => {
        const newTotalPoints = totalPoints + pointsEarned;
        const nextLevel = currentLevel + 1;

        setTotalPoints(newTotalPoints);
        setCurrentLevel(nextLevel);
        setGameState('LEVEL_COMPLETE');

        await onUpdateStats(newTotalPoints, nextLevel);
    };

    if (!currentUserPortfolio) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="bg-glass p-10 rounded-3xl text-center space-y-6 max-w-md mx-4 border border-white/5">
                    <h2 className="text-3xl font-black text-white">Identity Required</h2>
                    <p className="text-slate-400">You need to have an active portfolio to participate in the Quiz Arena.</p>
                    <button onClick={onBack} className="purple-gradient px-8 py-3 rounded-xl font-bold text-white uppercase tracking-widest">Return to Base</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 container mx-auto flex items-center justify-center">
            <div className="w-full max-w-2xl">

                {/* Header Stats */}
                <div className="flex justify-between items-center mb-8 bg-glass p-6 rounded-3xl border border-white/5">
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Current Level</p>
                        <p className="text-3xl font-black text-white">Lvl {currentLevel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total XP</p>
                        <p className="text-3xl font-black text-purple-400">{totalPoints}</p>
                    </div>
                </div>

                {gameState === 'START' && (
                    <div className="bg-glass p-8 sm:p-12 rounded-[40px] border border-white/5 text-center space-y-8 animate-in fade-in zoom-in">
                        <div className="space-y-4">
                            <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-white">QUIZ ARENA</h1>
                            <p className="text-slate-400 font-medium text-lg">Test your knowledge. Ascend the ranks. Prove your worth.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-2xl font-black text-white">15</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500">Max Levels</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-2xl font-black text-white">1000</div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500">XP to Advance</div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleStartLevel}
                                className="w-full sm:w-auto px-12 py-5 purple-gradient rounded-2xl font-black text-white shadow-xl shadow-purple-600/20 hover:scale-105 transition-all uppercase tracking-[0.2em]"
                            >
                                Start Level {currentLevel}
                            </button>
                        </div>
                        <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Exit Arena</button>
                    </div>
                )}

                {gameState === 'PLAYING' && questions.length > 0 && (
                    <div className="bg-glass p-8 sm:p-12 rounded-[40px] border border-white/5 space-y-8 animate-in slide-in-from-bottom-8">
                        <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-widest">Question {currentQIndex + 1}</span>
                            <span className="text-purple-400 font-black text-sm uppercase tracking-widest">Pot: {questions[currentQIndex].points} XP</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                            {questions[currentQIndex].text}
                        </h2>

                        <div className="space-y-4 pt-4">
                            {questions[currentQIndex].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => !selectedOption && handleAnswer(i)}
                                    disabled={selectedOption !== null}
                                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden
                                ${selectedOption === i
                                            ? feedback === 'CORRECT'
                                                ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                                : 'bg-red-500/20 border-red-500/50 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                                        }
                            `}
                                >
                                    <span className="relative z-10 font-bold tracking-wide">{opt}</span>
                                    {selectedOption === i && feedback === 'CORRECT' && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-emerald-500 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-in zoom-in">Correct</div>
                                    )}
                                    {selectedOption === i && feedback === 'WRONG' && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-red-500 text-red-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-in zoom-in">Wrong</div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="pt-4">
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-purple-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${(levelPoints / 1000) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                <span>Progress</span>
                                <span>{levelPoints} / 1000 XP</span>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'LEVEL_COMPLETE' && (
                    <div className="bg-glass p-8 sm:p-12 rounded-[40px] border border-white/5 text-center space-y-8 animate-in zoom-in">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 border border-emerald-500/30">
                            🏆
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white">Level Complete!</h2>
                            <p className="text-slate-400">You have ascended to Level {currentLevel}.</p>
                        </div>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400">
                            +{levelPoints} XP
                        </div>
                        <div className="pt-8 flex flex-col gap-4">
                            <button
                                onClick={() => {
                                    if (currentLevel < 15) {
                                        handleStartLevel();
                                    } else {
                                        alert("You are the Grandmaster! Max Level Reached.");
                                        onBack();
                                    }
                                }}
                                className="w-full px-12 py-5 bg-white text-black rounded-2xl font-black hover:scale-105 transition-all uppercase tracking-[0.2em]"
                            >
                                {currentLevel < 15 ? 'Next Level' : 'Claim Victory'}
                            </button>
                            <button onClick={onBack} className="text-slate-500 hover:text-white text-xs uppercase tracking-widest font-bold">Return to Menu</button>
                        </div>
                    </div>
                )}

                {gameState === 'GAME_OVER' && (
                    <div className="bg-glass p-8 sm:p-12 rounded-[40px] border border-white/5 text-center space-y-8 animate-in zoom-in">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 border border-red-500/30">
                            💀
                        </div>
                        <h2 className="text-4xl font-black text-white">Eliminated</h2>
                        <p className="text-slate-400">Your journey ends here for now.</p>
                        <div className="pt-8">
                            <button
                                onClick={() => {
                                    setLevelPoints(0);
                                    setGameState('START');
                                }}
                                className="px-12 py-4 border border-white/20 rounded-2xl font-bold text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
