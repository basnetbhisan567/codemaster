import { motion } from 'framer-motion';
import { ExitVerification } from '../components/lockdown/ExitVerification';

const LockScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-[80vh]"
    >
      <ExitVerification />
    </motion.div>
  );
};

export default LockScreen;