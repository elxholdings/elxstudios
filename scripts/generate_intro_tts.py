import argparse
import os
import re
import sys

PROJECT_CACHE = os.path.abspath(os.path.join(os.getcwd(), ".local-tts", "cache"))
os.makedirs(PROJECT_CACHE, exist_ok=True)
os.environ.setdefault("NUMBA_CACHE_DIR", os.path.join(PROJECT_CACHE, "numba"))

SOURCE_PATH = "C:/Amazon/chatterbox/src"
PERSONA_PROMPT_PATH = "C:/Amazon/videos/voice sample/persona.wav"

if SOURCE_PATH not in sys.path:
    sys.path.insert(0, SOURCE_PATH)

try:
    import torch
    import torchaudio as ta
    from chatterbox.tts import ChatterboxTTS
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
except ImportError as error:
    print(f"FATAL ERROR: Could not import Chatterbox modules. {error}", file=sys.stderr)
    sys.exit(1)


def split_text(text: str, max_chars: int = 230) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        if not sentence:
            continue
        candidate = f"{current} {sentence}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the E.L.X Studio intro voice with Chatterbox.")
    parser.add_argument("--text-file", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--exaggeration", type=float, default=0.45)
    parser.add_argument("--pace", type=float, default=0.5)
    parser.add_argument("--temperature", type=float, default=0.8)
    parser.add_argument("--mode", default="normal", choices=["normal", "turbo", "multi"])
    args = parser.parse_args()

    if not os.path.exists(PERSONA_PROMPT_PATH):
        print(f"FATAL ERROR: Prompt file missing at {PERSONA_PROMPT_PATH}", file=sys.stderr)
        return 1

    with open(args.text_file, "r", encoding="utf-8") as handle:
        text = handle.read().strip()
    if not text:
        print("FATAL ERROR: Text file is empty.", file=sys.stderr)
        return 1

    chunks = split_text(text)
    print(f"Processing {len(chunks)} chunks in {args.mode} mode.")

    if args.mode == "turbo":
        model = ChatterboxTurboTTS.from_pretrained(device="cpu")
    elif args.mode == "multi":
        model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    else:
        model = ChatterboxTTS.from_pretrained(device="cpu")

    wavs = []
    for index, chunk in enumerate(chunks, start=1):
        print(f"Generating chunk {index}/{len(chunks)}: {chunk[:70]}...")
        if args.mode == "turbo":
            wav = model.generate(chunk, audio_prompt_path=PERSONA_PROMPT_PATH, temperature=args.temperature)
        else:
            wav = model.generate(
                chunk,
                audio_prompt_path=PERSONA_PROMPT_PATH,
                exaggeration=args.exaggeration,
                cfg_weight=args.pace,
                temperature=args.temperature,
            )
        wavs.append(wav)

    if not wavs:
        print("FATAL ERROR: No audio chunks were generated.", file=sys.stderr)
        return 1

    silence = torch.zeros((1, int(model.sr * 0.35)))
    padded = []
    for index, wav in enumerate(wavs):
        padded.append(wav)
        if index < len(wavs) - 1:
            padded.append(silence)

    final_wav = torch.cat(padded, dim=-1)
    final_wav = final_wav / (final_wav.abs().max() + 1e-8)
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    ta.save(args.output, final_wav, model.sr)
    print(f"SUCCESS: Saved to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
