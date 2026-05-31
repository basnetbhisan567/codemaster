import { useState } from 'react';
import { Save, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

interface QuickNotesProps {
  topicId: string;
  initialNotes?: Note[];
}

export const QuickNotes = ({ topicId, initialNotes = [] }: QuickNotesProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
    };
    
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Edit2 className="w-4 h-4" />
        Quick Notes
      </h3>
      
      <div className="flex gap-2">
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addNote()}
          placeholder="Write a note..."
          className="flex-1 px-3 py-2 bg-secondary/20 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <Button size="sm" onClick={addNote} className="gap-1">
          <Save className="w-3 h-3" />
          Save
        </Button>
      </div>
      
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-secondary/20 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm flex-1">{note.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNote(note.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {note.timestamp.toLocaleTimeString()}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};