import functools
import os
import re
import sys

import torch
import torchaudio as ta

SOURCE_PATH = "C:/Amazon/chatterbox/src"
VOICE_PATH = "C:/Amazon/videos/voice sample/Ryan.wav"

if SOURCE_PATH not in sys.path:
    sys.path.insert(0, SOURCE_PATH)

from chatterbox.tts_turbo import ChatterboxTurboTTS


def split_text(text: str, max_chars: int = 220) -> list[str]:
    sentences = re.split(r"(?<=[.!?]) +", text)
    chunks: list[str] = []
    current = ""
    for sentence in sentences:
        candidate = f"{current} {sentence}".strip()
        if current and len(candidate) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks


def main() -> None:
    text = sys.argv[1]
    output_path = sys.argv[2]
    model = ChatterboxTurboTTS.from_pretrained(device="cpu")

    original_inference = model.t3.inference_turbo
    model.t3.inference_turbo = functools.partial(original_inference, max_gen_len=420)

    clips = []
    chunks = split_text(text)
    print(f"Generating {len(chunks)} capped narration segments...")
    for index, chunk in enumerate(chunks, start=1):
        print(f"Segment {index}/{len(chunks)}")
        clips.append(model.generate(chunk, audio_prompt_path=VOICE_PATH, temperature=0.8))

    silence = torch.zeros((1, int(model.sr * 0.18)))
    combined = []
    for index, clip in enumerate(clips):
        combined.append(clip)
        if index < len(clips) - 1:
            combined.append(silence)
    final = torch.cat(combined, dim=-1)
    final = final / (final.abs().max() + 1e-8)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    ta.save(output_path, final, model.sr)
    print(f"Saved narration to {output_path}")


if __name__ == "__main__":
    main()
