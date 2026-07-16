"use client";

import { useRef, useEffect, useState } from "react";
import { Bold, Italic, List, ListOrdered, Undo, Redo, RemoveFormatting } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local editor content with value prop
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Avoid saving empty paragraphs like <p><br></p> as content
      if (html === "<p><br></p>" || html === "<br>" || html === "") {
        onChange("");
      } else {
        onChange(html);
      }
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div
      className={`border rounded-lg bg-background overflow-hidden transition-all duration-200 ${
        isFocused 
          ? "border-primary/50 ring-2 ring-primary/10"
          : "border-border hover:border-border/80"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border-b border-border bg-muted/10 select-none">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => execCommand("undo")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("redo")}
          className="p-1.5 hover:bg-muted text-text-secondary hover:text-text rounded-md transition-colors w-8 h-8 flex items-center justify-center"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3 min-h-[140px] max-h-[300px] overflow-y-auto focus:outline-none prose dark:prose-invert max-w-none text-sm leading-relaxed"
        style={{ minHeight: "140px" }}
        data-placeholder={placeholder}
      />
      
      {/* Styles for contentEditable placeholder when empty */}
      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-text-muted, #64748b);
          cursor: text;
        }
      `}</style>
    </div>
  );
}
