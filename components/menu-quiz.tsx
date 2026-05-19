"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { menuItems, CATEGORIES } from "@/lib/menu-data";
import { CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const QUIZ_LENGTH = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface QuizQuestion {
  item: (typeof menuItems)[0];
  options: { id: string; label: string; isCorrect: boolean }[];
}

function buildQuestions(categoryId: string): QuizQuestion[] {
  const pool =
    categoryId === "all"
      ? menuItems
      : menuItems.filter((m) => m.category === categoryId);

  const selected = shuffle(pool).slice(0, QUIZ_LENGTH);

  return selected.map((item) => {
    const wrongs = shuffle(
      menuItems.filter((m) => m.id !== item.id)
    ).slice(0, 3);

    const options = shuffle([
      {
        id: item.id,
        label: item.ingredients.slice(0, 5).join(", "),
        isCorrect: true,
      },
      ...wrongs.map((w) => ({
        id: w.id,
        label: w.ingredients.slice(0, 5).join(", "),
        isCorrect: false,
      })),
    ]);

    return { item, options };
  });
}

export function MenuQuiz() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildQuestions("all")
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  const question = questions[currentQ];
  const isAnswered = selectedId !== null;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    restart(cat);
  };

  const restart = useCallback((cat?: string) => {
    const c = cat ?? selectedCategory;
    setQuestions(buildQuestions(c));
    setCurrentQ(0);
    setSelectedId(null);
    setScore(0);
    setAnswers([]);
    setQuizDone(false);
  }, [selectedCategory]);

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    setSelectedId(optionId);
    const isCorrect = question.options.find((o) => o.id === optionId)?.isCorrect ?? false;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizDone(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedId(null);
    }
  };

  const progress = ((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100;

  const grade = () => {
    const pct = (score / questions.length) * 100;
    if (pct === 100) return { label: "Perfect! 🌟", color: "text-yellow-600" };
    if (pct >= 80) return { label: "Great job! 🎉", color: "text-green-600" };
    if (pct >= 60) return { label: "Good effort! 💪", color: "text-blue-600" };
    return { label: "Keep practicing! 📚", color: "text-orange-600" };
  };

  if (quizDone) {
    const { label, color } = grade();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
        <div>
          <p className={cn("text-3xl font-bold", color)}>{label}</p>
          <p className="text-5xl font-black text-gray-800 mt-2">
            {score}/{questions.length}
          </p>
          <p className="text-gray-500 mt-1">
            {Math.round((score / questions.length) * 100)}% correct
          </p>
        </div>

        {/* Answer breakdown */}
        <div className="flex justify-center gap-2 flex-wrap">
          {answers.map((correct, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                correct ? "bg-green-500" : "bg-red-400"
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <Button
          onClick={() => restart()}
          className="bg-green-700 hover:bg-green-800 gap-2 text-lg px-8 py-6"
        >
          <RotateCcw className="w-5 h-5" /> Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              selectedCategory === cat.id
                ? "bg-green-700 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-700"
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Question{" "}
          <span className="font-bold text-gray-800">{currentQ + 1}</span>/{questions.length}
        </span>
        <span className="text-green-700 font-semibold">
          ✓ {score} correct
        </span>
      </div>
      <Progress value={progress} className="h-1.5 bg-gray-100" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border-2 border-green-100 shadow p-6 text-center">
            <Badge
              variant="secondary"
              className="mb-3 bg-green-50 text-green-700 border-green-200"
            >
              {CATEGORIES.find((c) => c.id === question.item.category)?.emoji}{" "}
              {CATEGORIES.find((c) => c.id === question.item.category)?.name}
            </Badge>
            <p className="text-sm text-gray-400 mb-1">Which ingredients belong to...</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {question.item.name}
            </h2>
            {question.item.notes && (
              <p className="text-xs text-amber-500 mt-1">{question.item.notes}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option) => {
              const isSelected = selectedId === option.id;
              const showResult = isAnswered;
              const isCorrect = option.isCorrect;

              let cardClass =
                "w-full text-left p-4 rounded-xl border-2 transition-all text-sm leading-relaxed ";
              if (!showResult) {
                cardClass += isSelected
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50 cursor-pointer";
              } else if (isCorrect) {
                cardClass += "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected && !isCorrect) {
                cardClass += "border-red-400 bg-red-50 text-red-700";
              } else {
                cardClass += "border-gray-100 bg-gray-50 text-gray-400";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={cardClass}
                  disabled={isAnswered}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {showResult && isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2",
                            isSelected ? "border-green-500 bg-green-500" : "border-gray-300"
                          )}
                        />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback + Next */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div
                  className={cn(
                    "rounded-xl p-4 text-sm font-medium text-center",
                    answers[answers.length - 1]
                      ? "bg-green-100 text-green-800"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {answers[answers.length - 1] ? (
                    <>✅ Correct! Great memory!</>
                  ) : (
                    <>
                      ❌ Not quite. The correct ingredients are:{" "}
                      <span className="font-semibold">
                        {question.item.ingredients.join(", ")}
                      </span>
                    </>
                  )}
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  {currentQ + 1 >= questions.length
                    ? "See Results 🏆"
                    : "Next Question →"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
