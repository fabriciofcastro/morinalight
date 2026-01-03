# Gemini Model Integration

This document outlines the integration and usage of Gemini models within the project, including configuration for OpenRouter.

## Configuration for OpenRouter

The `setup_gemini_config` function demonstrates how to configure Gemini 2.0 Flash via OpenRouter:

```python
def setup_gemini_config(api_key):
    """
    Create a configuration for using Gemini via OpenRouter.

    Args:
        api_key: OpenRouter API key

    Returns:
        Dictionary with configuration settings
    """
    return {
        "model_name": "google/gemini-2.0-flash-001",
        "provider": "openai_endpoint",
        "openai_endpoint_url": "https://openrouter.ai/api/v1",
        "api_key": api_key,
    }
```

## Gemini Model Class

The `GeminiModel` class provides an interface for interacting with Gemini models, including parallel calling and caching capabilities.

## Gemini LLM Class

The `Gemini` class extends `BaseLlm` and provides integration for Gemini models, supporting various models and API backends (Vertex AI, Gemini API). It also handles streaming and live connections.
