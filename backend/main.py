"""Optional standalone mock API; Next.js replay does not call this service."""
import asyncio
from datetime import date, timedelta
from random import Random
from typing import Literal

from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from .connectors import telegram, x
from .emotion_model import LABELS, score
from .network_analyzer import analyze, simulate
from .trend_detector import trends

app = FastAPI(title="PulseGraph reference API", version="1.0.0")


@app.get("/trends")
def trends_endpoint(day: int = Query(12, ge=1, le=30)):
    return trends(day)


@app.get("/emotions")
def emotions_endpoint():
    return [{"date": (date(2026, 4, 1) + timedelta(days=day-1)).isoformat(),
             **{label: round(30 + (120 if label in ("anger", "anxiety", "sarcasm") else 20) / (1 + (day - 12) ** 2) + Random(day * 12 + i).random() * 14)
                for i, label in enumerate(LABELS)}} for day in range(1, 31)]


@app.get("/demographics")
def demographics_endpoint(day: int = Query(12, ge=1, le=30)):
    rng = Random(day)

    def percentages(labels, base):
        raw = [n * (.85 + rng.random() * .3) for n in base]
        return {label: round(n / sum(raw) * 100, 1) for n, label in zip(raw, labels)}

    return {"day": day, "synthetic": True,
            "age": percentages(["13–17", "18–24", "25–34", "35–44", "45–54", "55+"], [6, 34, 34, 17, 6, 3]),
            "region": percentages(["Maharashtra", "Karnataka", "Delhi", "Other"], [24, 20, 16, 40]),
            "language": percentages(["English", "Hindi", "Hinglish", "Other"], [43, 17, 26, 14]),
            "interests": percentages(["Tech", "Gaming", "Creators", "Finance", "Other"], [31, 19, 17, 10, 23])}


@app.get("/graph")
def graph_endpoint(day: int = Query(30, ge=1, le=30)):
    return analyze(day)


class Simulation(BaseModel):
    seedId: int = Field(ge=0, lt=150)
    day: int = Field(default=30, ge=1, le=30)
    tone: Literal["Neutral", "Urgent", "Empathetic"] = "Neutral"


@app.post("/simulate")
def simulation_endpoint(payload: Simulation):
    return simulate(payload.day, payload.seedId, payload.tone)


@app.websocket("/stream")
async def stream(socket: WebSocket):
    await socket.accept()
    sources = (x.events(), telegram.events())
    index = 0
    try:
        while True:
            post = next(sources[index % len(sources)])
            await socket.send_json({**post, "emotions": score(post["text"])})
            index += 1
            await asyncio.sleep(1)
    except (WebSocketDisconnect, RuntimeError):
        return
