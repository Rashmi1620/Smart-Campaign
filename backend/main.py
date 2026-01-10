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
# Ensure serviceAccountKey.json is in the /backend directory
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
db = firestore.client()

# Import agents after firebase init to ensure db access if needed globally, 
# though passing db is better.
from agents import run_campaign_pipeline

class CampaignRequest(BaseModel):
    userId: str
    productName: str
    description: str
    targetAudience: str
    competitorName: str
    region: str

@app.get("/")
def read_root():
    return {"status": "MarketMind AI Backend is running", "docs_url": "/docs"}

@app.post("/api/start_campaign")
async def start_campaign(request: CampaignRequest, background_tasks: BackgroundTasks):
    try:
        # Create initial Firestore document
        doc_ref = db.collection("users").document(request.userId).collection("campaigns").document()
        campaign_id = doc_ref.id
        
        initial_data = {
            "productName": request.productName,
            "status": "started",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "audience_result": None,
            "research_result": None,
            "strategy_result": None,
            "content_result": None,
            # Store inputs for agents usage
            "inputs": {
                "productName": request.productName,
                "description": request.description,
                "targetAudience": request.targetAudience,
                "competitorName": request.competitorName,
                "region": request.region
            }
        }
        
        doc_ref.set(initial_data)

        # Trigger Background Pipeline
        background_tasks.add_task(
            run_campaign_pipeline, 
            campaign_id=campaign_id, 
            user_id=request.userId, 
            inputs=initial_data["inputs"]
        )

        return {"status": "started", "campaignId": campaign_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
