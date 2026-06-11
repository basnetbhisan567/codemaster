// src/pages/PaymentCancel.tsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card variant="glass" className="p-12 text-center max-w-md border-white/10">
          <XCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Payment Cancelled</h2>
          <p className="text-slate-400 text-sm mb-6">No worries! You can try again anytime.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/plans')}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}