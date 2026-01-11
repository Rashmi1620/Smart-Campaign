import os
import uvicorn
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="MarketMind AI Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Import agents
from agents import run_campaign_pipeline

class CampaignRequest(BaseModel):
    userId: str
    prompt: str

@app.get("/")
def read_root():
    return {"status": "MarketMind AI Backend is running", "docs_url": "/docs"}

def background_campaign_runner(campaign_id: str, prompt: str, user_id: str):
    """
    Wrapper to run the LangGraph pipeline and save results to Firestore.
    """
    print(f"--- [BACKGROUND] Starting Campaign Runner ID: {campaign_id} ---", flush=True)
    doc_ref = db.collection("users").document(user_id).collection("campaigns").document(campaign_id)
    try:
        doc_ref.update({"status": "processing"})
        
        # Run the pipeline
        final_state = run_campaign_pipeline(prompt, user_id)
        
        # Save relevant results
        result_data = {
            "status": "completed",
            "context": final_state.get("context"),
            "audience": final_state.get("audience"),
            "emotion": final_state.get("emotion"),
            "trends": final_state.get("trends"),
            "competitor": final_state.get("competitor"),
            "content": final_state.get("content"),
            "stress_results": final_state.get("stress_results"),
            "feedback_report": final_state.get("feedback_report"),
            "final_decision": final_state.get("orchestrator_decision")
        }
        
        doc_ref.update(result_data)
        print(f"--- [BACKGROUND] Campaign {campaign_id} Completed Successfully ---", flush=True)
        
    except Exception as e:
        print(f"--- [BACKGROUND] Campaign {campaign_id} Failed: {e} ---", flush=True)
        doc_ref.update({"status": "failed", "error": str(e)})

@app.post("/api/start_campaign")
async def start_campaign(request: CampaignRequest, background_tasks: BackgroundTasks):
    print(">>> [API] ENDPOINT HIT - /api/start_campaign <<<", flush=True)
    try:
        print(f"--- [API] Received Campaign Request from User: {request.userId} ---", flush=True)
        # Create initial Firestore document
        doc_ref = db.collection("users").document(request.userId).collection("campaigns").document()
        campaign_id = doc_ref.id
        
        initial_data = {
            "prompt": request.prompt,
            "status": "started",
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        
        doc_ref.set(initial_data)

        # Trigger Background Pipeline
        background_tasks.add_task(
            background_campaign_runner,
            campaign_id=campaign_id,
            prompt=request.prompt,
            user_id=request.userId
        )


        return {"status": "started", "campaignId": campaign_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
