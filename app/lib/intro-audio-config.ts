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

export const defaultIntroTranscript = `Welcome to E. L. X. Studio. I am Dr. Ma-ri-tha Wrench, your guide.

If you already know what you need, skip now and go straight to Start Project. If you stay, watch the floating window. It mirrors the real site, points where to click, and shows what to type.

First, click Start Project. Choose the closest support department: writing, STEM, architecture, CAD, 3D, finance, or business. Hover to see specific services, then click the closest match.

Next, type only what matters. A title like three bedroom floor plan revision is enough to begin. Add goals, dimensions, deadlines, software, standards, references, or final files only when they help. Blank fields are allowed.

Bring the material you already have. P D F files, P P T X decks, Adobe files, AutoCAD drawings, Revit, SolidWorks, Excel, Power B I, sketches, reports, data, and raw notes are welcome.

After submission, E. L. X. Studio reviews the brief and confirms scope, timing, deliverables, formats, and price before paid work begins.

The website also has a shop for architectural plans. Browse a house design, open the details, compare the plan information, and request customization before use.

Your workspace keeps messages, files, revisions, progress, and delivery connected.

E. L. X. Studio is a department inside E. L. X. Holdings. The studio handles research, documentation, calculations, drawings, presentations, technical support, and project files.

E. L. X. Holdings also offers architectural work, electrical work, construction, installations and fittings, networking, and server rooms.`;

export const defaultIntroAudioMix: IntroAudioMixSetting = {
  guideName: 'Dr. Maritha Wrench',
  voiceUrl: '/audio/elx-welcome.mp3',
  voiceVolume: 0.92,
  voiceDuration: 115.8,
  musicUrl: '/audio/busic.mp3',
  musicVolume: 0.14,
  musicStart: 0,
  musicEnd: 115.8,
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
  const hasLegacyGuide = /pastor\s+wrench|ryan/i.test(rawGuideName);
  const hasLegacyTranscript = /pastor\s+wrench|ryan\s*\/\s*your/i.test(rawTranscript);
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
