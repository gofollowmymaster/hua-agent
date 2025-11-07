export const spaceId = '7568684311303847955';
export const parentWikiToken = {
  'aplus-ui': 'An2Fw218Viz7nvknVJ0cJ4xpn5o',
  'aplus-antdv': 'DCiYwaD1jiDphikPTsKctHjmnNb',
  charts: 'Z5MRwcpddiRfq5k29T2cZjZWn6d',
  hooks: 'Hq2iwx1jviao3Mk0nLzcEXILndd',
  utils: 'PydnwowN2ixOm6kfbQtcmJ2ZnSc',
  other: 'Uf6iwYIqXizRrLknzzycd6SunQH',
};

export const getParentWikiToken = (name: string) => {
  if (!parentWikiToken[name]) name = 'other';
  return parentWikiToken[name];
};
