import os

# Unit and contract tests must never bootstrap users into a developer database.
os.environ["PYTHON_API_ENV"] = "test"
os.environ["RAG_ADMIN_BOOTSTRAP_USERNAME"] = ""
os.environ["RAG_ADMIN_BOOTSTRAP_PASSWORD"] = ""
