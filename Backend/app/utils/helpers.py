import re
from slugify import slugify

def generate_slug(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def truncate(text: str, length: int = 200) -> str:
    return text[:length] + '...' if len(text) > length else text
