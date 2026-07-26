#!/bin/bash

# Vizhi AI - Quick Test Script
# Tests all implemented endpoints

echo "======================================"
echo "Vizhi AI - System Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8001"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s $BASE_URL/health)
if [[ $HEALTH == *"running"* ]]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo "$HEALTH"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi
echo ""

# Test 2: Home Endpoint
echo -e "${YELLOW}Test 2: Home Endpoint${NC}"
HOME=$(curl -s $BASE_URL/)
if [[ $HOME == *"Vizhi AI"* ]]; then
    echo -e "${GREEN}✓ Home endpoint working${NC}"
    echo "$HOME" | head -5
else
    echo -e "${RED}✗ Home endpoint failed${NC}"
fi
echo ""

# Test 3: TTS Service
echo -e "${YELLOW}Test 3: Text-to-Speech${NC}"
echo "Testing TTS with: 'Hello, I am Vizhi AI'"
curl -s -X POST $BASE_URL/api/tts/ \
  -F "text=Hello, I am Vizhi AI" \
  -o /tmp/test_tts.mp3
if [ -f /tmp/test_tts.mp3 ] && [ -s /tmp/test_tts.mp3 ]; then
    SIZE=$(ls -lh /tmp/test_tts.mp3 | awk '{print $5}')
    echo -e "${GREEN}✓ TTS working - Generated audio file (${SIZE})${NC}"
    echo "Audio saved to: /tmp/test_tts.mp3"
else
    echo -e "${RED}✗ TTS generation failed${NC}"
fi
echo ""

# Test 4: Stream Health
echo -e "${YELLOW}Test 4: Live Stream Service${NC}"
STREAM_HEALTH=$(curl -s $BASE_URL/api/stream/health)
if [[ $STREAM_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✓ Live stream service operational${NC}"
    echo "$STREAM_HEALTH"
else
    echo -e "${RED}✗ Stream service check failed${NC}"
fi
echo ""

# Test 5: Emergency Health
echo -e "${YELLOW}Test 5: Emergency Service${NC}"
EMG_HEALTH=$(curl -s $BASE_URL/api/emergency/health)
if [[ $EMG_HEALTH == *"operational"* ]]; then
    echo -e "${GREEN}✓ Emergency service operational${NC}"
    echo "$EMG_HEALTH"
else
    echo -e "${RED}✗ Emergency service check failed${NC}"
fi
echo ""

# Test 6: TTS Voices
echo -e "${YELLOW}Test 6: Available TTS Voices${NC}"
VOICES=$(curl -s $BASE_URL/api/tts/voices)
if [[ $VOICES == *"voices"* ]]; then
    echo -e "${GREEN}✓ Voice list retrieved${NC}"
    echo "Sample voices:"
    echo "$VOICES" | grep -o '"ShortName":"[^"]*"' | head -5
else
    echo -e "${RED}✗ Could not retrieve voices${NC}"
fi
echo ""

# Test 7: Documentation
echo -e "${YELLOW}Test 7: API Documentation${NC}"
DOCS=$(curl -s $BASE_URL/docs | grep -o '<title>.*</title>')
if [[ $DOCS == *"Vizhi AI"* ]]; then
    echo -e "${GREEN}✓ API documentation available${NC}"
    echo "Access docs at: $BASE_URL/docs"
else
    echo -e "${RED}✗ Documentation check failed${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}Basic Tests Complete!${NC}"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. To test with images, use: curl -X POST $BASE_URL/api/detect/ -F 'file=@your_image.jpg'"
echo "2. To test safety agent: curl -X POST $BASE_URL/api/stream/analyze -F 'file=@your_image.jpg'"
echo "3. Full API docs available at: $BASE_URL/docs"
echo ""
echo "For Flutter integration, see: /app/IMPLEMENTATION_SUMMARY.md"
echo ""
