import ErrorUnresolveCard from './error-unresolve-card';
import CommonAlertCard from './alert-card';

const alertCards = {
  unresolvedCard: ErrorUnresolveCard,
  commonCard: CommonAlertCard,
};
export default alertCards;
export type CardType = keyof typeof alertCards;
