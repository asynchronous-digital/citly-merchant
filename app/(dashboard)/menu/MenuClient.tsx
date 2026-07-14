"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createCategory, createMenuItem, editCategory, deleteCategory } from "@/app/actions/menu";

export function MenuClient({ initialCategories, initialItems }: { initialCategories: string[], initialItems: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);

  // Loading States
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

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
            {initialCategories.map(cat => (
               <CategoryLink 
                 key={cat} 
                 name={cat} 
                 count={cat === "All Items" ? initialItems.length : initialItems.filter(i => i.category === cat).length} 
                 active={activeCategory === cat} 
                 onClick={() => setActiveCategory(cat)} 
                 onEdit={cat !== "All Items" ? () => setCategoryToEdit(cat) : undefined}
                 onDelete={cat !== "All Items" ? () => setIsDeleteConfirmOpen(cat) : undefined}
               />
            ))}
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
            {initialItems
              .filter(item => activeCategory === "All Items" || item.category === activeCategory)
              .map((item, idx) => (
                <MenuItemCard 
                  key={idx}
                  name={item.name} 
                  category={item.category}
                  price={`$${item.price.toFixed(2)}`}
                  status={item.isAvailable ? 'active' : 'inactive'}
                  tags={item.tags}
                  emoji="🍽️"
                />
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add New Menu Item">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmittingItem(true);
          const formData = new FormData(e.currentTarget);
          const res = await createMenuItem(null, formData);
          setIsSubmittingItem(false);
          if (res.error) {
            alert("Error: " + res.error);
          } else {
            setIsAddItemOpen(false);
          }
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Item Name</label>
            <Input name="name" placeholder="e.g. Garlic Bread" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Price</label>
              <Input name="price" placeholder="0.00" type="number" step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category</label>
              <select name="category" className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50">
                {initialCategories.filter(c => c !== "All Items").map(c => (
                  <option className="bg-background text-text-primary" key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)} disabled={isSubmittingItem}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingItem}>
              {isSubmittingItem && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmittingItem ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} title="New Category">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmittingCategory(true);
          const formData = new FormData(e.currentTarget);
          const res = await createCategory(null, formData);
          setIsSubmittingCategory(false);
          if (res.error) {
            alert("Error: " + res.error);
          } else {
            setIsAddCategoryOpen(false);
          }
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category Name</label>
            <Input name="name" placeholder="e.g. Seafood" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)} disabled={isSubmittingCategory}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingCategory}>
              {isSubmittingCategory && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmittingCategory ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={!!categoryToEdit} onClose={() => setCategoryToEdit(null)} title="Edit Category">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!categoryToEdit) return;
          setIsEditingCategory(true);
          const formData = new FormData(e.currentTarget);
          const newName = formData.get("name") as string;
          const res = await editCategory(categoryToEdit, newName);
          setIsEditingCategory(false);
          if (res.error) {
            alert("Error: " + res.error);
          } else {
            setCategoryToEdit(null);
            if (activeCategory === categoryToEdit) setActiveCategory(newName);
          }
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category Name</label>
            <Input name="name" defaultValue={categoryToEdit || ""} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCategoryToEdit(null)} disabled={isEditingCategory}>Cancel</Button>
            <Button type="submit" disabled={isEditingCategory}>
              {isEditingCategory && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditingCategory ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation */}
      <Modal isOpen={!!isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(null)} title="Delete Category">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete the category <strong>{isDeleteConfirmOpen}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(null)} disabled={isDeletingCategory}>Cancel</Button>
            <Button 
              variant="danger" 
              disabled={isDeletingCategory}
              onClick={async () => {
                if (!isDeleteConfirmOpen) return;
                setIsDeletingCategory(true);
                const res = await deleteCategory(isDeleteConfirmOpen);
                setIsDeletingCategory(false);
                if (res.error) {
                  alert("Error: " + res.error);
                } else {
                  setIsDeleteConfirmOpen(null);
                  if (activeCategory === isDeleteConfirmOpen) setActiveCategory("All Items");
                }
              }}
            >
              {isDeletingCategory && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function CategoryLink({ name, count, active, onClick, onEdit, onDelete }: any) {
  return (
    <div 
      className={`group relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${active ? 'bg-accent/10 text-accent font-medium' : 'text-text-primary hover:bg-white/5'}`}
      onClick={onClick}
    >
      <span className="truncate pr-6 flex-1 text-left">{name}</span>
      
      <span className={`text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-text-secondary transition-opacity duration-200 shrink-0 ${onEdit ? 'group-hover:opacity-0' : ''}`}>
        {count}
      </span>
      
      {onEdit && onDelete && (
        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="p-1 bg-surface-elevated hover:bg-surface text-text-secondary hover:text-accent rounded backdrop-blur-sm transition-all border border-border shadow-md"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="p-1 bg-surface-elevated hover:bg-surface text-text-secondary hover:text-error rounded backdrop-blur-sm transition-all border border-border shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

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
