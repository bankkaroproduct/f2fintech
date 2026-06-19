"use client"

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface SpendingInputProps {
  question: string;
  emoji: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showCurrency?: boolean;
  showRupee?: boolean;
  suffix?: string;
}

export const SpendingInput = ({
  question,
  emoji,
  value,
  onChange,
  min = 0,
  max = 1000000,
  step = 500,
  className,
  showCurrency = true,
  showRupee = true,
  suffix = "",
}: SpendingInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  // inputDisplay holds the raw string shown in the <input> — allows empty/partial while typing
  const [inputDisplay, setInputDisplay] = useState(value === 0 ? '' : String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only sync from parent when the field is not focused (avoids fighting the user mid-type)
    if (!isFocused) {
      setLocalValue(value);
      setInputDisplay(value === 0 ? '' : String(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputDisplay(raw);
    const num = raw === '' ? 0 : parseInt(raw, 10);
    const val = Number.isFinite(num) ? Math.max(min, Math.min(max, num)) : 0;
    setLocalValue(val);
    onChange(val);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear display when field shows 0 so user can type fresh
    if (localValue === 0) {
      setInputDisplay('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Restore 0 display if user left field empty
    if (inputDisplay === '') {
      setInputDisplay('');
      onChange(0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLocalValue(val);
    setInputDisplay(val === 0 ? '' : String(val));
    onChange(val);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className={cn(
      "p-5 sm:p-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(58,73,214,0.06)] transition-all duration-300",
      isFocused && "shadow-[0_8px_40px_rgba(58,73,214,0.12)] border-[#3A49D6]/20",
      className
    )}>
      <label className="block mb-5">
        <span className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
          {question} <span className="text-xl sm:text-2xl ml-1">{emoji}</span>
        </span>
      </label>

      <div className="relative mb-5">
        {showRupee && showCurrency && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium pointer-events-none">
            ₹
          </span>
        )}
        <input
          type="number"
          value={inputDisplay}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full pr-4 py-4 text-2xl sm:text-3xl font-bold text-[#3A49D6] bg-[#F8F9FF] border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#3A49D6] focus:bg-white focus:ring-4 focus:ring-[#3A49D6]/10 transition-all duration-300 touch-target placeholder:text-slate-300",
            (showRupee && showCurrency) ? "pl-11" : "pl-4"
          )}
          placeholder="0"
          min={min}
          step={step}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      <div className="relative pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleSliderChange}
          style={{
            background: `linear-gradient(to right, #3A49D6 0%, #6C7BF0 ${percentage}%, #EEF0FF ${percentage}%, #EEF0FF 100%)`
          }}
          className="w-full h-3 sm:h-2.5 rounded-full appearance-none cursor-pointer touch-target
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-7
                   [&::-webkit-slider-thumb]:h-7
                   sm:[&::-webkit-slider-thumb]:w-6
                   sm:[&::-webkit-slider-thumb]:h-6
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white
                   [&::-webkit-slider-thumb]:border-[3px]
                   [&::-webkit-slider-thumb]:border-[#3A49D6]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(58,73,214,0.3)]
                   [&::-webkit-slider-thumb]:transition-transform
                   [&::-webkit-slider-thumb]:active:scale-125
                   [&::-webkit-slider-thumb]:hover:shadow-[0_2px_12px_rgba(58,73,214,0.4)]
                   [&::-moz-range-thumb]:w-7
                   [&::-moz-range-thumb]:h-7
                   sm:[&::-moz-range-thumb]:w-6
                   sm:[&::-moz-range-thumb]:h-6
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-[3px]
                   [&::-moz-range-thumb]:border-[#3A49D6]
                   [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(58,73,214,0.3)]"
        />
        <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
          <span>{(showRupee && showCurrency) ? '₹' : ''}{min.toLocaleString('en-IN')}{suffix}</span>
          <span>{(showRupee && showCurrency) ? '₹' : ''}{max.toLocaleString('en-IN')}{suffix}</span>
        </div>
      </div>
    </div>
  );
};
