from urllib.parse import urlparse, urljoin


def normalize_url(base_url: str, link: str):
    """Convert relative link to absolute, filter out non-http(s) links."""
    if not link:
        return None

    # ignore anchors, mailto, javascript, etc.
    if link.startswith(('#', 'mailto:', 'javascript:')):
        return None

    abs_url = urljoin(base_url, link)
    parsed = urlparse(abs_url)
    if parsed.scheme not in ('http', 'https'):
        return None

    # strip fragments
    cleaned = parsed._replace(fragment='').geturl()
    return cleaned


def same_domain(url: str, root_url: str) -> bool:
    """Return True if url belongs to the same domain as root_url."""
    p1 = urlparse(url)
    p2 = urlparse(root_url)
    return p1.netloc == p2.netloc
