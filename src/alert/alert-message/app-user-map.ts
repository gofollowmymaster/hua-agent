type AppInfo = {
  groupId: string;
  userId: string;
  bu?: string;
  id?: string;
};
export const appUserMap: Record<string, AppInfo> = {
  'subapp-admin-bms': {
    groupId: 'oc_ff9b51aa0f916fa8b8a372e0919b1159',
    userId: 'ou_64e274ef9cb7b7a7bc8b1448169bc79c',
    bu: 'recuwVEngyBkYp',
  },

  'subapp-user-bms': {
    groupId: 'oc_ff9b51aa0f916fa8b8a372e0919b1159',
    userId: 'ou_64e274ef9cb7b7a7bc8b1448169bc79c',
    bu: 'recuwVEngyBkYp',
  },

  'subapp-admin-mos': {
    groupId: 'oc_1aaa1e99338b62e4c28f512ba4af7f28',
    userId: 'ou_a1259cb97cd9853f842537d9c8966f43',
    bu: 'recuwVEngyXbfv',
  },

  'subapp-user-mos': {
    groupId: 'oc_1aaa1e99338b62e4c28f512ba4af7f28',
    userId: 'ou_a1259cb97cd9853f842537d9c8966f43',
    bu: 'recuwVEngyXbfv',
  },

  'subapp-admin-wms': {
    groupId: 'oc_ca28717489700c2fe873406fcfa867a4',
    userId: 'ou_d81434213768e37b46e24266f72b6085',
    bu: 'recuwVEngy1rzk',
  },

  'subapp-user-wms': {
    groupId: 'oc_ca28717489700c2fe873406fcfa867a4',
    userId: 'ou_d81434213768e37b46e24266f72b6085',
    bu: 'recuwVEngy1rzk',
  },
  'subapp-admin-base': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'ou_343656b12664a8f692eb03873d98fa59',
    bu: 'recuwVEngyXUnD',
  },
  'subapp-user-base': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'ou_343656b12664a8f692eb03873d98fa59',
    bu: 'recuwVEngyXUnD',
  },

  'aplus-user': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'ou_343656b12664a8f692eb03873d98fa59',
    bu: 'recuwVEngyXUnD',
  },
  'aplus-admin': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'ou_343656b12664a8f692eb03873d98fa59',
    bu: 'recuwVEngyXUnD',
  },

  'login-center': {
    groupId: 'oc_1f846787d104e26e5bd50b7a25894f05',
    userId: 'ou_d81434213768e37b46e24266f72b6085',
    bu: 'recuwVEngyXUnD',
  },
};

export const getSubAppInfo = (moduleName: string) => {
  return appUserMap[moduleName] || appUserMap['aplus-user'];
};

export const apiModuleBuMap = {
  im: 'recuwVEngyXUnD',
  'download-center': 'recuwVEngyXUnD',
  wms: 'recuwVEngy1rzk',
  ad: 'recuwVEngyXbfv',
};
