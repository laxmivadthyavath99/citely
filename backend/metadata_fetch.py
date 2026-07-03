"""
Fetches paper metadata from Semantic Scholar's free Graph API
(no API key required for light use: https://api.semanticscholar.org/graph/v1).

Supports:
  - arXiv IDs / URLs        e.g. "2101.12345" or "https://arxiv.org/abs/2101.12345"
  - DOIs / DOI URLs         e.g. "10.1145/3442188.3445922" or "https://doi.org/10.1145/..."
  - Semantic Scholar IDs    e.g. raw 40-char hex ID (fallback case)

If none of the patterns match, treats the input as a free-text title search
and returns the top match.
"""
import re
import httpx

S2_BASE = "https://api.semanticscholar.org/graph/v1"
FIELDS = "title,authors,abstract,year,externalIds,url"

ARXIV_PATTERN = re.compile(r"(\d{4}\.\d{4,5})(v\d+)?")
DOI_PATTERN = re.compile(r"10\.\d{4,9}/[^\s/]+")


def _detect_identifier(raw: str) -> tuple[str, str]:
    """Returns (lookup_path, kind) for the Semantic Scholar paper-lookup endpoint."""
    raw = raw.strip()

    doi_match = DOI_PATTERN.search(raw)
    if doi_match:
        return f"DOI:{doi_match.group(0)}", "doi"

    arxiv_match = ARXIV_PATTERN.search(raw)
    if arxiv_match:
        return f"arXiv:{arxiv_match.group(1)}", "arxiv"

    # Looks like a raw Semantic Scholar paper ID (40-char hex)
    if re.fullmatch(r"[0-9a-f]{40}", raw):
        return raw, "s2_id"

    return raw, "search"  # fall back to free-text search


async def fetch_metadata(identifier: str) -> dict | None:
    """
    Returns a dict shaped like schemas.PaperCreate, or None if nothing was found.
    Raises httpx.HTTPError on network/API failure (caller should handle it).
    """
    lookup, kind = _detect_identifier(identifier)

    async with httpx.AsyncClient(timeout=10) as client:
        if kind == "search":
            resp = await client.get(
                f"{S2_BASE}/paper/search",
                params={"query": lookup, "limit": 1, "fields": FIELDS},
            )
            resp.raise_for_status()
            data = resp.json()
            results = data.get("data", [])
            if not results:
                return None
            paper = results[0]
        else:
            resp = await client.get(f"{S2_BASE}/paper/{lookup}", params={"fields": FIELDS})
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            paper = resp.json()

    authors = ", ".join(a.get("name", "") for a in paper.get("authors", []) if a.get("name"))
    external_ids = paper.get("externalIds") or {}

    return {
        "title": paper.get("title") or "Untitled",
        "authors": authors,
        "abstract": paper.get("abstract") or "",
        "source": "semantic_scholar",
        "external_id": external_ids.get("DOI") or external_ids.get("ArXiv"),
        "url": paper.get("url"),
        "year": paper.get("year"),
    }
