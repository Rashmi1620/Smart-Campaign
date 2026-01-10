import os
import time
import json
import logging
import requests
import google.generativeai as genai
from firebase_admin import firestore
from google.api_core import exceptions

# --- CONFIGURATION ---
MOCK_MODE = False

# Load Environment Variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_SEARCH_CX = os.getenv("GOOGLE_SEARCH_CX")

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MarketMind")

# Initialize Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

    # USING PRO MODEL (High Intelligence, Low Speed Limit)
    # Free Tier Limit: 2 Requests Per Minute (RPM)
    model = genai.GenerativeModel('gemini-3-pro-preview')

# --- HELPER FUNCTIONS ---

def smart_throttle():
    """Forces a wait to respect the 2 RPM limit of Gemini Pro Free Tier."""
    logger.info("Throttling for 32 seconds to respect Gemini Pro limits...")
    time.sleep(32)

def retry_with_backoff(func, *args, retries=3, delay=5):
    """Retries with exponential backoff for Pro limits."""
    for i in range(retries):
        try:
            return func(*args)
        except Exception as e:
            if "429" in str(e) or "ResourceExhausted" in str(e):
                wait_time = delay * (2 ** i)  # 5s, 10s, 20s
                logger.warning(f"Quota Exceeded. Cooling down for {wait_time}s... (Attempt {i+1})")
                time.sleep(wait_time)
            else:
                logger.error(f"Unexpected Error: {e}")
                raise e
    return {"error": "Max retries exceeded. API is busy."}

def google_search(query):
    """Real Google Search."""
    if MOCK_MODE:
        return f"Mock results for {query}"

    url = "https://www.googleapis.com/customsearch/v1"
    params = { "q": query, "key": GOOGLE_API_KEY, "cx": GOOGLE_SEARCH_CX, "num": 3 }
    try:
        res = requests.get(url, params=params)
        data = res.json()
        if 'items' not in data:
            return "No specific search results found."
        snippets = [item['snippet'] for item in data.get('items', [])]
        return " | ".join(snippets)
    except Exception as e:
        logger.error(f"Search Failed: {e}")
        return "Search failed."

def llm_generate(prompt):
    response = model.generate_content(prompt)
    clean_text = response.text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_text)

def llm_invoke(prompt):
    try:
        result = retry_with_backoff(llm_generate, prompt)
        # CRITICAL: Wait AFTER every successful call to recharge the quota
        smart_throttle()
        return result
    except Exception as e:
        logger.error(f"Final LLM Failure: {e}")
        return {"error": "Failed to generate response", "details": str(e)}

# --- THE AGENTS ---

def run_campaign_pipeline(campaign_id, user_id, inputs):
    db = firestore.client()
    doc_ref = db.collection("users").document(user_id).collection("campaigns").document(campaign_id)

    try:
        product = inputs.get('productName', 'Product')
        competitor = inputs['competitorName']
        region = inputs.get('region', 'India')

        # ==========================================
        # STEP 1: AUDIENCE
        # ==========================================
        update_status(doc_ref, "processing_audience")
        logger.info(f"Starting Audience Analysis (Pro Model)...")

        audience_prompt = f"""
ROLE: Senior Strategist.
PRODUCT: {product} ({inputs['description']})
TARGET: {inputs['targetAudience']}

TASK: Validate audience and create 3 distinct micro-personas.
OUTPUT JSON: {{ "validation": "Valid", "critique": "...", "personas": [{{ "name": "...", "pain_point": "..." }}] }}
"""
        audience_data = llm_invoke(audience_prompt)
        doc_ref.update({"audience_result": audience_data})

        # ==========================================
        # STEP 2: RESEARCH
        # ==========================================
        update_status(doc_ref, "processing_research")
        logger.info(f"Starting Research...")

        # Search doesn't cost LLM quota, so we do it fast
        search_query = f"{competitor} complaints reviews {region}"
        raw_search_data = google_search(search_query)

        research_prompt = f"""
ROLE: Market Intelligence Lead.
COMPETITOR: {competitor}
DATA: {raw_search_data}

TASK: Identify the Competitor's specific weakness and our gap.
OUTPUT JSON: {{ "competitor_weakness": "...", "market_gap": "...", "pricing_model": "..." }}
"""
        research_data = llm_invoke(research_prompt)
        doc_ref.update({"research_result": research_data})

        # ==========================================
        # STEP 3: STRATEGY
        # ==========================================
        update_status(doc_ref, "processing_strategy")
        logger.info(f"Starting Strategy...")

        strategy_prompt = f"""
ROLE: Chief Marketing Officer.
PERSONAS: {json.dumps(audience_data.get('personas', []))}
WEAKNESS: {research_data.get('competitor_weakness', 'Generic')}

TASK: Define a killer Attack Angle.
OUTPUT JSON: {{ "core_message": "...", "attack_angle": "...", "channels": [{{ "name": "...", "budget_split": "..." }}] }}
"""
        strategy_data = llm_invoke(strategy_prompt)
        doc_ref.update({"strategy_result": strategy_data})

        # ==========================================
        # STEP 4: CONTENT
        # ==========================================
        update_status(doc_ref, "processing_content")
        logger.info(f"Starting Content...")

        content_prompt = f"""
ROLE: Creative Director.
STRATEGY: {strategy_data.get('core_message')}
REGION: {region}
SAFETY: No trademarks attacks, no religious insults.

TASK: Write High-Converting Copy.
OUTPUT JSON: {{ "ad_copy_main": "...", "ad_hook": "...", "visual_prompt": "...", "safety_audit": "Passed" }}
"""
        content_data = llm_invoke(content_prompt)

        doc_ref.update({
            "content_result": content_data,
            "status": "completed"
        })
        logger.info(f"Campaign Finished Successfully.")

    except Exception as e:
        logger.error(f"Pipeline Failed: {e}")
        doc_ref.update({"status": "failed", "error": str(e)})

def update_status(ref, status):
    ref.update({"status": status})