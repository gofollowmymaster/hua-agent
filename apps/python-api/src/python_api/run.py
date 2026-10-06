import uvicorn

from python_api.core.config import get_settings


def main() -> None:
    """Starts the production server from centralized Python settings."""
    settings = get_settings()
    uvicorn.run(
        "python_api.main:app",
        host=settings.python_api_host,
        port=settings.python_api_port,
        workers=settings.python_api_workers,
        reload=settings.python_api_reload,
        proxy_headers=True,
    )


if __name__ == "__main__":
    main()
