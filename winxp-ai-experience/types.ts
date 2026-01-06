
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}
