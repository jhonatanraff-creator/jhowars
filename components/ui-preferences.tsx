"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { uiTranslations, type Locale, type TranslationKey } from "@/lib/ui-translations";

type Theme="light"|"dark";
type Preferences={locale:Locale;theme:Theme;setLocale:(locale:Locale)=>void;toggleTheme:()=>void;t:(key:TranslationKey)=>string};
const PreferencesContext=createContext<Preferences|null>(null);

export function UiPreferences({children}:{children:React.ReactNode}){
  const [locale,setLocaleState]=useState<Locale>("pt");
  const [theme,setTheme]=useState<Theme>("light");

  useEffect(()=>{
    const savedLocale=localStorage.getItem("jhowars-locale");
    if(savedLocale==="pt"||savedLocale==="en"){
      setLocaleState(savedLocale);
      document.documentElement.lang=savedLocale==="pt"?"pt-BR":"en";
    }
    setTheme(document.documentElement.dataset.theme==="dark"?"dark":"light");
  },[]);

  const setLocale=(next:Locale)=>{setLocaleState(next);localStorage.setItem("jhowars-locale",next);document.documentElement.lang=next==="pt"?"pt-BR":"en";};
  const toggleTheme=()=>setTheme((current)=>{
    const next=current==="light"?"dark":"light";
    document.documentElement.dataset.theme=next;
    localStorage.setItem("jhowars-theme",next);
    return next;
  });
  const t=(key:TranslationKey)=>uiTranslations[locale][key];
  return <PreferencesContext.Provider value={{locale,theme,setLocale,toggleTheme,t}}>{children}</PreferencesContext.Provider>;
}

export function useUiPreferences(){
  const value=useContext(PreferencesContext);
  if(!value)throw new Error("useUiPreferences must be used inside UiPreferences");
  return value;
}

export function UiText({id}:{id:TranslationKey}){const {t}=useUiPreferences();return <>{t(id)}</>;}
