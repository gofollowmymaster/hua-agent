from langchain_openai import OpenAIEmbeddings

from python_api.core.config import Settings


def create_embeddings(settings: Settings) -> OpenAIEmbeddings:
    """Creates the shared OpenAI-compatible embeddings client."""
    return OpenAIEmbeddings(
        openai_api_key=settings.require_embeddings_key(),
        openai_api_base=settings.embeddings_base_url or settings.openai_base_url,
        model=settings.embeddings_model_name,
        dimensions=settings.embeddings_dimensions,
        check_embedding_ctx_length=False,
    )
