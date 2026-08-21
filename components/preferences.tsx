"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "pt" | "en";
type Theme = "light" | "dark";
const copy = {
  pt: { work:"Obras", about:"Sobre", contact:"Contato", selectedWork:"Trabalhos selecionados", viewFullProject:"Ver projeto completo", nextProject:"Próximo projeto", allProjects:"Ver todos os projetos" },
  en: { work:"Work", about:"About", contact:"Contact", selectedWork:"Selected work", viewFullProject:"View full project", nextProject:"Next project", allProjects:"View all projects" },
} as const;
export type CopyKey = keyof typeof copy.pt;
type Value={locale:Locale;theme:Theme;setLocale:(value:Locale)=>void;setTheme:(value:Theme)=>void;t:(key:CopyKey)=>string};
const Context=createContext<Value|null>(null);

export function PreferencesProvider({children}:{children:ReactNode}){
  const [locale,setLocaleState]=useState<Locale>("pt");
  const [theme,setThemeState]=useState<Theme>("light");
  useEffect(()=>{
    const savedLocale=localStorage.getItem("jhow-locale");
    const currentTheme=document.documentElement.dataset.theme;
    if(savedLocale==="en"||savedLocale==="pt")setLocaleState(savedLocale);
    if(currentTheme==="dark"||currentTheme==="light")setThemeState(currentTheme);
  },[]);
  const setLocale=(value:Locale)=>{setLocaleState(value);localStorage.setItem("jhow-locale",value);document.documentElement.lang=value==="pt"?"pt-BR":"en";};
  const setTheme=(value:Theme)=>{setThemeState(value);localStorage.setItem("jhow-theme",value);document.documentElement.dataset.theme=value;};
  return <Context.Provider value={{locale,theme,setLocale,setTheme,t:(key)=>copy[locale][key]}}>{children}</Context.Provider>;
}
export function usePreferences(){const value=useContext(Context);if(!value)throw new Error("PreferencesProvider is missing");return value;}
export function UiText({id}:{id:CopyKey}){const {t}=usePreferences();return <>{t(id)}</>;}
