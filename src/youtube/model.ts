export interface Client {
  hl: string;
  clientName: string;
  clientVersion: string;
}

export interface Request {
  useSsl: boolean;
}

export interface Context {
  client: Client;
  request: Request;
}

export interface VideoInfoRequest {
  videoId: string;
  context: Context;
}

export interface YouTubeResponse {
  responseContext: ResponseContext;
  playabilityStatus: PlayabilityStatus;
  streamingData: StreamingData;
  playerConfig: PlayerConfig;
  videoDetails: VideoDetails;
  microformat: Microformat;
  cards: Cards;
  trackingParams: string;
  captions: Captions;
}

export interface ResponseContext {
  visitorData: string;
  serviceTrackingParams: ServiceTrackingParam[];
}

export interface ServiceTrackingParam {
  service: string;
  params: Param[];
}

export interface Param {
  key: string;
  value: string;
}

export interface Captions {
  playerCaptionsTracklistRenderer: PlayerCaptionsTracklistRenderer;
}

export interface PlayerCaptionsTracklistRenderer {
  captionTracks: CaptionTrack[];
  audioTracks: AudioTrack[];
  translationLanguages: TranslationLanguage[];
  defaultAudioTrackIndex: number;
}

export interface CaptionTrack {
  baseUrl: string;
  name: SimpleName;
  vssId: string;
  kind: string | null;
  asr: string | null;
  languageCode: string;
  isTranslatable: boolean;
  trackName: string;
}

export interface SimpleName {
  simpleText: string;
}

export interface AudioTrack {
  captionTrackIndices: number[];
}

export interface TranslationLanguage {
  languageCode: string;
  languageName: SimpleName;
}

export interface PlayabilityStatus {
  status: string;
  playableInEmbed: boolean;
  contextParams: string;
}

export interface StreamingData {
  expiresInSeconds: string;
  formats: Format[];
  adaptiveFormats: AdaptiveFormat[];
}

export interface Format {
  itag: number;
  mimeType: string;
  bitrate: number;
  width: number;
  height: number;
  lastModified: string;
  quality: string;
}

export interface AdaptiveFormat {
  itag: number;
  mimeType: string;
  bitrate: number;
  width: number | null;
  height: number | null;
}

export interface PlayerConfig {
  audioConfig: AudioConfig;
  streamSelectionConfig: StreamSelectionConfig;
}

export interface AudioConfig {
  loudnessDb: number;
  perceptualLoudnessDb: number;
}

export interface StreamSelectionConfig {
  maxBitrate: string;
}

export interface VideoDetails {
  videoId: string;
  title: string;
  lengthSeconds: string;
  isOwnerViewing: boolean;
  channelId: string;
  shortDescription: string;
  viewCount: string;
  author: string;
  isPrivate: boolean;
  isLiveContent: boolean;
}

export interface Microformat {
  playerMicroformatRenderer: PlayerMicroformatRenderer;
}

export interface PlayerMicroformatRenderer {
  title: SimpleText;
  description: SimpleText | null;
  lengthSeconds: string;
  ownerProfileUrl: string;
  viewCount: string;
  category: string;
}

export interface SimpleText {
  simpleText: string;
}

export interface Cards {
  cardCollectionRenderer: CardCollectionRenderer;
}

export interface CardCollectionRenderer {
  cards: Card[];
  headerText: SimpleText;
}

export interface Card {
  cardRenderer: CardRenderer;
}

export interface CardRenderer {
  teaser: Teaser;
  trackingParams: string;
}

export interface Teaser {
  simpleCardTeaserRenderer: SimpleCardTeaserRenderer;
}

export interface SimpleCardTeaserRenderer {
  message: SimpleText;
  prominent: boolean;
}
