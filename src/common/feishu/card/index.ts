import ErrorUnresolveCard from './error-unresolved-card';
import CommonAlertCard from './alert-card';

const alertCards = {
  unresolvedCard: ErrorUnresolveCard,
  commonCard: CommonAlertCard,
};
export default alertCards;
export type CardType = keyof typeof alertCards;
