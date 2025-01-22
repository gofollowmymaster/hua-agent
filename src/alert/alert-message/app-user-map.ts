export const appUserMap = {
  'aplus-admin-bms': {
    groupId: 'oc_ff9b51aa0f916fa8b8a372e0919b1159',
    userId: '3fd2f4f7',
  },
  'aplus-user-bms': {
    groupId: 'oc_ff9b51aa0f916fa8b8a372e0919b1159',
    userId: '3fd2f4f7',
  },
  'aplus-admin-mos': {
    groupId: 'oc_1aaa1e99338b62e4c28f512ba4af7f28',
    userId: 'c4534fad',
  },
  'aplus-user-mos': {
    groupId: 'oc_1aaa1e99338b62e4c28f512ba4af7f28',
    userId: 'c4534fad',
  },
  'aplus-admin-wms': {
    groupId: 'oc_ca28717489700c2fe873406fcfa867a4',
    userId: '762a5468',
  },
  'aplus-user-wms': {
    groupId: 'oc_ca28717489700c2fe873406fcfa867a4',
    userId: '762a5468',
  },
  'aplus-admin-main': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'a439d3fe',
  },
  'aplus-user-main': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'a439d3fe',
  },
};

export default (projectName: string) => {
  if (process.env.NODE_ENV == 'dev') {
    return {
      groupId: 'oc_b030f5155cad2838eeacadc977f403b0',
      userId: '762a5468',
    };
  }
  return appUserMap[projectName];
};
