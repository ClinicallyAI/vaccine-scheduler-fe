import { Input } from "@/components/ui/input";

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function TimeInput({ value, onChange, disabled, className }: TimeInputProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    />
  );
}