"""LLM provider abstraction layer."""
from typing import Optional, Dict, Any, AsyncIterator
import httpx
import json
from app.config import settings


class LLMProvider:
    """Abstract LLM provider interface."""
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate text from prompt."""
        raise NotImplementedError
    
    async def generate_stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Generate text stream from prompt."""
        # Default: collect stream and return as string
        full_text = ""
        async for chunk in self._generate_stream_impl(prompt, model, temperature, max_tokens):
            full_text += chunk
            yield chunk
    
    async def _generate_stream_impl(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Internal streaming implementation."""
        raise NotImplementedError


class OpenAIProvider(LLMProvider):
    """OpenAI-compatible provider implementation (supports OpenAI, SberCloud, etc.)."""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url or settings.llm_base_url or "https://api.openai.com/v1"
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate using OpenAI-compatible API."""
        model = model or settings.llm_model
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful fitness and nutrition AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _generate_stream_impl(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """Generate stream using OpenAI-compatible API."""
        model = model or settings.llm_model
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a helpful fitness and nutrition AI assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    if line.startswith("data: "):
                        line = line[6:]
                    if line == "[DONE]":
                        break
                    try:
                        data = json.loads(line)
                        if "choices" in data and len(data["choices"]) > 0:
                            delta = data["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                    except json.JSONDecodeError:
                        continue


class AnthropicProvider(LLMProvider):
    """Anthropic (Claude) provider implementation."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.anthropic.com/v1"
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate using Anthropic API."""
        model = model or "claude-3-haiku-20240307"
        max_tokens = max_tokens or 4096
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]


def get_llm_provider() -> LLMProvider:
    """Factory function to get LLM provider based on config."""
    provider_name = settings.llm_provider.lower()
    
    # If base_url is provided, always use OpenAI-compatible provider
    # (works with any OpenAI-compatible API regardless of provider name)
    if settings.llm_base_url:
        return OpenAIProvider(settings.llm_api_key, base_url=settings.llm_base_url)
    
    # Otherwise, use provider name to determine
    if provider_name in ("openai", "custom", "openai-compatible"):
        base_url = "https://api.openai.com/v1"
        return OpenAIProvider(settings.llm_api_key, base_url=base_url)
    elif provider_name == "anthropic":
        return AnthropicProvider(settings.llm_api_key)
    else:
        # Default to OpenAI if provider name is unknown
        base_url = "https://api.openai.com/v1"
        return OpenAIProvider(settings.llm_api_key, base_url=base_url)
