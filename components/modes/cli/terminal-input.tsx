"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  prompt?: string;
  disabled?: boolean;
}

export function TerminalInput({
  value,
  onChange,
  onKeyDown,
  prompt = "$ ",
  disabled = false,
}: TerminalInputProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });

  const updateCursorPosition = useCallback(() => {
    if (textareaRef.current && measureRef.current) {
      const textarea = textareaRef.current;
      const selectionStart = textarea.selectionStart;
      
      // Use textarea's actual value, not the prop (in case of async updates)
      const textareaValue = textarea.value;
      const textBeforeCursor = textareaValue.substring(0, selectionStart);
      
      // Mirror textarea styling for accurate measurement
      const textareaStyle = getComputedStyle(textarea);
      const measureEl = measureRef.current;
      
      // Match all relevant styles
      measureEl.style.width = `${textarea.offsetWidth}px`;
      measureEl.style.fontSize = textareaStyle.fontSize;
      measureEl.style.fontFamily = textareaStyle.fontFamily;
      measureEl.style.fontWeight = textareaStyle.fontWeight;
      measureEl.style.letterSpacing = textareaStyle.letterSpacing;
      measureEl.style.padding = textareaStyle.padding;
      measureEl.style.boxSizing = textareaStyle.boxSizing;
      measureEl.style.whiteSpace = "pre-wrap";
      measureEl.style.wordWrap = "break-word";
      measureEl.style.overflowWrap = "break-word";
      measureEl.style.lineHeight = textareaStyle.lineHeight;
      measureEl.style.position = "absolute";
      measureEl.style.top = "0";
      // Match textarea's left margin (ml-2 = 0.5rem = 8px)
      const marginLeft = parseFloat(textareaStyle.marginLeft) || 8;
      measureEl.style.left = `${marginLeft}px`;
      
      // Use a marker span to find cursor position
      const textParts = textBeforeCursor.split('');
      let htmlContent = '';
      for (let i = 0; i < textParts.length; i++) {
        const char = textParts[i];
        if (char === '\n') {
          htmlContent += '<br>';
        } else {
          htmlContent += escapeHtml(char);
        }
      }
      // Use a zero-width space to mark cursor position
      htmlContent += '<span id="cursor-marker" style="display:inline;vertical-align:baseline;">\u200b</span>';
      
      measureEl.innerHTML = htmlContent;
      
      // Wait for DOM to update, then measure
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        
        const marker = measureEl.querySelector('#cursor-marker') as HTMLElement;
        if (marker) {
          const markerRect = marker.getBoundingClientRect();
          const textareaRect = textareaRef.current.getBoundingClientRect();
          const textareaStyle = getComputedStyle(textareaRef.current);
          
          // Calculate position relative to textarea container
          // Get the container (parent of textarea)
          const container = textareaRef.current.parentElement;
          if (!container) return;
          
          const containerRect = container.getBoundingClientRect();
          
          // Position cursor relative to container, matching the marker's position
          const left = markerRect.left - containerRect.left;
          
          // Get textarea padding
          const paddingTop = parseFloat(textareaStyle.paddingTop) || 0;
          
          // Calculate top position: marker top relative to container, plus padding
          const markerTopRelative = markerRect.top - containerRect.top;
          
          setCursorPosition({
            left: left,
            top: markerTopRelative + paddingTop,
          });
        } else {
          // Fallback
          const textareaStyle = getComputedStyle(textareaRef.current);
          const paddingTop = parseFloat(textareaStyle.paddingTop) || 0;
          const marginLeft = parseFloat(textareaStyle.marginLeft) || 8;
          setCursorPosition({
            left: marginLeft,
            top: paddingTop,
          });
        }
      });
    }
  }, [value]);
  
  // Helper to escape HTML
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      const handleUpdate = () => {
        requestAnimationFrame(updateCursorPosition);
      };

      textarea.addEventListener("keyup", handleUpdate);
      textarea.addEventListener("click", handleUpdate);
      textarea.addEventListener("input", handleUpdate);
      textarea.addEventListener("keydown", handleUpdate);
      
      return () => {
        textarea.removeEventListener("keyup", handleUpdate);
        textarea.removeEventListener("click", handleUpdate);
        textarea.removeEventListener("input", handleUpdate);
        textarea.removeEventListener("keydown", handleUpdate);
      };
    }
  }, [updateCursorPosition]);

  return (
    <div className="flex items-start font-mono text-sm w-full">
      <span className="text-muted-foreground select-none pt-0.5">{prompt}</span>
      <div className="relative flex-1 min-w-0">
        <span
          ref={measureRef}
          className="absolute font-mono text-sm pointer-events-none"
          style={{
            visibility: "hidden",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
          aria-hidden="true"
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          rows={1}
          wrap="soft"
          className={cn(
            "w-full bg-transparent outline-none border-none resize-none",
            "text-foreground font-mono text-sm",
            "disabled:cursor-not-allowed",
            "min-h-[1.5rem] ml-2"
          )}
          style={{ 
            caretColor: "transparent",
            lineHeight: "1.5rem",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          onInput={(e) => {
            // Auto-resize textarea to fit content
            const textarea = e.currentTarget;
            textarea.style.height = "auto";
            textarea.style.height = `${Math.max(textarea.scrollHeight, 24)}px`;
          }}
        />
        <span
          className="absolute inline-block w-2 bg-foreground pointer-events-none"
          style={{
            animation: "blink 1s step-end infinite",
            left: `${cursorPosition.left}px`,
            top: `${cursorPosition.top}px`,
            height: "1.5rem", // Match lineHeight
            transform: "translateY(-2px)", // Fine-tune vertical alignment
          }}
        />
      </div>
    </div>
  );
}
