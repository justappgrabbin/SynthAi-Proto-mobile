/**
 * Node State Machine
 * 
 * Each node has 6 states:
 * 1. DORMANT - inactive, no processing
 * 2. LISTENING - receiving messages, analyzing
 * 3. PROCESSING - executing logic
 * 4. RESONATING - amplifying/broadcasting
 * 5. INTEGRATING - merging with other nodes
 * 6. MORPHING - changing state based on inputs
 * 
 * Nodes communicate via message passing, causing state transitions
 */

export type NodeState = "dormant" | "listening" | "processing" | "resonating" | "integrating" | "morphing";

export interface Message {
  from: string;
  to: string;
  type: "intent" | "upload" | "environment" | "transpersonal" | "social" | "interaction";
  payload: any;
  timestamp: number;
}

export interface Node {
  id: string;
  gate: number; // 1-64
  state: NodeState;
  resonance: number; // 0-1
  messageQueue: Message[];
  stateHistory: NodeState[];
  lastTransition: number;
  metadata: Record<string, any>;
}

export class NodeStateMachine {
  private nodes: Map<string, Node> = new Map();
  private messageLog: Message[] = [];
  private stateTransitions: Map<string, number> = new Map();

  /**
   * Create a new node
   */
  createNode(id: string, gate: number): Node {
    const node: Node = {
      id,
      gate,
      state: "dormant",
      resonance: 0,
      messageQueue: [],
      stateHistory: ["dormant"],
      lastTransition: Date.now(),
      metadata: {},
    };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Send a message from one node to another
   * This triggers state transitions
   */
  sendMessage(message: Message): void {
    this.messageLog.push(message);
    const targetNode = this.nodes.get(message.to);
    
    if (!targetNode) return;

    // Add message to queue
    targetNode.messageQueue.push(message);

    // Trigger state transition based on message type
    this.transitionNode(targetNode, message);
  }

  /**
   * Transition a node's state based on incoming message
   */
  private transitionNode(node: Node, message: Message): void {
    const currentState = node.state;
    let nextState: NodeState = currentState;

    switch (currentState) {
      case "dormant":
        // Dormant → Listening when any message arrives
        nextState = "listening";
        break;

      case "listening":
        // Listening → Processing when enough messages accumulated
        if (node.messageQueue.length > 1) {
          nextState = "processing";
        }
        break;

      case "processing":
        // Processing → Resonating when processing complete
        if (this.isProcessingComplete(node)) {
          nextState = "resonating";
        }
        break;

      case "resonating":
        // Resonating → Integrating when resonance spreads
        if (node.resonance > 0.7) {
          nextState = "integrating";
        }
        break;

      case "integrating":
        // Integrating → Morphing when integration complete
        if (this.isIntegrationComplete(node)) {
          nextState = "morphing";
        }
        break;

      case "morphing":
        // Morphing → back to Listening for next cycle
        if (Date.now() - node.lastTransition > 1000) {
          nextState = "listening";
        }
        break;
    }

    if (nextState !== currentState) {
      this.setState(node, nextState);
    }
  }

  /**
   * Set node state and record transition
   */
  private setState(node: Node, newState: NodeState): void {
    node.state = newState;
    node.stateHistory.push(newState);
    node.lastTransition = Date.now();

    // Update resonance based on state
    node.resonance = this.calculateResonance(node);

    // Record transition
    const key = `${node.id}:${node.state}`;
    this.stateTransitions.set(key, (this.stateTransitions.get(key) || 0) + 1);
  }

  /**
   * Calculate resonance based on node state and message activity
   */
  private calculateResonance(node: Node): number {
    const baseResonance: Record<NodeState, number> = {
      dormant: 0,
      listening: 0.2,
      processing: 0.4,
      resonating: 0.8,
      integrating: 0.6,
      morphing: 0.5,
    };

    const stateResonance = baseResonance[node.state];
    const messageBoost = Math.min(0.2, node.messageQueue.length * 0.05);
    
    return Math.min(1, stateResonance + messageBoost);
  }

  /**
   * Check if processing is complete (heuristic)
   */
  private isProcessingComplete(node: Node): boolean {
    // Processing complete if messages are being consumed
    return node.messageQueue.length === 0 || Date.now() - node.lastTransition > 500;
  }

  /**
   * Check if integration is complete
   */
  private isIntegrationComplete(node: Node): boolean {
    // Integration complete if resonance is stable
    return node.resonance > 0.6 && Date.now() - node.lastTransition > 800;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node by ID
   */
  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get nodes by state
   */
  getNodesByState(state: NodeState): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.state === state);
  }

  /**
   * Get message history
   */
  getMessageHistory(limit: number = 100): Message[] {
    return this.messageLog.slice(-limit);
  }

  /**
   * Get state transition statistics
   */
  getTransitionStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.stateTransitions.forEach((count, key) => {
      stats[key] = count;
    });
    return stats;
  }

  /**
   * Process one cycle of the state machine
   * This is called periodically to advance all nodes
   */
  processCycle(): void {
    this.nodes.forEach((node) => {
      // Process messages in queue
      while (node.messageQueue.length > 0) {
        const message = node.messageQueue.shift();
        if (message) {
          this.transitionNode(node, message);
        }
      }

      // Decay resonance over time
      node.resonance *= 0.95;

      // Check for state transitions based on time
      if (node.state === "morphing" && Date.now() - node.lastTransition > 1000) {
        this.setState(node, "listening");
      }
    });
  }
}

export const nodeStateMachine = new NodeStateMachine();
