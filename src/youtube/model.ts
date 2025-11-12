// use crate::constants::utility::{log_error, log_query};
// use crate::services::srt::Srt;
// use once_cell::sync::Lazy;
// use serde::{Deserialize, Serialize};
// use std::collections::HashMap;
// use std::fs::File;
// use std::process::Command;
// pub struct Youtube;
// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct YouTubeResponse {
//     pub response_context: ResponseContext,
//     pub playability_status: PlayabilityStatus,
//     pub streaming_data: StreamingData,
//     pub player_config: PlayerConfig,
//     pub video_details: VideoDetails,
//     pub microformat: Microformat,
//     pub cards: Cards,
//     pub tracking_params: String,
//     pub captions: Option<Captions>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Captions {
//     #[serde(rename = "playerCaptionsTracklistRenderer")]
//     pub player_captions_tracklist_renderer: PlayerCaptionsTracklistRenderer,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PlayerCaptionsTracklistRenderer {
//     pub caption_tracks: Vec<CaptionTrack>,
//     pub audio_tracks: Vec<AudioTrack>,
//     pub translation_languages: Vec<TranslationLanguage>,
//     pub default_audio_track_index: i32,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct CaptionTrack {
//     pub base_url: String,
//     pub name: SimpleName,
//     pub vss_id: String,
//     pub kind: Option<String>,
//     pub asr: Option<String>,
//     pub language_code: String,
//     pub is_translatable: bool,
//     pub track_name: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct SimpleName {
//     #[serde(rename = "simpleText")]
//     pub simple_text: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct AudioTrack {
//     #[serde(rename = "captionTrackIndices")]
//     pub caption_track_indices: Vec<i32>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct TranslationLanguage {
//     pub language_code: String,
//     pub language_name: SimpleName,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct ResponseContext {
//     pub visitor_data: String,
//     pub service_tracking_params: Vec<ServiceTrackingParam>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct ServiceTrackingParam {
//     pub service: String,
//     pub params: Vec<Param>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Param {
//     pub key: String,
//     pub value: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PlayabilityStatus {
//     pub status: String,
//     pub playable_in_embed: bool,
//     pub context_params: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct StreamingData {
//     pub expires_in_seconds: String,
//     pub formats: Vec<Format>,
//     pub adaptive_formats: Vec<AdaptiveFormat>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct Format {
//     pub itag: i32,
//     pub mime_type: String,
//     pub bitrate: i64,
//     pub width: i32,
//     pub height: i32,
//     pub last_modified: String,
//     pub quality: String,
//     pub fps: i32,
//     pub url: Option<String>,
//     pub signature_cipher: Option<String>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct AdaptiveFormat {
//     pub itag: i32,
//     pub mime_type: String,
//     pub bitrate: i64,
//     pub width: Option<i32>,
//     pub height: Option<i32>,
//     pub init_range: Option<Range>,
//     pub index_range: Option<Range>,
//     pub audio_quality: Option<String>,
//     pub quality: String,
//     pub fps: Option<i32>,
//     pub url: Option<String>,
//     pub signature_cipher: Option<String>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Range {
//     pub start: String,
//     pub end: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PlayerConfig {
//     pub audio_config: AudioConfig,
//     pub stream_selection_config: StreamSelectionConfig,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct AudioConfig {
//     pub loudness_db: f32,
//     pub perceptual_loudness_db: f32,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct StreamSelectionConfig {
//     #[serde(rename = "maxBitrate")]
//     pub max_bitrate: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct VideoDetails {
//     pub video_id: String,
//     pub title: String,
//     pub length_seconds: String,
//     pub is_owner_viewing: bool,
//     pub channel_id: String,
//     pub short_description: String,
//     pub view_count: String,
//     pub author: String,
//     pub is_private: bool,
//     pub is_live_content: bool,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Microformat {
//     #[serde(rename = "playerMicroformatRenderer")]
//     pub player_microformat_renderer: PlayerMicroformatRenderer,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PlayerMicroformatRenderer {
//     pub title: SimpleText,
//     pub description: Option<SimpleText>,
//     pub length_seconds: String,
//     pub owner_profile_url: String,
//     pub view_count: String,
//     pub category: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct SimpleText {
//     #[serde(rename = "simpleText")]
//     pub simple_text: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Cards {
//     #[serde(rename = "cardCollectionRenderer")]
//     pub card_collection_renderer: CardCollectionRenderer,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct CardCollectionRenderer {
//     pub cards: Vec<Card>,
//     #[serde(rename = "headerText")]
//     pub header_text: SimpleText,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Card {
//     #[serde(rename = "cardRenderer")]
//     pub card_renderer: CardRenderer,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct CardRenderer {
//     pub teaser: Teaser,
//     #[serde(rename = "trackingParams")]
//     pub tracking_params: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Teaser {
//     #[serde(rename = "simpleCardTeaserRenderer")]
//     pub simple_card_teaser_renderer: SimpleCardTeaserRenderer,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct SimpleCardTeaserRenderer {
//     pub message: SimpleText,
//     pub prominent: bool,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Message {
//     #[serde(rename = "mealbarPromoRenderer")]
//     pub mealbar_promo_renderer: Option<MealbarPromoRenderer>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct MealbarPromoRenderer {
//     pub message_texts: Vec<MessageText>,
//     pub is_visible: bool,
//     pub tracking_params: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct MessageText {
//     pub runs: Vec<TextRun>,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct TextRun {
//     pub text: String,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct VideoInfoRequest {
//     #[serde(rename = "videoId")]
//     video_id: String,
//     context: Context,
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Context {
//     client: Client,
//     request: Request,
// }

// #[derive(Debug, Serialize, Deserialize)]
// struct Client {
//     hl: String,
//     #[serde(rename = "clientName")]
//     client_name: String,
//     #[serde(rename = "clientVersion")]
//     client_version: String,
// }

export interface Client {
  hl: string;
  client_name: string;
  client_version: string;
}

export interface Request {
  use_ssl: boolean;
}

export interface Context {
  client: Client;
  request: Request;
}

export interface VideoInfoRequest {
  video_id: string;
  context: Context;
}

export interface YouTubeResponse {
  response_context: ResponseContext;
  playability_status: PlayabilityStatus;
  streaming_data: StreamingData;
  player_config: PlayerConfig;
  video_details: VideoDetails;
  microformat: Microformat;
  cards: Cards;
  tracking_params: string;
  captions: Captions;
}

export interface ResponseContext {
  visitor_data: string;
  service_tracking_params: ServiceTrackingParam[];
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
  player_captions_tracklist_renderer: PlayerCaptionsTracklistRenderer;
}

export interface PlayerCaptionsTracklistRenderer {
  caption_tracks: CaptionTrack[];
  audio_tracks: AudioTrack[];
  translation_languages: TranslationLanguage[];
  default_audio_track_index: number;
}

export interface CaptionTrack {
  base_url: string;
  name: SimpleName;
  vss_id: string;
  kind: string | null;
  asr: string | null;
  language_code: string;
  is_translatable: boolean;
  track_name: string;
}

export interface SimpleName {
  simple_text: string;
}

export interface AudioTrack {
  caption_track_indices: number[];
}

export interface TranslationLanguage {
  language_code: string;
  language_name: SimpleName;
}

export interface PlayabilityStatus {
  status: string;
  playable_in_embed: boolean;
  context_params: string;
}

export interface StreamingData {
  expires_in_seconds: string;
  formats: Format[];
  adaptive_formats: AdaptiveFormat[];
}

export interface Format {
  itag: number;
  mime_type: string;
  bitrate: number;
  width: number;
  height: number;
  last_modified: string;
  quality: string;
}

export interface AdaptiveFormat {
  itag: number;
  mime_type: string;
  bitrate: number;
  width: number | null;
  height: number | null;
}

export interface PlayerConfig {
  audio_config: AudioConfig;
  stream_selection_config: StreamSelectionConfig;
}

export interface AudioConfig {
  loudness_db: number;
  perceptual_loudness_db: number;
}

export interface StreamSelectionConfig {
  max_bitrate: string;
}

export interface VideoDetails {
  video_id: string;
  title: string;
  length_seconds: string;
  is_owner_viewing: boolean;
  channel_id: string;
  short_description: string;
  view_count: string;
  author: string;
  is_private: boolean;
  is_live_content: boolean;
}

export interface Microformat {
  player_microformat_renderer: PlayerMicroformatRenderer;
}

export interface PlayerMicroformatRenderer {
  title: SimpleText;
  description: SimpleText | null;
  length_seconds: string;
  owner_profile_url: string;
  view_count: string;
  category: string;
}

export interface SimpleText {
  simple_text: string;
}

export interface Cards {
  card_collection_renderer: CardCollectionRenderer;
}

export interface CardCollectionRenderer {
  cards: Card[];
  header_text: SimpleText;
}

export interface Card {
  card_renderer: CardRenderer;
}

export interface CardRenderer {
  teaser: Teaser;
  tracking_params: string;
}

export interface Teaser {
  simple_card_teaser_renderer: SimpleCardTeaserRenderer;
}

export interface SimpleCardTeaserRenderer {
  message: SimpleText;
  prominent: boolean;
}
