export interface UIConfig {
  fontSize: number;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

export interface MenuButton {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick: () => void;
}