// biome-ignore lint/style/useImportType: <explanation>
import { YouTubeResponse } from "./model";
import { DOMParser } from "xmldom";

export async function retrieveVideoClient(
  video_id: string
): Promise<YouTubeResponse> {
  console.log("Retrieving video client for video ID:", video_id);
  const response = await fetch(`https://www.youtube.com/youtubei/v1/player`, {
    method: "POST",
    body: JSON.stringify({
      video_id,
      context: {
        client: {
          hl: "en",
          client_name: "WEB",
          client_version: "2.20241107.11.00",
        },
        request: {
          use_ssl: true,
        },
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to retrieve video client: ${response.statusText}`);
  }
  const data = await response.json();
  console.log(data);
  return data as YouTubeResponse;
}

const LANGUAGE_CODE_MAP = {
  "zh-HK": "yue",
  "yue-HK": "yue",
  "en-GB": "en",
  "en-US": "en",
  "en-AU": "en",
  en: "en",
  "zh-CN": "zh",
  th: "th",
  "zh-TW": "zh",
  "zh-Hant": "zh",
};

export async function retrieveSubtitles(
  video_id: string,
  language: string
): Promise<string> {
  const youtubePlayer = await retrieveVideoClient(video_id);
  const subtitleTrack =
    youtubePlayer.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!subtitleTrack) {
    throw new Error("No subtitles found");
  }
  const subtitles =
    youtubePlayer.captions?.playerCaptionsTracklistRenderer.captionTracks.find(
      (track) =>
        LANGUAGE_CODE_MAP[
          track.languageCode as keyof typeof LANGUAGE_CODE_MAP
        ] === language
    );
  const retrievedSubtitles = await fetch(subtitles?.baseUrl ?? "");
  if (!subtitles?.baseUrl) {
    throw new Error("No subtitles found");
  }
  if (!retrievedSubtitles.ok) {
    throw new Error(
      `Failed to retrieve subtitles: ${retrievedSubtitles.statusText}`
    );
  }
  const xmlSubtitles = await retrievedSubtitles.text();
  const srtSubtitles = convertXmlToSrt(xmlSubtitles);
  return srtSubtitles;
}

function convertXmlToSrt(xml: string): string {
  // Fallback for environments without querySelectorAll (such as Node.js)
  const srtLines: string[] = [];

  function toSrtTimestamp(time: number): string {
    const h = Math.floor(time / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((time % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    const ms = Math.round((time - Math.floor(time)) * 1000)
      .toString()
      .padStart(3, "0");
    return `${h}:${m}:${s},${ms}`;
  }

  let textNodes: any[] = [];

  // Try DOMParser for browsers, otherwise fallback to XML parsing for Node.js
  try {
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      // querySelectorAll may not be available in some environments, fallback to getElementsByTagName
      if (typeof doc.querySelectorAll === "function") {
        textNodes = Array.from(doc.querySelectorAll("text"));
      } else if (typeof doc.getElementsByTagName === "function") {
        textNodes = Array.from(doc.getElementsByTagName("text"));
      }
    }
  } catch {}

  // Node.js fallback: use xml2js-like method if DOMParser is absent or failed
  if (textNodes.length === 0) {
    try {
      // Very simple manual parsing for <text ...>...</text>
      const textTagRegex = /<text([^>]*)>([\s\S]*?)<\/text>/g;
      let match: RegExpExecArray | null;
      while (true) {
        match = textTagRegex.exec(xml);
        if (match === null) {
          break;
        }
        // Parse attributes from match[1]
        const attrs = (match[1].match(/(\w+)="([^"]*)"/g) || []).reduce(
          (acc: any, v: string) => {
            const [key, val] = v.split("=");
            acc[key] = val.replace(/(^"|"$)/g, "");
            return acc;
          },
          {} as Record<string, string>
        );
        // Simulate an element-like object
        textNodes.push({
          getAttribute: (attr: string) => attrs[attr],
          textContent: match[2],
        });
      }
    } catch {}
  }

  textNodes.forEach((textElem: any, idx: number) => {
    const start = parseFloat(textElem.getAttribute("start") || "0");
    const dur = parseFloat(textElem.getAttribute("dur") || "0");
    const end = start + dur;
    let content = textElem.textContent || "";
    content = content
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    srtLines.push(
      (idx + 1).toString(),
      `${toSrtTimestamp(start)} --> ${toSrtTimestamp(end)}`,
      content.trim(),
      ""
    );
  });

  return srtLines.join("\n").trim();
}
