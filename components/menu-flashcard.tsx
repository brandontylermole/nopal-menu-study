"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { menuItems, CATEGORIES } from "@/lib/menu-data";
import { ChevronLeft, ChevronRight, Check, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function MenuFlashcard() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [showOnlyUnknown, setShowOnlyUnknown] = useState(false);

  const filteredItems = useMemo(() => {
    let items =
      selectedCategory === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === selectedCategory);
    if (showOnlyUnknown) {
      items = items.filter((item) => !knownIds.has(item.id));
    }
    return items;
  }, [selectedCategory, showOnlyUnknown, knownIds]);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredItems.length - 1));
  const currentItem = filteredItems[safeIndex];

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((i) =>
      Math.min(i + 1, filteredItems.length - 1)
    );
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const markKnown = useCallback(() => {
    if (!currentItem) return;
    setKnownIds((prev) => new Set([...prev, currentItem.id]));
    if (safeIndex < filteredItems.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentItem, safeIndex, filteredItems.length]);

  const resetAll = useCallback(() => {
    setKnownIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowOnlyUnknown(false);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const totalKnown = knownIds.size;
  const progress = filteredItems.length > 0 ? (safeIndex / Math.max(filteredItems.length - 1, 1)) * 100 : 0;

  return (
    <div className="space-y-6">
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

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Card{" "}
          <span className="font-bold text-gray-800">
            {filteredItems.length > 0 ? safeIndex + 1 : 0}
          </span>{" "}
          of <span className="font-bold text-gray-800">{filteredItems.length}</span>
        </span>
        <div className="flex items-center gap-3">
          {totalKnown > 0 && (
            <span className="text-green-600 font-medium">
              ✓ {totalKnown} known
            </span>
          )}
          <button
            onClick={() => {
              setShowOnlyUnknown((v) => !v);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs border transition-all",
              showOnlyUnknown
                ? "bg-amber-100 border-amber-400 text-amber-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
            )}
          >
            {showOnlyUnknown ? "Showing unknown only" : "Show unknown only"}
          </button>
          <button
            onClick={resetAll}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Progress value={progress} className="h-1.5 bg-gray-100" />

      {/* Card */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-semibold text-gray-700">
            You know them all!
          </p>
          <p className="text-gray-400 mt-2">
            {totalKnown} items marked as known
          </p>
          <Button onClick={resetAll} className="mt-6 bg-green-700 hover:bg-green-800">
            Start Over
          </Button>
        </div>
      ) : (
        <>
          <div
            className="relative cursor-pointer select-none"
            style={{ minHeight: "320px" }}
            onClick={() => setIsFlipped((f) => !f)}
          >
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white border-2 border-green-100 shadow-lg p-8"
                >
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-green-50 text-green-700 border-green-200"
                  >
                    {CATEGORIES.find((c) => c.id === currentItem.category)?.emoji}{" "}
                    {CATEGORIES.find((c) => c.id === currentItem.category)?.name}
                  </Badge>
                  <h2 className="text-3xl font-bold text-center text-gray-800">
                    {currentItem.name}
                  </h2>
                  {currentItem.notes && (
                    <p className="mt-3 text-sm text-amber-600 font-medium text-center">
                      {currentItem.notes}
                    </p>
                  )}
                  <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Click to reveal ingredients</span>
                  </div>
                  {knownIds.has(currentItem.id) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col rounded-2xl bg-green-800 text-white shadow-lg p-8 overflow-y-auto"
                >
                  <p className="text-green-300 text-sm font-medium mb-4 text-center">
                    🥘 Ingredients
                  </p>
                  <ul className="space-y-2 flex-1">
                    {currentItem.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-base"
                      >
                        <span className="text-green-400 mt-1 shrink-0">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-green-400 text-xs text-center mt-4">
                    Click to flip back
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={safeIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                markKnown();
              }}
              className="flex-1 bg-green-700 hover:bg-green-800 gap-2"
              disabled={knownIds.has(currentItem.id)}
            >
              <Check className="w-4 h-4" />
              {knownIds.has(currentItem.id) ? "Already known ✓" : "Got it!"}
            </Button>

            <Button
              variant="outline"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={safeIndex === filteredItems.length - 1}
              className="gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
