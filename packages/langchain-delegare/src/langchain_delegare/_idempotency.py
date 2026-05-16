import uuid


def get_idempotency_key(
    thread_id: str | None = None,
    run_id: str | None = None,
    tool_call_id: str | None = None,
) -> str:
    """Generate a deterministic UUID v5 from LangGraph context, or a random UUID v4 if no context."""
    if thread_id and run_id:
        namespace = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
        name = f"{thread_id}:{run_id}"
        if tool_call_id:
            name += f":{tool_call_id}"
        return str(uuid.uuid5(namespace, name))
    return str(uuid.uuid4())
