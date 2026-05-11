import React, { createContext, useContext, useState, useEffect } from 'react';

interface PreferenceContextType {
  uf: string;
  cities: string[];
  setUf: (uf: string) => void;
  setCities: (cities: string[]) => void;
  clearPreferences: () => void;
  isFiltered: boolean;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export function PreferenceProvider({ children }: { children: React.ReactNode }) {
  const [uf, setUfState] = useState<string>('');
  const [cities, setCitiesState] = useState<string[]>([]);

  // Carregar do localStorage no início
  useEffect(() => {
    const savedUf = localStorage.getItem('nv_pref_uf');
    const savedCities = localStorage.getItem('nv_pref_cities');
    
    if (savedUf) setUfState(savedUf);
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
    // Limpa cidades se o estado mudar para um estado vazio (Brasil todo)
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

  const clearPreferences = () => {
    setUfState('');
    setCitiesState([]);
    localStorage.removeItem('nv_pref_uf');
    localStorage.removeItem('nv_pref_cities');
  };

  const isFiltered = !!uf;

  return (
    <PreferenceContext.Provider value={{ uf, cities, setUf, setCities, clearPreferences, isFiltered }}>
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
