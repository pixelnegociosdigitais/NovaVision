import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreferenceContextType {
  uf: string;
  cities: string[];
  apenasMei: boolean;
  dataInicio: string;
  dataFim: string;
  setUf: (uf: string) => void;
  setCities: (cities: string[]) => void;
  setApenasMei: (val: boolean) => void;
  setDataInicio: (val: string) => void;
  setDataFim: (val: string) => void;
  clearPreferences: () => void;
  isFiltered: boolean;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export function PreferenceProvider({ children }: { children: React.ReactNode }) {
  const [uf, setUfState] = useState<string>('');
  const [cities, setCitiesState] = useState<string[]>([]);
  const [apenasMei, setApenasMeiState] = useState<boolean>(false);
  const [dataInicio, setDataInicioState] = useState<string>('');
  const [dataFim, setDataFimState] = useState<string>('');

  // Carregar do localStorage no início
  useEffect(() => {
    const savedUf = localStorage.getItem('nv_pref_uf');
    const savedCities = localStorage.getItem('nv_pref_cities');
    const savedMei = localStorage.getItem('nv_pref_mei');
    const savedStart = localStorage.getItem('nv_pref_start');
    const savedEnd = localStorage.getItem('nv_pref_end');
    
    if (savedUf) setUfState(savedUf);
    if (savedMei) setApenasMeiState(savedMei === 'true');
    if (savedStart) setDataInicioState(savedStart);
    if (savedEnd) setDataFimState(savedEnd);
    
    if (savedCities) {
      try {
        setCitiesState(JSON.parse(savedCities));
      } catch (e) {
        console.error('Erro ao carregar cidades preferidas:', e);
      }
    }
  }, []);

  const setUf = (newUf: string) => {
    setUfState(newUf);
    localStorage.setItem('nv_pref_uf', newUf);
    if (!newUf) {
      setCitiesState([]);
      localStorage.removeItem('nv_pref_cities');
    }
  };

  const setCities = (newCities: string[]) => {
    const cleanCities = newCities.map(c => c.trim().toUpperCase()).filter(Boolean);
    setCitiesState(cleanCities);
    localStorage.setItem('nv_pref_cities', JSON.stringify(cleanCities));
  };

  const setApenasMei = (val: boolean) => {
    setApenasMeiState(val);
    localStorage.setItem('nv_pref_mei', String(val));
  };

  const setDataInicio = (val: string) => {
    setDataInicioState(val);
    localStorage.setItem('nv_pref_start', val);
  };

  const setDataFim = (val: string) => {
    setDataFimState(val);
    localStorage.setItem('nv_pref_end', val);
  };

  const clearPreferences = () => {
    setUfState('');
    setCitiesState([]);
    setApenasMeiState(false);
    setDataInicioState('');
    setDataFimState('');
    localStorage.removeItem('nv_pref_uf');
    localStorage.removeItem('nv_pref_cities');
    localStorage.removeItem('nv_pref_mei');
    localStorage.removeItem('nv_pref_start');
    localStorage.removeItem('nv_pref_end');
  };

  const isFiltered = !!uf || apenasMei || !!dataInicio || !!dataFim;

  return (
    <PreferenceContext.Provider value={{ 
      uf, cities, apenasMei, dataInicio, dataFim,
      setUf, setCities, setApenasMei, setDataInicio, setDataFim,
      clearPreferences, isFiltered 
    }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferenceProvider');
  }
  return context;
}
