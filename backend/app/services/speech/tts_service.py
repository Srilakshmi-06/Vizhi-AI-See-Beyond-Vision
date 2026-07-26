import os
import asyncio
import edge_tts
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Default voice for Edge TTS
DEFAULT_VOICE = "en-US-AriaNeural"
OUTPUT_DIR = "audio_outputs"

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)


async def text_to_speech_async(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Convert text to speech using Edge TTS.
    
    Args:
        text: The text to convert to speech
        voice: Voice to use (default: en-US-AriaNeural)
    
    Returns:
        Path to the generated audio file
    """
    try:
        # Generate unique filename
        import uuid
        filename = f"{uuid.uuid4().hex}.mp3"
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        # Create TTS instance
        communicate = edge_tts.Communicate(text, voice)
        
        # Save audio file
        await communicate.save(output_path)
        
        logger.info(f"Generated audio file: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Error in text_to_speech: {e}")
        raise


def text_to_speech(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Synchronous wrapper for text_to_speech_async.
    
    Args:
        text: The text to convert to speech
        voice: Voice to use (default: en-US-AriaNeural)
    
    Returns:
        Path to the generated audio file
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(text_to_speech_async(text, voice))
        loop.close()
        return result
    except Exception as e:
        logger.error(f"Error in synchronous text_to_speech: {e}")
        raise


async def get_available_voices():
    """
    Get list of available Edge TTS voices.
    
    Returns:
        List of available voices
    """
    voices = await edge_tts.list_voices()
    return voices
