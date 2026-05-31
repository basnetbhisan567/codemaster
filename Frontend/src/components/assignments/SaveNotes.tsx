import { Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface SaveNotesProps {
  onSave: () => void;
  isLoading?: boolean;
}

export const SaveNotes = ({ onSave, isLoading }: SaveNotesProps) => (
  <Button variant="outline" size="sm" onClick={onSave} isLoading={isLoading}>
    <Save className="w-4 h-4" /> Save Notes
  </Button>
);