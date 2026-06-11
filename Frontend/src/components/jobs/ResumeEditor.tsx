import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Edit3, Plus } from 'lucide-react';
import { ResumeData } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { jobService } from '../../services/jobService';

export function ResumeEditor() {
  const [showForm, setShowForm] = useState(false);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchResume = async () => {
    try {
      const data = await jobService.getResume();
      if (data) {
        setResume(data);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error);
    }
  };

  const handleSaveResume = async () => {
    if (!resume) return;
    setLoading(true);
    try {
      await jobService.saveResume(resume);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Resume Editor</h2>
        <Button
          size="sm"
          onClick={fetchResume}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Load Resume
        </Button>
      </div>

      {!showForm ? (
        <Card variant="glass" className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No resume yet</p>
          <Button
            className="mt-4 gap-2"
            onClick={() => {
              setResume({
                full_name: '',
                email: '',
                phone: '',
                summary: '',
                skills: [],
                experience: [],
                education: [],
                projects: [],
                portfolio_url: '',
                github_url: '',
                linkedin_url: '',
              });
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Create Resume
          </Button>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card variant="glass" className="p-6 border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={resume?.full_name || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, full_name: e.target.value } : null)
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={resume?.email || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, email: e.target.value } : null)
                }
              />
              <Input
                placeholder="Phone"
                value={resume?.phone || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, phone: e.target.value } : null)
                }
              />
              <Input
                placeholder="Portfolio URL"
                value={resume?.portfolio_url || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, portfolio_url: e.target.value } : null)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Professional Summary</label>
              <textarea
                placeholder="Write your professional summary..."
                value={resume?.summary || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, summary: e.target.value } : null)
                }
                className="w-full h-24 bg-transparent border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Skills (comma separated)</label>
              <Input
                placeholder="React, TypeScript, Node.js, Python..."
                value={resume?.skills?.join(', ') || ''}
                onChange={(e) =>
                  setResume(
                    resume
                      ? {
                          ...resume,
                          skills: e.target.value.split(',').map((s) => s.trim()),
                        }
                      : null
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="GitHub URL"
                value={resume?.github_url || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, github_url: e.target.value } : null)
                }
              />
              <Input
                placeholder="LinkedIn URL"
                value={resume?.linkedin_url || ''}
                onChange={(e) =>
                  setResume(resume ? { ...resume, linkedin_url: e.target.value } : null)
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveResume} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Resume'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}