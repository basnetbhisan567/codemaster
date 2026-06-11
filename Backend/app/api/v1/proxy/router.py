from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
import httpx

router = APIRouter(prefix="/proxy", tags=["Proxy"])

@router.get("/audio")
async def proxy_audio(url: str = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            response = await client.get(url)
            return StreamingResponse(
                response.iter_bytes(),
                media_type="audio/mpeg",
                headers={"Accept-Ranges": "bytes"}
            )
    except Exception as e:
        return {"error": str(e)}
