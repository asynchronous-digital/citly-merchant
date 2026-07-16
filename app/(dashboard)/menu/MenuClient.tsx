"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Edit2, Trash2, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createCategory, createMenuItem, editCategory, deleteCategory, deleteMenuItem, updateMenuItem } from "@/app/actions/menu";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  image: string;
  description: string;
  isAvailable: boolean;
  displayOrder: number;
}

export function MenuClient({ initialCategories, initialItems }: { initialCategories: Category[], initialItems: MenuItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = "All Items"
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<Category | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");

  // Loading States
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Inline Form Errors
  const [addItemError, setAddItemError] = useState<string | null>(null);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [editCategoryError, setEditCategoryError] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredItems = activeCategory
    ? initialItems.filter(item => item.categoryId === activeCategory)
    : initialItems;

  // Build a map from category id -> category name for display
  const categoryMap = new Map(initialCategories.map(c => [c.id, c.name]));

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
            <CategoryLink 
              name="All Items" 
              count={initialItems.length} 
              active={activeCategory === null} 
              onClick={() => setActiveCategory(null)} 
            />
            {initialCategories.map(cat => (
               <CategoryLink 
                 key={cat.id} 
                 name={cat.name} 
                 count={initialItems.filter(i => i.categoryId === cat.id).length} 
                 active={activeCategory === cat.id} 
                 onClick={() => setActiveCategory(cat.id)} 
                 onEdit={() => setCategoryToEdit(cat)}
                 onDelete={() => setIsDeleteConfirmOpen(cat)}
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

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <span className="text-4xl block mb-4">🍽️</span>
              <p className="text-lg font-medium mb-1">No menu items yet</p>
              <p className="text-sm">Click &quot;Add Item&quot; to create your first menu item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard 
                  key={item.id}
                  name={item.name} 
                  category={categoryMap.get(item.categoryId) || "Uncategorized"}
                  price={`$${item.price.toFixed(2)}`}
                  status={item.isAvailable ? 'active' : 'inactive'}
                  description={item.description}
                  emoji="🍽️"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isAddItemOpen} onClose={() => { setIsAddItemOpen(false); setAddItemError(null); }} title="Add New Menu Item">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmittingItem(true);
          setAddItemError(null);
          const formData = new FormData(e.currentTarget);
          formData.set("description", newItemDescription);
          const res = await createMenuItem(null, formData);
          setIsSubmittingItem(false);
          if (res.error) {
            setAddItemError(res.error);
            setToast({ type: 'error', message: res.error });
          } else {
            setIsAddItemOpen(false);
            setNewItemDescription("");
            setToast({ type: 'success', message: 'Menu item added successfully!' });
          }
        }} className="space-y-4">
          {addItemError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{addItemError}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Item Name</label>
            <Input name="name" placeholder="e.g. Garlic Bread" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Description</label>
            <RichTextEditor value={newItemDescription} onChange={setNewItemDescription} placeholder="Describe your dish, ingredients, and allergy info..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Price</label>
              <Input name="price" placeholder="0.00" type="number" step="0.01" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category</label>
              <select name="category" className="flex h-10 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50" required>
                <option value="" className="bg-background text-text-primary">Select category...</option>
                {initialCategories.map(c => (
                  <option className="bg-background text-text-primary" key={c.id} value={c.id}>{c.name}</option>
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
      <Modal isOpen={isAddCategoryOpen} onClose={() => { setIsAddCategoryOpen(false); setAddCategoryError(null); }} title="New Category">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmittingCategory(true);
          setAddCategoryError(null);
          const formData = new FormData(e.currentTarget);
          const res = await createCategory(null, formData);
          setIsSubmittingCategory(false);
          if (res.error) {
            setAddCategoryError(res.error);
            setToast({ type: 'error', message: res.error });
          } else {
            setIsAddCategoryOpen(false);
            setToast({ type: 'success', message: 'Category created successfully!' });
          }
        }} className="space-y-4">
          {addCategoryError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{addCategoryError}</span>
            </div>
          )}
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
      <Modal isOpen={!!categoryToEdit} onClose={() => { setCategoryToEdit(null); setEditCategoryError(null); }} title="Edit Category">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!categoryToEdit) return;
          setIsEditingCategory(true);
          setEditCategoryError(null);
          const formData = new FormData(e.currentTarget);
          const newName = formData.get("name") as string;
          const res = await editCategory(categoryToEdit.id, newName);
          setIsEditingCategory(false);
          if (res.error) {
            setEditCategoryError(res.error);
            setToast({ type: 'error', message: res.error });
          } else {
            setCategoryToEdit(null);
            setToast({ type: 'success', message: 'Category updated!' });
          }
        }} className="space-y-4">
          {editCategoryError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{editCategoryError}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Category Name</label>
            <Input name="name" defaultValue={categoryToEdit?.name || ""} required />
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
            Are you sure you want to delete the category <strong>{isDeleteConfirmOpen?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(null)} disabled={isDeletingCategory}>Cancel</Button>
            <Button 
              variant="danger" 
              disabled={isDeletingCategory}
              onClick={async () => {
                if (!isDeleteConfirmOpen) return;
                setIsDeletingCategory(true);
                const res = await deleteCategory(isDeleteConfirmOpen.id);
                setIsDeletingCategory(false);
                if (res.error) {
                  setToast({ type: 'error', message: res.error });
                } else {
                  setIsDeleteConfirmOpen(null);
                  if (activeCategory === isDeleteConfirmOpen.id) setActiveCategory(null);
                  setToast({ type: 'success', message: 'Category deleted.' });
                }
              }}
            >
              {isDeletingCategory && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm ${
          toast.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {toast.type === 'error' 
            ? <AlertCircle className="w-5 h-5 shrink-0" /> 
            : <CheckCircle2 className="w-5 h-5 shrink-0" />
          }
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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

function MenuItemCard({ name, category, price, status, description, emoji = "🍽️" }: any) {
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
        <h4 className="font-medium text-text-primary mb-1 line-clamp-2">{name}</h4>
        {description && (
          <div 
            className="text-xs text-text-muted line-clamp-2 mb-2 leading-relaxed prose prose-xs dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="font-mono font-semibold text-accent">{price}</div>
        </div>
      </div>
    </Card>
  );
}
