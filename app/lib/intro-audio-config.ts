export type IntroAudioMixSetting = {
  guideName: string;
  voiceUrl: string;
  voiceVolume: number;
  voiceDuration: number;
  musicUrl: string;
  musicVolume: number;
  musicStart: number;
  musicEnd: number;
  musicFadeIn: number;
  musicFadeOut: number;
  musicLoop: boolean;
  transcript: string;
};

export const introAudioSettingKey = 'intro_audio_mix';

export const defaultIntroTranscript = `Welcome to E. L. X. Studio. I am Martha Wrench, your guide.

If you already know what you need, skip now and go straight to Start Project. If you stay, watch the floating window. It mirrors the real site, so you can see where to click, what to choose, and what you can leave blank.

First, open Start Project. The page is a simple project intake: a clear brief on the left, and the four-step form on the right. No payment is collected here.

Step one is the service choice. Hover over a department to see specific services like floor plans, AutoCAD drafting, engineering calculations, financial models, reports, decks, or 3D rendering. Click the closest match, or skip the step and let us classify it from your brief.

Step two is the project brief. Add only what helps: a project title, the outcome you want, dimensions, standards, references, or source material. Fields are optional. A short note like three bedroom floor plan revision is enough to start.

Step three is delivery. Choose a deadline only if it matters, choose a format if you know it, and add a private file link when you already have drawings, documents, dashboards, sketches, P D F files, P P T X decks, Adobe files, AutoCAD files, Revit files, SolidWorks files, Excel files, or Power B I material.

Step four is review and contact. Use WhatsApp or email so we can return the manual quote. The summary shows what you selected, and the request goes for scope review before paid work begins.

The website also has a shop for architectural plans. Browse a house design, open the details, compare the plan information, and request customization before use.

Your workspace keeps messages, files, revisions, progress, and delivery connected after the request is received.

E. L. X. Studio is a department inside E. L. X. Holdings. The studio handles research, documentation, calculations, drawings, presentations, technical support, and project files.

E. L. X. Holdings also offers architectural work, electrical work, construction, installations and fittings, networking, and server rooms.`;

export const defaultIntroAudioMix: IntroAudioMixSetting = {
  guideName: 'Martha Wrench',
  voiceUrl: '/audio/elx-welcome.mp3',
  voiceVolume: 0.92,
  voiceDuration: 145.12,
  musicUrl: '/audio/busic.mp3',
  musicVolume: 0.14,
  musicStart: 0,
  musicEnd: 145.12,
  musicFadeIn: 2,
  musicFadeOut: 6,
  musicLoop: false,
  transcript: defaultIntroTranscript,
};

export function normalizeIntroAudioMix(value: unknown): IntroAudioMixSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultIntroAudioMix;
  const source = value as Partial<IntroAudioMixSetting>;
  const rawGuideName = cleanText(source.guideName, defaultIntroAudioMix.guideName, 80);
  const rawTranscript = cleanText(source.transcript, defaultIntroTranscript, 6000);
  const hasLegacyGuide = /pastor\s+wrench|ryan|maritha\s+wrench|ma-ri-tha\s+wrench|dr\.\s*maritha/i.test(rawGuideName);
  const hasLegacyTranscript = /pastor\s+wrench|ryan\s*\/\s*your|ma-ri-tha\s+wrench|maritha\s+wrench/i.test(rawTranscript);
  const shouldUseCurrentVoice = hasLegacyGuide || hasLegacyTranscript;
  const voiceDuration = shouldUseCurrentVoice ? defaultIntroAudioMix.voiceDuration : clampNumber(source.voiceDuration, 10, 600, defaultIntroAudioMix.voiceDuration);
  const musicStart = clampNumber(source.musicStart, 0, 600, defaultIntroAudioMix.musicStart);
  const rawMusicEnd = shouldUseCurrentVoice ? defaultIntroAudioMix.musicEnd : clampNumber(source.musicEnd, 0, 600, defaultIntroAudioMix.musicEnd);
  const musicEnd = rawMusicEnd > musicStart ? rawMusicEnd : Math.min(600, musicStart + 15);

  return {
    guideName: shouldUseCurrentVoice ? defaultIntroAudioMix.guideName : rawGuideName,
    voiceUrl: shouldUseCurrentVoice ? defaultIntroAudioMix.voiceUrl : cleanUrl(source.voiceUrl, defaultIntroAudioMix.voiceUrl),
    voiceVolume: clampNumber(source.voiceVolume, 0, 1, defaultIntroAudioMix.voiceVolume),
    voiceDuration,
    musicUrl: migrateLegacyMusicUrl(cleanUrl(source.musicUrl, '')),
    musicVolume: clampNumber(source.musicVolume, 0, 1, defaultIntroAudioMix.musicVolume),
    musicStart,
    musicEnd,
    musicFadeIn: clampNumber(source.musicFadeIn, 0, 20, defaultIntroAudioMix.musicFadeIn),
    musicFadeOut: clampNumber(source.musicFadeOut, 0, 20, defaultIntroAudioMix.musicFadeOut),
    musicLoop: typeof source.musicLoop === 'boolean' ? source.musicLoop : defaultIntroAudioMix.musicLoop,
    transcript: shouldUseCurrentVoice ? defaultIntroTranscript : rawTranscript,
  };
}

export function clampVolume(value: number) {
  return clampNumber(value, 0, 1, 0);
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, maxLength);
}

function cleanUrl(value: unknown, fallback: string) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return fallback;
  if (text.startsWith('/') || text.startsWith('https://') || text.startsWith('http://')) return text.slice(0, 1000);
  return fallback;
}

function migrateLegacyMusicUrl(value: string) {
  return value === '/audio/intro-music.mp3' ? '/audio/busic.mp3' : value;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
