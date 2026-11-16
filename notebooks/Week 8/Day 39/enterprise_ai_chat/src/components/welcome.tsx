"use client";

import { ArrowUpRight, Asterisk, Leaf, MessageCircleHeart, ReceiptText, Utensils } from "lucide-react";

const suggestions = [
  { icon: Utensils, title: "Find your next favorite", detail: "Take a look at the menu", query: "Could you show me the menu?" },
  { icon: ReceiptText, title: "A little help with prices", detail: "Ask about a dish or a drink", query: "What burgers are on the menu, and how much do they cost?" },
  { icon: Leaf, title: "Something vegetarian", detail: "Find a dish that suits you", query: "What vegetarian options are on the menu?" },
  { icon: MessageCircleHeart, title: "Tell us about your order", detail: "Get help with a concern", query: "I’d like to raise a concern about my order." },
];

export function Welcome({ onPrompt, disabled }: { onPrompt: (query: string) => void; disabled: boolean }) {
  return <div className="welcome" data-enter>
    <div className="welcome-symbol"><Asterisk size={48} strokeWidth={1.15} /></div>
    <p className="eyebrow">A seat at the conversation</p>
    <h1>Your Xander’s<br /><em>restaurant assistant.</em></h1>
    <p className="welcome-description">Menu questions, a favorite dish, or a little help with your order.<br className="desktop-break" /> Make yourself comfortable. Ask away.</p>
    <div className="suggestions">{suggestions.map(({ icon: Icon, title, detail, query }) =>
      <button key={title} onClick={() => onPrompt(query)} disabled={disabled} className="suggestion">
        <Icon size={19} strokeWidth={1.5} /><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight className="suggestion-arrow" size={16} />
      </button>)}</div>
  </div>;
}
