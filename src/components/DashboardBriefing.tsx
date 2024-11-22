import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BackgroundVideo } from './dashboard/BackgroundVideo';
import { GreetingHeader } from './dashboard/GreetingHeader';
import { ActivitySummary } from './dashboard/ActivitySummary';
import { QuickActions } from './dashboard/QuickActions';

export function DashboardBriefing() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-4 sm:mb-8">
      <BackgroundVideo />

      <div className="relative z-10 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-6"
        >
          <GreetingHeader />

          <div className="flex items-center text-teal-100 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>

          <ActivitySummary />
          <QuickActions />
        </motion.div>
      </div>
    </div>
  );
}