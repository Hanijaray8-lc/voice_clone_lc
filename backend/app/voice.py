# backend/app/voice.py
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
from TTS.api import TTS
import noisereduce as nr
from faster_whisper import WhisperModel
import tempfile
import os
import soundfile as sf
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig
from TTS.config.shared_configs import BaseDatasetConfig
import torch
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
import openai
from pydub import AudioSegment

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Temp storage directory
TMP_DIR = Path("tmp/voice_clone")
TMP_DIR.mkdir(parents=True, exist_ok=True)

torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig, BaseDatasetConfig])

# Load model once at startup
print("Loading voice cloning model...")
tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False, gpu=False)

SUPPORTED_XTTS_LANGUAGES = [
    "en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "hu", "ko", "ja", "hi"
]

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key")

def reduce_noise(audio_bytes):
    # Load audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
        temp.write(audio_bytes)
        temp.flush()
        # You can use soundfile or another library here if needed
        # Remove librosa usage for sample rate extraction
        import soundfile as sf
        y, sr = sf.read(temp.name)
    # Reduce noise
    reduced = nr.reduce_noise(y=y, sr=sr)
    # Save back to bytes using soundfile
    out_path = temp.name + "_clean.wav"
    sf.write(out_path, reduced, sr)
    with open(out_path, "rb") as f:
        clean_bytes = f.read()
    os.remove(temp.name)
    os.remove(out_path)
    return clean_bytes, sr

def openai_tts(text, language):
    openai.api_key = OPENAI_API_KEY  # Set the API key globally
    response = openai.audio.speech.create(
        model="tts-1",
        voice="onyx",  # or "nova", "echo", etc.
        input=text,
        response_format="wav"
    )
    return response.content  # This is bytes

def preprocess_sample(sample_path):
    # Noise reduction (already in your code)
    # Normalization
    audio = AudioSegment.from_file(sample_path)
    normalized = audio.apply_gain(-audio.max_dBFS)
    norm_path = sample_path.replace(".wav", "_norm.wav")
    normalized.export(norm_path, format="wav")
    return norm_path

@router.post("/clone")
async def clone_voice(
    text: str = Form(...),
    sample_voice: UploadFile = File(...),
    language: str = Form("en"),
    person_image: UploadFile = File(None)
):
    sample_voice_bytes = await sample_voice.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as sample_temp:
        sample_temp.write(sample_voice_bytes)
        sample_temp.flush()
        sample_path = sample_temp.name

    # Preprocess sample
    sample_path = preprocess_sample(sample_path)

    output_path = TMP_DIR / f"out_{uuid.uuid4().hex}.wav"
    audio = tts_model.tts(
        text,
        speaker_wav=sample_path,
        language=language,
        temperature=0.3
    )
    sf.write(str(output_path), audio, 24000)

    if person_image:
        # Save image
        image_bytes = await person_image.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as img_temp:
            img_temp.write(image_bytes)
            img_temp.flush()
            img_path = img_temp.name

        # Generate video using SadTalker CLI (make sure SadTalker is installed)
        video_path = TMP_DIR / f"video_{uuid.uuid4().hex}.mp4"
        os.system(
            f'python /path/to/SadTalker/inference.py --driven_audio "{output_path}" --source_image "{img_path}" --result_dir "{TMP_DIR}" --output_name "{video_path.name}"'
        )
        if not video_path.exists():
            raise HTTPException(status_code=500, detail="Video generation failed")
        return FileResponse(str(video_path), media_type="video/mp4")
    else:
        return FileResponse(str(output_path), media_type="audio/wav")