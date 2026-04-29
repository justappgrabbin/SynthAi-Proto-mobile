import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrchestratorState, analyzeContext, getVisualIntensity } from '@/lib/contextDetector';

interface OrchestratorStateContextType {
  state: OrchestratorState;
  intensity: number;
  visualIntensity: ReturnType<typeof getVisualIntensity>;
  updateState: (text: string) => void;
}

const OrchestratorStateContext = createContext<OrchestratorStateContextType | undefined>(undefined);

export function OrchestratorStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OrchestratorState>('calm');
  const [intensity, setIntensity] = useState(0.3);
  const [visualIntensity, setVisualIntensity] = useState(getVisualIntensity('calm', 0.3));

  const updateState = (text: string) => {
    const analysis = analyzeContext(text);
    setState(analysis.state);
    setIntensity(analysis.intensity);
    setVisualIntensity(getVisualIntensity(analysis.state, analysis.intensity));
  };

  return (
    <OrchestratorStateContext.Provider value={{ state, intensity, visualIntensity, updateState }}>
      {children}
    </OrchestratorStateContext.Provider>
  );
}

export function useOrchestratorState() {
  const context = useContext(OrchestratorStateContext);
  if (!context) {
    throw new Error('useOrchestratorState must be used within OrchestratorStateProvider');
  }
  return context;
}
