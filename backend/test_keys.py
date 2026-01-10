import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests

# 1. Force load the .env file
load_dotenv()

# 2. Read Keys
API_KEY = os.getenv("GOOGLE_API_KEY")
CX = os.getenv("GOOGLE_SEARCH_CX")

print(f"--- DIAGNOSTIC REPORT ---")
print(f"1. API Key Loaded: {'YES' if API_KEY else 'NO (Check .env file name/path)'}")
print(f"2. Search CX Loaded: {'YES' if CX else 'NO'}")

if not API_KEY:
    print("CRITICAL: App cannot see API Keys. It will default to Garbage Output.")
    exit()

# 3. Test Gemini Connectivity
print("\n--- TESTING GEMINI BRAIN ---")
try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-3-pro-preview')
    response = model.generate_content("Say 'System Operational' if you can hear me.")
    print(f"Gemini Response: {response.text}")
except Exception as e:
    print(f"Gemini Error: {e}")

# 4. Test Google Search Connectivity
print("\n--- TESTING SEARCH EYES ---")
try:
    url = "https://www.googleapis.com/customsearch/v1"
    params = {"q": "Cadbury competitors", "key": API_KEY, "cx": CX}
    res = requests.get(url, params=params)

    if res.status_code == 200:
        print("Search API: SUCCESS (200 OK)")
        print(f"Found: {len(res.json().get('items', []))} results")
    else:
        print(f"Search API Failed: {res.status_code}")
        print(f"Reason: {res.text}")
except Exception as e:
    print(f"Search Error: {e}")