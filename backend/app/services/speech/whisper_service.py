import logging
from typing import Optional
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

_whisper_model: Optional[WhisperModel] = None
_whisper_available = True


def get_whisper_model() -> Optional[WhisperModel]:
    global _whisper_model, _whisper_available

    if not _whisper_available:
        return None

    if _whisper_model is None:
        try:
            _whisper_model = WhisperModel(
                "base",
                device="cpu",
                compute_type="int8"
            )
        except RuntimeError as e:
            logger.error(f"Failed to initialize Whisper model: {e}")
            _whisper_available = False
            _whisper_model = None
        except Exception as e:
            logger.exception("Unexpected failure initializing Whisper model")
            _whisper_available = False
            _whisper_model = None

    return _whisper_model


def transcribe_audio(audio_path: str):
    model = get_whisper_model()
    if model is None:
        return {
            "text": "",
            "language": "unknown",
            "success": False,
            "message": "Speech recognition model unavailable due to resource constraints."
        }

    segments, info = model.transcribe(audio_path)
    transcription = "".join(segment.text + " " for segment in segments)

    return {
        "text": transcription.strip(),
        "language": info.language,
        "success": True
    }