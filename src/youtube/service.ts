// biome-ignore lint/style/useImportType: <explanation>
import { YouTubeResponse } from "./model";
import { DOMParser } from "xmldom";
import { exec } from "child_process";
import { promisify } from "util";
export async function retrieveVideoClient(
  video_id: string,
): Promise<YouTubeResponse> {
  console.log("Retrieving video client for video ID:", video_id);
  const response = await fetch(`https://www.youtube.com/youtubei/v1/player`, {
    method: "POST",
    body: JSON.stringify({
      video_id,
      context: {
        client: {
          visitorData: process.env.VISITOR_DATA,
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; channel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36,gzip(gfe)",
          clientName: "WEB",
          clientVersion: "2.20260227.01.00",
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
  language: string,
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
        ] === language,
    );

  if (!subtitles) {
    throw new Error("No subtitles found");
  }
  const retrievedSubtitles = await fetch(subtitles?.baseUrl ?? "");
  if (!subtitles?.baseUrl) {
    throw new Error("No subtitles found");
  }
  if (!retrievedSubtitles.ok) {
    throw new Error(
      `Failed to retrieve subtitles: ${retrievedSubtitles.statusText}`,
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
          {} as Record<string, string>,
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
      "",
    );
  });

  return srtLines.join("\n").trim();
}

export async function mergeSubtitles(video_id: string, language: string) {
  const englishSubtitles = await retrieveSubtitles(video_id, "en");
  const chineseSubtitles = await retrieveSubtitles(video_id, language);
  const englishSubtitlesLines = englishSubtitles.split("\n");
  const chineseSubtitlesLines = chineseSubtitles.split("\n");
  const mergedSubtitlesLines: string[] = [];

  function groupSrtBlocks(lines: string[]): string[][] {
    const blocks: string[][] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (line.trim() === "") {
        if (current.length > 0) {
          blocks.push(current);
          current = [];
        }
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) {
      blocks.push(current);
    }
    return blocks;
  }

  const englishBlocks = groupSrtBlocks(englishSubtitlesLines);
  const chineseBlocks = groupSrtBlocks(chineseSubtitlesLines);

  for (
    let i = 0;
    i < Math.min(englishBlocks.length, chineseBlocks.length);
    i++
  ) {
    const enBlock = englishBlocks[i];
    const zhBlock = chineseBlocks[i];

    mergedSubtitlesLines.push(enBlock[0]);
    mergedSubtitlesLines.push(enBlock[1]);

    for (let j = 2; j < enBlock.length; j++) {
      if (enBlock[j].trim() !== "") {
        mergedSubtitlesLines.push(`(en) ${enBlock[j]}`);
      }
    }
    for (let j = 2; j < zhBlock.length; j++) {
      if (zhBlock[j].trim() !== "" && zhBlock[j].trim() !== enBlock[j].trim()) {
        const languageCode = language === "yue" ? "yue" : "zh";
        mergedSubtitlesLines.push(`(${languageCode}) ${zhBlock[j]}`);
      }
    }
    mergedSubtitlesLines.push("");
  }
  return mergedSubtitlesLines.join("\n");
}

const execAsync = promisify(exec);

/**
 * Downloads a YouTube video using youtube-dl asynchronously.
 * @param video_id The YouTube video ID.
 * @returns The stdout from the youtube-dl process.
 */
export async function downloadVideo(video_id: string): Promise<string> {
  if (!video_id) {
    throw new Error("video_id is required");
  }
  const url = `https://www.youtube.com/watch?v=${video_id}`;
  const command = `./modules/yt-dlp -f bestaudio --extract-audio --verbose --no-geo-bypass --cookies cookies.txt --no-check-certificate -o - | ffmpeg -i pipe: -ar 32000 -ac 1 -map 0:a -c:a flac ./audio/${video_id}.flac`;
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      // youtube-dl sometimes outputs non-error information to stderr, so don't always throw
      console.warn("youtube-dl stderr:", stderr);
    }
    return stdout;
  } catch (error: any) {
    throw new Error(`Failed to download video: ${error.message}`);
  }
}
