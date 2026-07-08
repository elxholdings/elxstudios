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

export const defaultIntroTranscript = `Welcome to E. L. X. Studio. Complex work belongs here.

If you already know what you need, you can skip this introduction now and go straight to Start Project. No pressure. I will see you on the other side.

If you stay with me, here is the quick tour.

E. L. X. Studio gives you one place to bring the difficult parts of a project: calculations, drawings, CAD files, 3D concepts, financial models, reports, presentations, and professional documents.

Start by choosing the closest department. You do not have to know the perfect category. Pick what feels closest, and the team will refine the scope with you.

Next, describe the outcome you want. Add the goal, files, dimensions, data, deadline, software, standards, or references you already have. Leave anything blank if it does not matter yet.

Before paid work begins, you receive a clear proposed scope: what will be delivered, what files you should expect, timing, and the quoted price.

During production, your workspace keeps messages, progress, files, revisions, and delivery connected, so you are not hunting through scattered conversations.

When the work is ready, you receive the agreed files in a usable format, with review and revision support according to the scope.

That is the idea: your project may be technical, messy, urgent, or hard to explain. Your next step should still be simple.`;

export const defaultIntroAudioMix: IntroAudioMixSetting = {
  guideName: 'Pastor Wrench',
  voiceUrl: '/audio/elx-welcome.mp3',
  voiceVolume: 0.92,
  voiceDuration: 88.88,
  musicUrl: '/audio/intro-music.mp3',
  musicVolume: 0.14,
  musicStart: 0,
  musicEnd: 88.88,
  musicFadeIn: 2,
  musicFadeOut: 6,
  musicLoop: false,
  transcript: defaultIntroTranscript,
};

export function normalizeIntroAudioMix(value: unknown): IntroAudioMixSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultIntroAudioMix;
  const source = value as Partial<IntroAudioMixSetting>;
  const voiceDuration = clampNumber(source.voiceDuration, 10, 600, defaultIntroAudioMix.voiceDuration);
  const musicStart = clampNumber(source.musicStart, 0, 600, defaultIntroAudioMix.musicStart);
  const rawMusicEnd = clampNumber(source.musicEnd, 0, 600, defaultIntroAudioMix.musicEnd);
  const musicEnd = rawMusicEnd > musicStart ? rawMusicEnd : Math.min(600, musicStart + 15);

  return {
    guideName: cleanText(source.guideName, defaultIntroAudioMix.guideName, 80),
    voiceUrl: cleanUrl(source.voiceUrl, defaultIntroAudioMix.voiceUrl),
    voiceVolume: clampNumber(source.voiceVolume, 0, 1, defaultIntroAudioMix.voiceVolume),
    voiceDuration,
    musicUrl: cleanUrl(source.musicUrl, ''),
    musicVolume: clampNumber(source.musicVolume, 0, 1, defaultIntroAudioMix.musicVolume),
    musicStart,
    musicEnd,
    musicFadeIn: clampNumber(source.musicFadeIn, 0, 20, defaultIntroAudioMix.musicFadeIn),
    musicFadeOut: clampNumber(source.musicFadeOut, 0, 20, defaultIntroAudioMix.musicFadeOut),
    musicLoop: source.musicLoop !== false,
    transcript: cleanText(source.transcript, defaultIntroTranscript, 6000),
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

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
