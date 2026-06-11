// src/pages/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session found');
      setVerifying(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    fetch(`http://localhost:5000/api/v1/payments/verify?session_id=${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setVerifying(false);
        } else {
          setError(data.message || 'Verification failed');
          setVerifying(false);
        }
      })
      .catch(() => {
        setError('Failed to verify payment');
        setVerifying(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card variant="glass" className="p-12 text-center max-w-md border-white/10">
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verifying Payment...</h2>
              <p className="text-slate-400 text-sm">Please wait while we confirm your payment.</p>
            </>
          ) : error ? (
            <>
              <CheckCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <Button onClick={() => navigate('/plans')}>Try Again</Button>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Payment Successful! 🎉</h2>
              <p className="text-slate-400 text-sm mb-6">Welcome to CodeMaster Pro! You now have full access.</p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}