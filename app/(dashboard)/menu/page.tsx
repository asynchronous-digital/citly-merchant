"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  return (
    <>
      <PageHeader 
        title="Menu Management" 
        description="Manage your items, categories, and pricing."
      >
        <Button onClick={() => setIsAddItemOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </PageHeader>

      <div className="flex gap-6">
        {/* Categories Sidebar */}
        <div className="w-48 shrink-0 hidden md:block">
          <div className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-3">
            Categories
          </div>
          <div className="space-y-1">
            <CategoryLink name="All Items" count={124} active={activeCategory === "All Items"} onClick={() => setActiveCategory("All Items")} />
            <CategoryLink name="Starters" count={18} active={activeCategory === "Starters"} onClick={() => setActiveCategory("Starters")} />
            <CategoryLink name="Main Course" count={45} active={activeCategory === "Main Course"} onClick={() => setActiveCategory("Main Course")} />
            <CategoryLink name="Desserts" count={12} active={activeCategory === "Desserts"} onClick={() => setActiveCategory("Desserts")} />
            <CategoryLink name="Beverages" count={34} active={activeCategory === "Beverages"} onClick={() => setActiveCategory("Beverages")} />
            <CategoryLink name="Add-ons" count={15} active={activeCategory === "Add-ons"} onClick={() => setActiveCategory("Add-ons")} />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 border-dashed"
            onClick={() => setIsAddCategoryOpen(true)}
          >
            + New Category
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input placeholder="Search menu items..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems
              .filter(item => activeCategory === "All Items" || item.category === activeCategory)
              .map((item, idx) => (
                <MenuItemCard 
                  key={idx}
                  name={item.name} 
                  category={item.category}
                  price={item.price}
                  status={item.status}
                  tags={item.tags}
                  emoji={item.emoji}
                />
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add New Menu Item">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Item Name</label>
            <Input placeholder="e.g. Garlic Bread" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Price</label>
              <Input placeholder="0.00" type="number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category</label>
              <select className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                <option>Starters</option>
                <option>Main Course</option>
                <option>Desserts</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddItemOpen(false)}>Save Item</Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} title="New Category">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category Name</label>
            <Input placeholder="e.g. Seafood" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddCategoryOpen(false)}>Create Category</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function CategoryLink({ name, count, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-accent/10 text-accent font-medium' : 'text-text-primary hover:bg-white/5'}`}
    >
      <span>{name}</span>
      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-text-secondary">{count}</span>
    </button>
  );
}

const menuItems = [
  { name: "Classic Margherita Pizza", category: "Main Course", price: "$14.00", status: "active", tags: ["Vegetarian"], emoji: "🍕" },
  { name: "Spicy Beef Burger", category: "Main Course", price: "$16.50", status: "active", tags: ["Popular"], emoji: "🍔" },
  { name: "Truffle Fries", category: "Starters", price: "$8.00", status: "active", tags: [], emoji: "🍟" },
  { name: "Chocolate Lava Cake", category: "Desserts", price: "$9.50", status: "inactive", tags: [], emoji: "🍰" },
  { name: "Fresh Lemonade", category: "Beverages", price: "$4.50", status: "active", tags: [], emoji: "🍋" },
  { name: "Caesar Salad", category: "Starters", price: "$10.00", status: "active", tags: ["Healthy"], emoji: "🥗" },
  { name: "Extra Cheese", category: "Add-ons", price: "$1.50", status: "active", tags: [], emoji: "🧀" },
];

function MenuItemCard({ name, category, price, status, tags = [], emoji = "🍽️" }: any) {
  return (
    <Card className="flex flex-col">
      <div className="h-32 bg-white/5 flex items-center justify-center relative">
        <span className="text-4xl opacity-20">{emoji}</span>
        {status === 'inactive' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-[1px]">
            <Badge variant="error">Sold Out</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-text-secondary mb-1">{category}</div>
        <h4 className="font-medium text-text-primary mb-2 line-clamp-2">{name}</h4>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="font-mono font-semibold text-accent">{price}</div>
          <div className="flex gap-1">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-[10px] py-0">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
