from pydantic import SecretStr

from python_api.core.config import Settings
from python_api.core.embeddings import create_embeddings


def test_compatible_embeddings_send_raw_text() -> None:
    settings = Settings.model_construct(
        embeddings_api_key=SecretStr("test-key"),
        embeddings_base_url="https://embedding.test/v1",
        embeddings_model_name="text-embedding-v3",
        embeddings_dimensions=1024,
    )

    embeddings = create_embeddings(settings)

    assert embeddings.check_embedding_ctx_length is False
