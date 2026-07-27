"""
Vizhi AI backend regression tests.
Covers: Ollama connectivity, Planner Agent routing, Scene Description, Object Detection
(with bbox/distance fields), Live Stream, Emergency, Navigation, OCR, TTS, Speech, Assistant.
"""
import os
import time
import pytest
import requests

BASE_URL = "http://localhost:8001"
OLLAMA_URL = "http://localhost:11434"
TEST_IMAGE = "/tmp/test_scene.jpg"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def image_bytes():
    if not os.path.exists(TEST_IMAGE):
        r = requests.get("https://ultralytics.com/images/bus.jpg", timeout=30)
        with open(TEST_IMAGE, "wb") as f:
            f.write(r.content)
    with open(TEST_IMAGE, "rb") as f:
        return f.read()


# ---------- Ollama connectivity ----------
class TestOllama:
    def test_ollama_version(self):
        r = requests.get(f"{OLLAMA_URL}/api/version", timeout=10)
        assert r.status_code == 200
        assert "version" in r.json()

    def test_ollama_model_loaded(self):
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=10)
        assert r.status_code == 200
        names = [m["name"] for m in r.json().get("models", [])]
        assert any("llama3.2:1b" in n for n in names), f"llama3.2:1b not found: {names}"


# ---------- Health ----------
class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/health", timeout=10)
        assert r.status_code == 200
        assert r.json().get("status") == "running"


# ---------- Planner routing ----------
PLANNER_CASES = [
    ("Read the sign", "OCR"),
    ("Read the menu", "OCR"),
    ("take me to the kitchen", "Navigation"),
    ("help me", "Emergency"),
    ("describe my surroundings", "Scene Description"),
    ("what is in front of me", "Object Detection"),
    ("hello how are you", "Conversation"),
]

CRITICAL_CATEGORIES = {"OCR", "Navigation", "Emergency"}


@pytest.fixture(scope="module")
def planner_results():
    """Run all planner queries once; first request may take ~30s (model load)."""
    results = {}
    for i, (query, expected) in enumerate(PLANNER_CASES):
        # Longer timeout for the first call
        timeout = 90 if i == 0 else 60
        try:
            r = requests.post(
                f"{BASE_URL}/api/planner/",
                json={"query": query},
                timeout=timeout,
            )
            results[query] = {
                "status": r.status_code,
                "body": r.json() if r.headers.get("content-type", "").startswith("application/json") else r.text,
                "expected": expected,
            }
        except Exception as e:
            results[query] = {"status": 0, "body": str(e), "expected": expected}
    return results


class TestPlanner:
    def test_planner_status_codes(self, planner_results):
        for q, res in planner_results.items():
            assert res["status"] == 200, f"Query {q!r} failed: {res}"

    def test_planner_first_call_time(self):
        """Sanity check: subsequent call should return within 30s."""
        start = time.time()
        r = requests.post(f"{BASE_URL}/api/planner/", json={"query": "hello"}, timeout=60)
        elapsed = time.time() - start
        assert r.status_code == 200
        # Note: This test runs after planner_results fixture warmed the model
        assert elapsed < 30, f"Planner took {elapsed:.1f}s (should be <30s after warmup)"

    def test_planner_critical_routing(self, planner_results):
        """OCR, Navigation, Emergency MUST classify correctly."""
        failures = []
        for query, expected in PLANNER_CASES:
            if expected not in CRITICAL_CATEGORIES:
                continue
            res = planner_results[query]
            body = res["body"]
            agent = ""
            if isinstance(body, dict):
                agent = str(body.get("agent") or body.get("selected_agent") or body.get("category") or body)
            if expected.lower() not in agent.lower():
                failures.append(f"{query!r} -> expected {expected}, got {body}")
        assert not failures, "Critical routing failures:\n" + "\n".join(failures)

    def test_planner_overall_accuracy(self, planner_results):
        """At least 5/7 exact matches."""
        matches = 0
        detail = []
        for query, expected in PLANNER_CASES:
            body = planner_results[query]["body"]
            agent = ""
            if isinstance(body, dict):
                agent = str(body.get("agent") or body.get("selected_agent") or body.get("category") or body)
            ok = expected.lower() in agent.lower()
            if ok:
                matches += 1
            detail.append(f"  {query!r} expected={expected} got={agent!r} {'OK' if ok else 'MISS'}")
        print("\nPlanner routing detail:\n" + "\n".join(detail))
        assert matches >= 5, f"Only {matches}/7 correct:\n" + "\n".join(detail)


