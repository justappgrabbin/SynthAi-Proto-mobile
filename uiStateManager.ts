export type UIState = "calm" | "chaos" | "listening" | "processing";

export interface UIConfig {
  state: UIState;
  showDebugPanel: boolean;
  showErrorTools: boolean;
  showProcessingIndicator: boolean;
  layoutMode: "normal" | "compact" | "expanded";
  visiblePanels: string[];
  highlightedTools: string[];
}

export class UIStateManager {
  private state: UIState = "calm";
  private config: UIConfig;

  constructor() {
    this.config = this.getDefaultConfig("calm");
  }

  setState(newState: UIState): UIConfig {
    this.state = newState;
    this.config = this.getDefaultConfig(newState);
    return this.config;
  }

  getState(): UIState {
    return this.state;
  }

  getConfig(): UIConfig {
    return this.config;
  }

  private getDefaultConfig(state: UIState): UIConfig {
    switch (state) {
      case "calm":
        return {
          state: "calm",
          showDebugPanel: false,
          showErrorTools: false,
          showProcessingIndicator: false,
          layoutMode: "normal",
          visiblePanels: ["chat", "topology", "materials", "agents"],
          highlightedTools: [],
        };

      case "chaos":
        return {
          state: "chaos",
          showDebugPanel: true,
          showErrorTools: true,
          showProcessingIndicator: true,
          layoutMode: "expanded",
          visiblePanels: ["chat", "debug", "error-tools", "observer"],
          highlightedTools: ["observer", "learning", "advisor"],
        };

      case "listening":
        return {
          state: "listening",
          showDebugPanel: false,
          showErrorTools: false,
          showProcessingIndicator: true,
          layoutMode: "compact",
          visiblePanels: ["chat", "processing"],
          highlightedTools: ["observer"],
        };

      case "processing":
        return {
          state: "processing",
          showDebugPanel: false,
          showErrorTools: false,
          showProcessingIndicator: true,
          layoutMode: "compact",
          visiblePanels: ["chat", "processing"],
          highlightedTools: [],
        };

      default:
        return this.getDefaultConfig("calm");
    }
  }

  // Check if a panel should be visible
  isPanelVisible(panelName: string): boolean {
    return this.config.visiblePanels.includes(panelName);
  }

  // Check if a tool should be highlighted
  isToolHighlighted(toolName: string): boolean {
    return this.config.highlightedTools.includes(toolName);
  }

  // Get CSS class for current state
  getStateClass(): string {
    return `ui-state-${this.state}`;
  }

  // Get layout class
  getLayoutClass(): string {
    return `layout-${this.config.layoutMode}`;
  }
}

export const uiStateManager = new UIStateManager();
