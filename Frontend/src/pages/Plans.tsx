// src/pages/Plans.tsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    plan: 'free',
    features: ['3 problems/day', 'Basic playground', 'Community access', '1 music playlist', 'Read tech blogs'],
    hl: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'month',
    plan: 'pro',
    features: ['Unlimited problems', 'AI code review (100/mo)', 'AI chat (200/mo)', 'Job board access', 'AI tools directory', 'All music playlists', 'Focus mode (90min)', '3 projects'],
    hl: true,
  },
  {
    name: 'Pro Max',
    price: '$99',
    period: 'month',
    plan: 'pro_max',
    features: ['Everything in Pro', 'Unlimited AI reviews', 'Unlimited AI chat', 'API access', 'SSO', 'Custom music playlists', 'Unlimited projects', 'Live chat support'],
    hl: false,
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleSelectPlan = async (plan: string) => {
    if (plan === 'free') {
      if (!isAuthenticated) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect to Stripe checkout via backend
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/v1/payments/checkout?plan=${plan}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url; // Redirect to Stripe
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0a0a0f] py-24 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <Badge variant="success" size="sm" className="mb-4">
          <Crown className="w-3 h-3 mr-1" /> Pricing
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Choose Your Plan
        </h1>
        <p className="text-slate-400 mb-12 max-w-xl mx-auto">
          Start free, upgrade when you're ready for more power.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {p.hl && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="success" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}
              <Card
                variant="glass"
                className={`p-6 h-full border-white/10 ${
                  p.hl ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-slate-400">/{p.period}</span>
                </div>
                <ul className="space-y-3 mb-6 text-left">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.hl ? 'default' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan(p.plan)}
                >
                  {p.plan === 'free' ? 'Get Started Free' : `Subscribe to ${p.name}`}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}