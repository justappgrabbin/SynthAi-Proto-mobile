import React, { createContext, useContext, useState, useCallback } from "react";
import { UIState, UIConfig, uiStateManager } from "@/lib/uiStateManager";

interface UIMorphContextType {
  state: UIState;
  config: UIConfig;
  setState: (newState: UIState) => void;
  isPanelVisible: (panelName: string) => boolean;
  isToolHighlighted: (toolName: string) => boolean;
  getStateClass: () => string;
  getLayoutClass: () => string;
}

const UIMorphContext = createContext<UIMorphContextType | undefined>(undefined);

export function UIMorphProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInternal] = useState<UIState>(uiStateManager.getState());
  const [config, setConfig] = useState<UIConfig>(uiStateManager.getConfig());

  const setState = useCallback((newState: UIState) => {
    setStateInternal(newState);
    const newConfig = uiStateManager.setState(newState);
    setConfig(newConfig);
  }, []);

  const isPanelVisible = useCallback(
    (panelName: string) => uiStateManager.isPanelVisible(panelName),
    []
  );

  const isToolHighlighted = useCallback(
    (toolName: string) => uiStateManager.isToolHighlighted(toolName),
    []
  );

  const getStateClass = useCallback(() => uiStateManager.getStateClass(), []);
  const getLayoutClass = useCallback(() => uiStateManager.getLayoutClass(), []);

  return (
    <UIMorphContext.Provider
      value={{
        state,
        config,
        setState,
        isPanelVisible,
        isToolHighlighted,
        getStateClass,
        getLayoutClass,
      }}
    >
      {children}
    </UIMorphContext.Provider>
  );
}

export function useUIMorph() {
  const context = useContext(UIMorphContext);
  if (!context) {
    throw new Error("useUIMorph must be used within UIMorphProvider");
  }
  return context;
}
