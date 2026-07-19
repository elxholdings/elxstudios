import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { getAuthContext } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pythonPath = process.env.CHATTERBOX_PYTHON || 'C:\\Amazon\\chatterbox\\venv\\Scripts\\python.exe';
const personaPath = process.env.CHATTERBOX_PERSONA || 'C:\\Amazon\\chatterbox\\persona.py';
const outputWavPath = process.env.CHATTERBOX_OUTPUT_WAV || 'C:\\Amazon\\videos\\Voice\\persona.wav';
const jobRoot = join(process.cwd(), '.local-tts');
const publicAudioDir = join(process.cwd(), 'public', 'audio');
const publicTranscriptPath = join(publicAudioDir, 'elx-welcome-transcript.txt');
const publicMp3Path = join(publicAudioDir, 'elx-welcome.mp3');

type LocalTtsStatus = {
  jobId: string;
  status: 'queued' | 'running' | 'converting' | 'done' | 'error';
  message: string;
  duration?: number;
  audioUrl?: string;
  logPath?: string;
  updatedAt: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  if (process.env.VERCEL || process.platform !== 'win32') {
    return NextResponse.json({ error: 'Local Chatterbox TTS is only available when this Next.js admin app is running on the Windows computer that has C:\\Amazon\\chatterbox installed.' }, { status: 503 });
  }
  if (!existsSync(pythonPath) || !existsSync(personaPath)) {
    return NextResponse.json({ error: `Chatterbox paths were not found. Expected ${pythonPath} and ${personaPath}.` }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const transcript = cleanText(body.transcript, 6000);
  if (!transcript) return NextResponse.json({ error: 'Pastor Wrench script is required.' }, { status: 400 });

  const exaggeration = clampNumber(body.exaggeration, 0, 2, 0.45);
  const pace = clampNumber(body.pace, 0.1, 2, 0.5);
  const temperature = clampNumber(body.temperature, 0, 2, 0.8);
  const mode = cleanMode(body.mode);
  const jobId = randomUUID();
  const jobDir = join(jobRoot, jobId);
  const transcriptPath = join(jobDir, 'script.txt');
  const statusPath = join(jobDir, 'status.json');
  const logPath = join(jobDir, 'persona.log');
  const ffmpegLogPath = join(jobDir, 'ffmpeg.log');
  const runnerPath = join(jobDir, 'run.ps1');

  mkdirSync(jobDir, { recursive: true });
  mkdirSync(publicAudioDir, { recursive: true });
  writeFileSync(transcriptPath, transcript, 'utf8');
  writeFileSync(publicTranscriptPath, transcript, 'utf8');
  writeStatus(statusPath, { jobId, status: 'queued', message: 'Queued local Chatterbox generation.', updatedAt: new Date().toISOString() });
  writeFileSync(runnerPath, buildRunner({
    jobId,
    transcriptPath,
    statusPath,
    logPath,
    ffmpegLogPath,
    pythonPath,
    personaPath,
    outputWavPath,
    publicMp3Path,
    exaggeration,
    pace,
    temperature,
    mode,
  }), 'utf8');

  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', runnerPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();

  return NextResponse.json({ jobId, status: 'queued', message: 'Pastor Wrench generation started on this computer.' });
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { searchParams } = new URL(request.url);
  const jobId = String(searchParams.get('jobId') || '');
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) return NextResponse.json({ error: 'Valid jobId is required.' }, { status: 400 });
  const jobDir = join(jobRoot, jobId);
  const statusPath = join(jobDir, 'status.json');
  if (!existsSync(statusPath)) return NextResponse.json({ error: 'TTS job was not found on this machine.' }, { status: 404 });
  const status = JSON.parse(readFileSync(statusPath, 'utf8')) as LocalTtsStatus;
  return NextResponse.json({ ...status, log: readTail(join(jobDir, 'persona.log')), ffmpegLog: readTail(join(jobDir, 'ffmpeg.log')) });
}

async function requireAdmin() {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  }
  return null;
}

function writeStatus(path: string, status: LocalTtsStatus) {
  writeFileSync(path, JSON.stringify(status, null, 2), 'utf8');
}

function buildRunner(input: {
  jobId: string;
  transcriptPath: string;
  statusPath: string;
  logPath: string;
  ffmpegLogPath: string;
  pythonPath: string;
  personaPath: string;
  outputWavPath: string;
  publicMp3Path: string;
  exaggeration: number;
  pace: number;
  temperature: number;
  mode: string;
}) {
  return `$ErrorActionPreference = 'Stop'
$jobId = ${psQuote(input.jobId)}
$statusPath = ${psQuote(input.statusPath)}
function Write-LocalTtsStatus {
  param([string]$Status, [string]$Message, [double]$Duration = 0)
  $payload = [ordered]@{
    jobId = $jobId
    status = $Status
    message = $Message
    audioUrl = '/audio/elx-welcome.mp3?t=' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    duration = $Duration
    logPath = ${psQuote(input.logPath)}
    updatedAt = (Get-Date).ToString('o')
  }
  $payload | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statusPath -Encoding UTF8
}

try {
  Write-LocalTtsStatus -Status 'running' -Message 'Generating Pastor Wrench voice with Chatterbox.'
  $outputWav = ${psQuote(input.outputWavPath)}
  $outputDir = Split-Path -Path $outputWav -Parent
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
  if (Test-Path -LiteralPath $outputWav) {
    $backup = Join-Path $outputDir ('persona-admin-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.backup.wav')
    Move-Item -LiteralPath $outputWav -Destination $backup -Force
  }
  $monologue = Get-Content -LiteralPath ${psQuote(input.transcriptPath)} -Raw
  $ErrorActionPreference = 'Continue'
  & ${psQuote(input.pythonPath)} ${psQuote(input.personaPath)} $monologue ${toInvariant(input.exaggeration)} ${toInvariant(input.pace)} ${toInvariant(input.temperature)} ${psQuote(input.mode)} *> ${psQuote(input.logPath)}
  $personaExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($personaExitCode -ne 0) { throw "Chatterbox exited with code $personaExitCode." }
  if (!(Test-Path -LiteralPath $outputWav)) { throw 'Chatterbox finished without creating persona.wav.' }

  Write-LocalTtsStatus -Status 'converting' -Message 'Converting generated WAV to website MP3.'
  & ffmpeg -y -hide_banner -loglevel error -i $outputWav -codec:a libmp3lame -b:a 160k ${psQuote(input.publicMp3Path)} *> ${psQuote(input.ffmpegLogPath)}
  if (!(Test-Path -LiteralPath ${psQuote(input.publicMp3Path)})) { throw 'MP3 conversion failed.' }

  $durationText = (& ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 ${psQuote(input.publicMp3Path)} 2>$null)
  $duration = 0.0
  if ($durationText) {
    [void][double]::TryParse($durationText.Trim(), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$duration)
  }
  Write-LocalTtsStatus -Status 'done' -Message 'Pastor Wrench voice generated and copied into public/audio/elx-welcome.mp3.' -Duration $duration
} catch {
  $message = $_.Exception.Message
  Write-LocalTtsStatus -Status 'error' -Message $message
}
`;
}

function cleanText(value: unknown, maxLength: number) {
  return (typeof value === 'string' ? value.trim() : '').slice(0, maxLength);
}

function cleanMode(value: unknown) {
  const mode = cleanText(value, 30).toLowerCase();
  return mode || 'turbo';
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function psQuote(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function toInvariant(value: number) {
  return value.toString().replace(',', '.');
}

function readTail(path: string) {
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8').split(/\r?\n/).slice(-60).join('\n');
}
