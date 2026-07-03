export interface SentryProject {
  id: string;
  slug: string;
  name: string;
  platform: string;
  dateCreated: string;
  isBookmarked: boolean;
  isMember: boolean;
  features: string[];
  firstEvent: string;
  firstTransactionEvent: boolean;
  access: string[];
  hasAccess: boolean;
  hasMinifiedStackTrace: boolean;
  hasFeedbacks: boolean;
  hasMonitors: boolean;
  hasNewFeedbacks: boolean;
  hasProfiles: boolean;
  hasReplays: boolean;
  hasFlags: boolean;
  hasSessions: boolean;
  hasInsightsHttp: boolean;
  hasInsightsDb: boolean;
  hasInsightsAssets: boolean;
  hasInsightsAppStart: boolean;
  hasInsightsScreenLoad: boolean;
  hasInsightsVitals: boolean;
  hasInsightsCaches: boolean;
  hasInsightsQueues: boolean;
  hasInsightsLlmMonitoring: boolean;
  hasInsightsAgentMonitoring: boolean;
  hasInsightsMCP: boolean;
  hasLogs: boolean;
  isInternal: boolean;
  isPublic: boolean;
  avatar: Avatar;
  color: string;
  status: string;
  team: Team;
  teams: Team[];
  latestRelease: LatestRelease;
  options: Options;
  digestsMinDelay: number;
  digestsMaxDelay: number;
  subjectPrefix: string;
  allowedDomains: string[];
  resolveAge: number;
  dataScrubber: boolean;
  dataScrubberDefaults: boolean;
  safeFields: string[];
  storeCrashReports: number;
  sensitiveFields: string[];
  subjectTemplate: string;
  securityToken: string;
  securityTokenHeader: string | null;
  verifySSL: boolean;
  scrubIPAddresses: boolean;
  scrapeJavaScript: boolean;
  groupingConfig: string;
  groupingEnhancements: string;
  derivedGroupingEnhancements: string;
  secondaryGroupingExpiry: number;
  secondaryGroupingConfig: string;
  fingerprintingRules: string;
  organization: Organization;
  plugins: Plugin[];
  platforms: string[];
  processingIssues: number;
  defaultEnvironment: string;
  relayPiiConfig: string | null;
  builtinSymbolSources: string[];
  dynamicSamplingBiases: DynamicSamplingBias[];
  symbolSources: string;
  tempestFetchScreenshots: boolean;
  tempestFetchDumps: boolean;
  debugFilesRole: string | null;
  isDynamicallySampled: boolean;
  autofixAutomationTuning: string;
  seerScannerAutomation: boolean;
  highlightTags: string[];
  highlightContext: Record<string, unknown>;
  highlightPreset: HighlightPreset;
}

export interface Avatar {
  avatarType: string;
  avatarUuid: string | null;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
}

export interface LatestRelease {
  version: string;
}

export interface Options {
  [key: string]: string | number | boolean | string[] | null;
}

export interface Organization {
  id: string;
  slug: string;
  status: Status;
  name: string;
  dateCreated: string;
  isEarlyAdopter: boolean;
  allowMemberInvite: boolean;
  allowMemberProjectCreation: boolean;
  allowSuperuserAccess: boolean;
  require2FA: boolean;
  avatar: Avatar;
  features: string[];
  links: Links;
  hasAuthProvider: boolean;
}

export interface Status {
  id: string;
  name: string;
}

export interface Links {
  organizationUrl: string;
  regionUrl: string;
}

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  type: string;
  canDisable: boolean;
  isTestable: boolean;
  hasConfiguration: boolean;
  metadata: Record<string, unknown>;
  contexts: unknown[];
  status: string;
  assets: unknown[];
  doc: string;
  firstPartyAlternative: string | null;
  deprecationDate: string | null;
  altIsSentryApp: string | null;
  enabled: boolean;
  version: string;
  author: Author;
  isDeprecated: boolean;
  isHidden: boolean;
  description: string;
  features: string[];
  featureDescriptions: FeatureDescription[];
  resourceLinks: ResourceLink[];
}

export interface Author {
  name: string;
  url: string;
}

export interface FeatureDescription {
  description: string;
  featureGate: string;
}

export interface ResourceLink {
  title: string;
  url: string;
}

export interface DynamicSamplingBias {
  id: string;
  active: boolean;
}

export interface HighlightPreset {
  tags: string[];
  context: Record<string, unknown>;
}
