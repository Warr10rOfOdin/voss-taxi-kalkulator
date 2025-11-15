import { useState } from 'react';

export default function HelpTooltip({ text }) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <span 
      className="help-icon"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      ?
      {isVisible && (
        <span className="help-tooltip">{text}</span>
      )}
    </span>
  );
}
