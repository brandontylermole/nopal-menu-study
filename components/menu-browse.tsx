"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { menuItems, CATEGORIES } from "@/lib/menu-data";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MenuBrowse() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return menuItems.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    });
  }, [search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filtered.map((i) => i.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const categoryOrder = CATEGORIES.filter((c) => c.id !== "all").map(
    (c) => c.id
  );

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search dishes or ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus:border-green-400 rounded-xl h-11"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
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

      {/* Controls */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "item" : "items"} found
        </span>
        <div className="flex gap-3">
          <button
            onClick={expandAll}
            className="hover:text-green-700 transition-colors"
          >
            Expand all
          </button>
          <span>·</span>
          <button
            onClick={collapseAll}
            className="hover:text-green-700 transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No dishes found for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryOrder
            .filter((catId) => grouped[catId])
            .map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId)!;
              const items = grouped[catId];
              return (
                <div key={catId}>
                  <h3 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                    <span className="text-gray-400 font-normal text-sm">
                      ({items.length})
                    </span>
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const isOpen = expandedIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            onClick={() => toggleExpand(item.id)}
                          >
                            <div>
                              <span className="font-semibold text-gray-800">
                                {item.name}
                              </span>
                              {item.notes && (
                                <span className="ml-2 text-xs text-amber-500">
                                  {item.notes}
                                </span>
                              )}
                              {!isOpen && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                                  {item.ingredients.slice(0, 3).join(", ")}
                                  {item.ingredients.length > 3 ? "..." : ""}
                                </p>
                              )}
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 bg-green-50 border-t border-green-100">
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.ingredients.map((ing, i) => (
                                      <span
                                        key={i}
                                        className={cn(
                                          "text-xs px-2.5 py-1 rounded-full font-medium",
                                          i === 0
                                            ? "bg-green-700 text-white"
                                            : "bg-white text-green-800 border border-green-200"
                                        )}
                                      >
                                        {ing}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
