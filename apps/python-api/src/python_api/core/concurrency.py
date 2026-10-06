from __future__ import annotations

from collections.abc import Callable
from functools import partial

from anyio import CapacityLimiter, to_thread

FILE_WORK_LIMITER = CapacityLimiter(4)


async def run_file_work[T](
    function: Callable[..., T], *args: object, **kwargs: object
) -> T:
    """Runs blocking file or parser work with bounded worker-thread concurrency."""
    return await to_thread.run_sync(
        partial(function, *args, **kwargs), limiter=FILE_WORK_LIMITER, abandon_on_cancel=True
    )
