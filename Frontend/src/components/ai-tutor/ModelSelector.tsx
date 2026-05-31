interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ModelSelector = ({ value, onChange, className }: ModelSelectorProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className || ''}`}
    >
      <option value="gemini-1.5-flash">Gemini Flash</option>
      <option value="gemini-1.5-pro">Gemini Pro</option>
      <option value="claude-3-haiku">Claude Haiku</option>
      <option value="mistral-small">Mistral Small</option>
    </select>
  );
};