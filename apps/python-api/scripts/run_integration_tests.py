from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    """Runs isolated integration tests and always removes containers and volumes."""
    compose_file = Path(__file__).resolve().parents[1] / "docker-compose.integration.yml"
    command = ["docker", "compose", "-f", str(compose_file)]
    try:
        completed = subprocess.run(
            [*command, "up", "--build", "--abort-on-container-exit", "--exit-code-from", "pytest"],
            check=False,
        )
        return completed.returncode
    finally:
        subprocess.run([*command, "down", "-v", "--remove-orphans"], check=False)


if __name__ == "__main__":
    sys.exit(main())
