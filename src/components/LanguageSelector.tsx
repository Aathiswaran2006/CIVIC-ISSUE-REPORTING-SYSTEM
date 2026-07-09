import React from "react";
import { Globe, Check } from "lucide-react";
import { LanguageCode } from "../translations";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  dark?: boolean;
}

export default function LanguageSelector({ currentLang, onChange, dark = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
  ];

  return (
    <div className="relative inline-block text-left" id="lang-selector-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
          dark
            ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
        id="lang-selector-btn"
      >
        <Globe className="w-4 h-4 text-emerald-500" />
        <span>{languages.find((l) => l.code === currentLang)?.native}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            id="lang-selector-backdrop"
          />
          <div
            className={`absolute right-0 mt-2 w-40 rounded-xl shadow-lg border z-20 overflow-hidden ${
              dark
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-white border-slate-100 text-slate-800"
            }`}
            id="lang-selector-dropdown"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                    dark
                      ? "hover:bg-slate-700"
                      : "hover:bg-slate-50"
                  } ${currentLang === lang.code ? "font-semibold text-emerald-600 bg-emerald-500/10" : ""}`}
                  id={`lang-opt-${lang.code}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs opacity-75">{lang.label}</span>
                    <span className="font-medium">{lang.native}</span>
                  </div>
                  {currentLang === lang.code && <Check className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
