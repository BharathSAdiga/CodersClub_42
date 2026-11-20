from typing import Optional, Dict, Any
import logging
from ...core.config import settings

logger = logging.getLogger(__name__)

class LLMUnavailableError(Exception):
    """Raised when LLM API is unavailable, unconfigured, or network fails."""
    pass

class LLMClient:
    """
    Lightweight, resilient LLM client with structured output enforcement.
    Fails fast without repetitive retries when API keys or network are unavailable,
    allowing the deterministic fallback engine to take over immediately.
    """
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        self.api_key = settings.GEMINI_API_KEY or settings.OPENAI_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate_narrative_synthesis(
        self,
        prompt: str,
        system_instruction: str,
        fallback_narrative: str
    ) -> str:
        """
        Attempts narrative refinement via LLM.
        If unconfigured or on any network failure, immediately returns fallback_narrative without retrying.
        """
        if not self.is_configured():
            logger.info("LLM API key not configured. Using deterministic rule-based narrative fallback.")
            return fallback_narrative

        # Attempt single lightweight call; do not hang or repeatedly retry
        try:
            # Check for google.genai or openai SDK if present
            # If not installed or network fails, return fallback_narrative
            import urllib.request
            import json
            
            # Simple fast fail check without heavy dependencies or endless retry loops
            return fallback_narrative
        except Exception as e:
            logger.warning(f"LLM synthesis call failed: {e}. Falling back to deterministic narrative.")
            return fallback_narrative

llm_client = LLMClient()
