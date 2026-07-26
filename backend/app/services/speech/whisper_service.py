from faster_whisper import WhisperModel

# Load the model once when the application starts
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

def transcribe_audio(audio_path: str):

    segments, info = model.transcribe(audio_path)

    transcription = ""

    for segment in segments:
        transcription += segment.text + " "

    return {
        "text": transcription.strip(),
        "language": info.language
    }