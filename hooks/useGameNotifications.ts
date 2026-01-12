import { useToast } from '../contexts/ToastContext';
import { Movie, Actor } from '../types';

/**
 * Hook for game-specific notifications
 * Provides convenient methods for common game events
 */
export const useGameNotifications = () => {
  const { addToast } = useToast();

  return {
    // Film released
    notifyFilmReleased: (filmTitle: string, onView?: () => void) => {
      addToast({
        type: 'success',
        title: '🎬 Film Released!',
        message: `"${filmTitle}" is now in theaters!`,
        duration: 7000,
        action: onView ? {
          label: 'View Box Office',
          onClick: onView,
        } : undefined,
      });
    },

    // Film completed production
    notifyFilmCompleted: (filmTitle: string, quality: number) => {
      const qualityLabel = quality >= 80 ? 'Excellent' : quality >= 60 ? 'Good' : quality >= 40 ? 'Average' : 'Poor';
      addToast({
        type: 'info',
        title: '🎥 Production Complete',
        message: `"${filmTitle}" has wrapped! Quality: ${qualityLabel} (${quality})`,
        duration: 5000,
      });
    },

    // Contract expiring soon
    notifyContractExpiring: (actorName: string, monthsLeft: number, onRenew?: () => void) => {
      addToast({
        type: 'warning',
        title: '⚠️ Contract Expiring',
        message: `${actorName}'s contract expires in ${monthsLeft} month${monthsLeft !== 1 ? 's' : ''}!`,
        duration: 0, // Persist until dismissed
        action: onRenew ? {
          label: 'Renew Contract',
          onClick: onRenew,
        } : undefined,
      });
    },

    // Contract expired
    notifyContractExpired: (actorName: string) => {
      addToast({
        type: 'error',
        title: '❌ Contract Expired',
        message: `${actorName} is no longer under contract and has left your studio.`,
        duration: 8000,
      });
    },

    // Award nomination
    notifyAwardNomination: (count: number, year: number, onView?: () => void) => {
      addToast({
        type: 'success',
        title: '🏆 Award Nominations!',
        message: `You received ${count} Academy Award nomination${count !== 1 ? 's' : ''} for ${year}!`,
        duration: 10000,
        action: onView ? {
          label: 'View Nominations',
          onClick: onView,
        } : undefined,
      });
    },

    // Award won
    notifyAwardWon: (category: string, filmOrActor: string) => {
      addToast({
        type: 'success',
        title: '🏆 Oscar Winner!',
        message: `${filmOrActor} won Best ${category}!`,
        duration: 10000,
      });
    },

    // Low cash warning
    notifyLowCash: (balance: number) => {
      addToast({
        type: 'warning',
        title: '💰 Low Funds',
        message: `Your studio balance is low: $${(balance / 1000000).toFixed(1)}M. Consider releasing a film or cutting costs.`,
        duration: 8000,
      });
    },

    // Script purchased
    notifyScriptPurchased: (scriptTitle: string, price: number) => {
      addToast({
        type: 'info',
        title: '📝 Script Acquired',
        message: `Purchased "${scriptTitle}" for $${(price / 1000000).toFixed(1)}M`,
        duration: 4000,
      });
    },

    // Script Acquired (Generic)
    notifyScriptAcquired: (scriptTitle: string) => {
      addToast({
        type: 'info',
        title: '📝 Script Acquired',
        message: `Acquired rights to "${scriptTitle}".`,
        duration: 4000,
      });
    },

    // Actor hired
    notifyActorHired: (actorName: string, salary: number) => {
      addToast({
        type: 'success',
        title: '⭐ Actor Signed',
        message: `${actorName} joined your roster! Salary: $${(salary / 1000).toFixed(0)}K/mo`,
        duration: 5000,
      });
    },

    // Film flopped
    notifyFilmFlopped: (filmTitle: string, loss: number) => {
      addToast({
        type: 'error',
        title: '💀 Box Office Flop',
        message: `"${filmTitle}" bombed! Loss: $${Math.abs(loss / 1000000).toFixed(1)}M`,
        duration: 8000,
      });
    },

    // Film success
    notifyFilmSuccess: (filmTitle: string, profit: number) => {
      addToast({
        type: 'success',
        title: '💰 Box Office Hit!',
        message: `"${filmTitle}" is a success! Profit: $${(profit / 1000000).toFixed(1)}M`,
        duration: 8000,
      });
    },

    // Generic notification
    notify: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 5000) => {
      addToast({
        type,
        title,
        message,
        duration,
      });
    },
  };
};
