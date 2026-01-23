def truncate_text(text: str, max_length: int = 30) -> str:
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."