# ---------- Object Detection ----------
class TestDetection:
    def test_detect_returns_bbox_and_distance(self, image_bytes):
        r = requests.post(
            f"{BASE_URL}/api/detect/",
            files={"file": ("bus.jpg", image_bytes, "image/jpeg")},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "objects" in data
        assert len(data["objects"]) > 0, "No objects detected in bus image"
        obj = data["objects"][0]
        # Required fields
        for f in ["name", "confidence", "position", "bbox", "distance", "distance_label", "area_ratio"]:
            assert f in obj, f"Missing field {f!r} in object: {obj}"
        # bbox structure
        bbox = obj["bbox"]
        for f in ["x1", "y1", "x2", "y2", "image_width", "image_height"]:
            assert f in bbox, f"bbox missing field {f!r}: {bbox}"
        # distance value
        assert obj["distance"] in ["very_close", "close", "medium", "far"], f"invalid distance: {obj['distance']}"


# ---------- Scene Description ----------
class TestScene:
    def test_scene_description(self, image_bytes):
        r = requests.post(
            f"{BASE_URL}/api/scene/",
            files={"file": ("bus.jpg", image_bytes, "image/jpeg")},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "objects" in data and isinstance(data["objects"], list)
        assert len(data["objects"]) > 0
        # Each object should have new fields
        obj = data["objects"][0]
        for f in ["name", "confidence", "position", "bbox", "distance_label"]:
            assert f in obj, f"scene object missing {f!r}: {obj}"
        assert "description" in data
        assert isinstance(data["description"], str) and len(data["description"].strip()) > 0
        desc_lower = data["description"].lower()
        obj_names = [o["name"].lower() for o in data["objects"]]
        # Description should mention at least one detected object
        assert any(n in desc_lower for n in obj_names), (
            f"Description doesn't mention detected objects. desc={data['description']!r} objects={obj_names}"
        )


# ---------- Stream ----------
class TestStream:
    def test_stream_analyze(self, image_bytes):
        r = requests.post(
            f"{BASE_URL}/api/stream/analyze",
            files={"file": ("bus.jpg", image_bytes, "image/jpeg")},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "objects" in data
        assert "safe" in data
        assert "warnings" in data
        if data["objects"]:
            obj = data["objects"][0]
            assert "bbox" in obj
            assert "distance" in obj


# ---------- Regression: other endpoints ----------
class TestRegression:
    def test_ocr(self, image_bytes):
        r = requests.post(
            f"{BASE_URL}/api/ocr/",
            files={"file": ("bus.jpg", image_bytes, "image/jpeg")},
            timeout=60,
        )
        assert r.status_code == 200
        assert "text" in r.json()

    def test_tts_voices(self):
        r = requests.get(f"{BASE_URL}/api/tts/voices", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "voices" in data
        assert isinstance(data["voices"], list)
        assert len(data["voices"]) > 0

    def test_tts_generate(self):
        r = requests.post(
            f"{BASE_URL}/api/tts/",
            data={"text": "Hello world"},
            timeout=30,
        )
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("audio/")
        assert len(r.content) > 0

    def test_emergency_trigger_and_cancel(self):
        r = requests.post(
            f"{BASE_URL}/api/emergency/trigger",
            data={"emergency_type": "general", "include_audio": "false"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        emergency_id = data.get("emergency_id") or data.get("id")
        assert emergency_id, f"No emergency_id in response: {data}"

        r2 = requests.post(
            f"{BASE_URL}/api/emergency/cancel",
            data={"emergency_id": emergency_id, "include_audio": "false"},
            timeout=30,
        )
        assert r2.status_code == 200, r2.text

    def test_navigation(self):
        r = requests.post(
            f"{BASE_URL}/api/navigation/navigate",
            data={"destination": "kitchen", "include_audio": "false"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "instruction" in data or "instructions" in data or "message" in data

    def test_assistant(self, image_bytes):
        r = requests.post(
            f"{BASE_URL}/api/assistant/",
            data={"user_input": "what is in front of me", "include_audio": "false"},
            files={"image": ("bus.jpg", image_bytes, "image/jpeg")},
            timeout=120,
        )
        assert r.status_code == 200, r.text
