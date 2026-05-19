"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuFlashcard } from "@/components/menu-flashcard";
import { MenuQuiz } from "@/components/menu-quiz";
import { MenuBrowse } from "@/components/menu-browse";
import { menuItems, CATEGORIES } from "@/lib/menu-data";

export default function MenuStudyApp() {
  const totalItems = menuItems.length;
  const categoryCounts = CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
    ...cat,
    count: menuItems.filter((m) => m.category === cat.id).length,
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf6ec" }}>
      {/* Header */}
      <header
        className="py-8 px-4 shadow-md"
        style={{ backgroundColor: "#1a4d2e" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                🌵 NOPAL
              </h1>
              <p className="text-green-300 text-sm font-medium mt-0.5">
                Menu Study Guide
              </p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-2xl">{totalItems}</p>
              <p className="text-green-300 text-xs">dishes to learn</p>
            </div>
          </div>

          {/* Category quick stats */}
          <div className="flex flex-wrap gap-2 mt-5">
            {categoryCounts.map((cat) => (
              <div
                key={cat.id}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#a7f3d0" }}
              >
                {cat.emoji} {cat.name} ({cat.count})
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Tabs defaultValue="flashcards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            <TabsTrigger
              value="flashcards"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-green-700 data-[state=active]:text-white"
            >
              🃏 Flashcards
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-green-700 data-[state=active]:text-white"
            >
              🧠 Quiz
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-green-700 data-[state=active]:text-white"
            >
              📋 Browse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards">
            <div className="bg-white/60 rounded-2xl p-1">
              <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                <p className="text-sm text-amber-700 font-medium">
                  💡 <strong>How to use:</strong> Click a card to reveal its ingredients. Hit "Got it!" to mark it as known and move on. Filter by category to focus your study.
                </p>
              </div>
              <MenuFlashcard />
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="bg-white/60 rounded-2xl p-1">
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">
                  🧠 <strong>Quiz mode:</strong> You'll see a dish name and 4 possible ingredient sets. Pick the one that matches. 10 questions per round!
                </p>
              </div>
              <MenuQuiz />
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <div className="bg-white/60 rounded-2xl p-1">
              <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-100">
                <p className="text-sm text-purple-700 font-medium">
                  📋 <strong>Reference mode:</strong> Browse all {totalItems} dishes. Search by dish name or ingredient. Click any dish to expand its ingredients.
                </p>
              </div>
              <MenuBrowse />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
