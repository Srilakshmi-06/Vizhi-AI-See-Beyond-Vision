import os
import asyncio
import uuid
import edge_tts
import logging

logger = logging.getLogger(__name__)

# Default voice for Edge TTS
DEFAULT_VOICE = "en-US-AriaNeural"
OUTPUT_DIR = "audio_outputs"

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)


async def text_to_speech_async(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Convert text to speech using Edge TTS (async version).

    Args:
        text: The text to convert to speech
        voice: Voice to use (default: en-US-AriaNeural)

    Returns:
        Path to the generated audio file
    """
    try:
        filename = f"{uuid.uuid4().hex}.mp3"
        output_path = os.path.join(OUTPUT_DIR, filename)

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)

        logger.info(f"Generated audio file: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Error in text_to_speech_async: {e}")
        raise


def text_to_speech(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Synchronous wrapper for text_to_speech_async.
    Safely handles both sync and running-event-loop contexts.

    Args:
        text: The text to convert to speech
        voice: Voice to use (default: en-US-AriaNeural)

    Returns:
        Path to the generated audio file
    """
    try:
        # Check if there's a running event loop
        try:
            asyncio.get_running_loop()
            in_loop = True
        except RuntimeError:
            in_loop = False

        if in_loop:
            # We're inside a running event loop - use nest_asyncio approach
            # or run in a new thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    lambda: asyncio.run(text_to_speech_async(text, voice))
                )
                return future.result(timeout=30)
        else:
            return asyncio.run(text_to_speech_async(text, voice))

    except Exception as e:
        logger.error(f"Error in text_to_speech: {e}")
        raise


async def get_available_voices():
    """
    Get list of available Edge TTS voices.

    Returns:
        List of available voices
    """
    voices = await edge_tts.list_voices()
    return voices
