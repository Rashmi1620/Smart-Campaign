
import os
import logging
import operator
from typing import TypedDict, List, Dict, Any, Annotated

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END

from llm.gemini_llm import get_llm

# Setup Logging - Using Print for guaranteed console visibility as requested
class PrintLogger:
    def info(self, msg, *args, **kwargs):
        print(f"[INFO] {msg}", flush=True)
    def error(self, msg, *args, **kwargs):
        print(f"[ERROR] {msg}", flush=True)

logger = PrintLogger()
print("[STARTUP] Agents module loaded successfully!", flush=True)

# --- STATE DEFINITION ---

class NarrativeState(TypedDict):
    iteration: int
    raw_input: Dict[str, Any]
    
    context: Dict[str, Any]
    audience: Dict[str, Any]
    emotion: Dict[str, Any]
    trends: Dict[str, Any]
    competitor: Dict[str, Any]
    
    content: Dict[str, Any]
    
    stress_results: Dict[str, Any] # Will hold aggregated results
    feedback_report: Dict[str, Any]
    orchestrator_decision: Dict[str, Any]

# --- AGENT FUNCTIONS ---

def get_json_parser():
    return JsonOutputParser()

def agent_context_understanding(state: NarrativeState):
    logger.info("--- [START] Agent: Context Understanding ---")
    llm = get_llm()
    parser = get_json_parser()
    
    raw_input = state.get("raw_input", {})
    logger.info(f"[INPUT] raw_input: {raw_input}")
    prompt_text = """You are a Context Understanding Agent.

TASK:
Extract factual understanding of:
- product
- company
- market
- campaign goal

INPUT:
{input_data}

RULES:
- Do NOT generate ideas or opinions
- Explicitly list assumptions and unknowns

OUTPUT JSON ONLY.
Schema:
{{
  "product_summary": "",
  "market_category": "",
  "campaign_intent": "",
  "assumptions": [],
  "constraints": [],
  "unknowns": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"input_data": raw_input})
        logger.info(f"[OUTPUT] context: {result}")
        logger.info("--- [SUCCESS] Context Agent Finished ---")
        return {"context": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Context Agent Failed: {e}")
        return {"context": {"error": str(e)}}

def agent_audience_persona(state: NarrativeState):
    logger.info("--- [START] Agent: Audience & Persona ---")
    llm = get_llm()
    parser = get_json_parser()
    
    context = state.get("context", {})
    logger.info(f"[INPUT] context keys: {list(context.keys())}")
    
    prompt_text = """You analyze the target audience for a PRE-LAUNCH narrative.

Focus on:
- beliefs
- skepticism
- language sensitivity
- trust barriers

No content creation.
Output JSON only.

CONTEXT:
{context}

Output Schema:
{{
  "primary_persona": "",
  "beliefs": [],
  "skepticism_points": [],
  "language_preferences": [],
  "sensitivity_zones": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"context": context})
        logger.info(f"[OUTPUT] audience: {result}")
        logger.info("--- [SUCCESS] Audience Agent Finished ---")
        return {"audience": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Audience Agent Failed: {e}")
        return {"audience": {}}

def agent_emotion_psychology(state: NarrativeState):
    logger.info("--- [START] Agent: Emotion & Psychology ---")
    llm = get_llm()
    parser = get_json_parser()
    
    context = state.get("context", {})
    audience = state.get("audience", {})
    logger.info(f"[INPUT] context keys: {list(context.keys())}, audience keys: {list(audience.keys())}")
    
    prompt_text = """Analyze emotional and psychological impact of a campaign narrative
BEFORE it is launched.

Predict emotional reactions and trust effects.

CONTEXT:
{context}

AUDIENCE:
{audience}

Output JSON Only:
{{
  "intended_emotions": [],
  "psychological_triggers": [],
  "trust_builders": [],
  "emotional_risks": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"context": context, "audience": audience})
        logger.info(f"[OUTPUT] emotion: {result}")
        logger.info("--- [SUCCESS] Emotion Agent Finished ---")
        return {"emotion": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Emotion Agent Failed: {e}")
        return {"emotion": {}}

def agent_trend_analysis(state: NarrativeState):
    logger.info("--- [START] Agent: Trend Analysis ---")
    llm = get_llm()
    parser = get_json_parser()
    
    context = state.get("context", {})
    market = context.get("market_category", "General")
    logger.info(f"[INPUT] market: {market}")
    
    prompt_text = """Analyze current narrative and messaging trends in this market.
Focus on storytelling patterns, not visuals.

MARKET: {market}
CONTEXT: {context}

Output JSON Only:
{{
  "narrative_trends_aligned": [],
  "fatigued_patterns": [],
  "trend_conflict_risks": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"context": context, "market": market})
        logger.info(f"[OUTPUT] trends: {result}")
        logger.info("--- [SUCCESS] Trend Agent Finished ---")
        return {"trends": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Trend Agent Failed: {e}", exc_info=True)
        return {"trends": {}}

def agent_competitor_narrative(state: NarrativeState):
    logger.info("--- [START] Agent: Competitor Narrative ---")
    llm = get_llm()
    parser = get_json_parser()
    
    context = state.get("context", {})
    logger.info(f"[INPUT] context keys: {list(context.keys())}")
    
    prompt_text = """Analyze competitor positioning and narratives.
Identify how competitors could counter this campaign story.

CONTEXT:
{context}

Output JSON Only:
{{
  "competitor_story_patterns": [],
  "counter_narratives": [],
  "positioning_gaps": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"context": context})
        logger.info(f"[OUTPUT] competitor: {result}")
        logger.info("--- [SUCCESS] Competitor Agent Finished ---")
        return {"competitor": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Competitor Agent Failed: {e}")
        return {"competitor": {}}

def agent_content_generation(state: NarrativeState):
    logger.info("--- [START] Agent: Content Generation ---")
    iteration = state.get("iteration", 0)
    has_feedback = state.get("feedback_report") is not None
    logger.info(f"[INPUT] iteration: {iteration}, has_feedback: {has_feedback}")
    
    # Safely get required inputs
    context = state.get("context", {})
    audience = state.get("audience", {})
    emotion = state.get("emotion", {})
    trends = state.get("trends", {})
    competitor = state.get("competitor", {})
    
    # User Request: Use specific product name if not present
    if "product_summary" in context:
        if "Banana" not in str(context["product_summary"]) and "Nano" not in str(context["product_summary"]):
             logger.info("[OVERRIDE] Injecting 'Nano Banana Pro' as product context")
             context["product_summary"] = f"Nano Banana Pro ({context['product_summary']})"
    else:
        context["product_summary"] = "Nano Banana Pro"
    
    # Check if we have the required data
    if not context:
        logger.error("[ERROR] Missing 'context' in state - cannot generate content")
        return {"content": {"narrative_text": "Error: Missing context data."}}
    
    llm = get_llm()
    parser = get_json_parser()
    
    # Check if this is a revision (i.e. we have feedback)
    feedback_report = state.get("feedback_report")
    orchestrator_decision = state.get("orchestrator_decision")
    revision_context = ""
    
    if feedback_report and orchestrator_decision:
        revision_focus = orchestrator_decision.get("revision_focus", {})
        logger.info(f"[REVISION MODE] Using feedback. Focus: {revision_focus}")
        revision_context = f"""
*** REVISION MODE (Iteration {iteration}) ***
PREVIOUS ITERATION FEEDBACK:
- Health Score: {feedback_report.get('overall_health_score', 'N/A')}
- Blocking Issues: {feedback_report.get('blocking_issues', [])}
- Non-Blocking Issues: {feedback_report.get('non_blocking_issues', [])}

ORCHESTRATOR INSTRUCTIONS:
- Agents to Focus: {orchestrator_decision.get('agents_to_rerun', [])}
- Revision Focus: {revision_focus}

TASK: IMPROVE the narrative by addressing the above feedback.
"""

    prompt_text = """Generate a TEXT-ONLY campaign narrative.

RULES:
- Pre-launch focused
- No virality tricks
- Clear, credible, honest

TASK:
1. Generate the narrative.
2. Extract Key Messages.
3. For EACH Key Message, create an Instagram Post (Caption + Image Idea) for the product 'Nano Banana Pro'.

CONTEXT: {context}
AUDIENCE: {audience}
EMOTION: {emotion}
TRENDS: {trends}
COMPETITOR: {competitor}

{revision_context}

Output JSON only. Make sure 'instagram_posts' array has one entry per key_message.

Output Schema:
{{
  "narrative_text": "",
  "key_messages": [],
  "instagram_posts": [
    {{
      "key_message_ref": "message string",
      "post_caption": "Caption with hashtags",
      "image_idea": "Visual description"
    }}
  ],
  "assumptions_used": []
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        logger.info("Calling LLM for content generation...")
        result = chain.invoke({
            "context": context,
            "audience": audience,
            "emotion": emotion,
            "trends": trends,
            "competitor": competitor,
            "revision_context": revision_context
        })
        logger.info(f"[OUTPUT] content narrative preview: {result.get('narrative_text', '')[:100]}...")
        logger.info("--- [SUCCESS] Content Generation Finished ---")
        return {"content": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Content Generation Failed: {e}")
        return {"content": {"narrative_text": f"Error producing content: {str(e)}"}}

# --- STRESS TEST AGENTS ---

def agent_stress_test_suite(state: NarrativeState):
    logger.info("--- [START] Agent: Stress Test Suite ---")
    logger.info("[INPUT] Running 4 sub-agents: Skeptic, Rational, Cultural, Language")
    
    llm = get_llm()
    # We will manually parse to log raw output on failure
    import json
    from langchain_core.output_parsers import StrOutputParser
    
    content = state.get("content", {})
    audience = state.get("audience", {})
    
    # Convert to string for prompt if dict
    content_str = str(content) if isinstance(content, dict) else content
    audience_str = str(audience) if isinstance(audience, dict) else audience
    
    def run_sub_agent(name, prompt, inputs):
        logger.info(f"  -> Running {name} Agent...")
        # Use StrOutputParser to get raw text first
        chain = prompt | llm | StrOutputParser()
        try:
            raw_output = chain.invoke(inputs)
            logger.info(f"  -> [DEBUG] {name} RAW OUTPUT: {raw_output}")
            
            # Clean possible markdown blocks if LLM ignores instruction
            cleaned_output = raw_output.replace("```json", "").replace("```", "").strip()
            
            parsed_json = json.loads(cleaned_output)
            return parsed_json
        except Exception as e:
            logger.error(f"  -> [ERROR] {name} Agent JSON Parse Failed: {e}. Raw: {raw_output if 'raw_output' in locals() else 'None'}")
            # Return empty structure relative to specific agent to avoid breaking pipeline
            return {}

    logger.info("  -> Running Skeptic Agent...")
    
    # Skeptic
    skeptic_prompt = ChatPromptTemplate.from_template("""You are a skeptical consumer analyzing marketing content.
Assume zero trust. Attack credibility, intent, and clarity.

CONTENT TO ANALYZE:
{content}

AUDIENCE:
{audience}

IMPORTANT: You MUST respond with ONLY valid JSON. 
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.

Respond with this exact JSON structure:
{{"credibility_breaks": ["issue1", "issue2"], "trust_questions": ["question1"], "belief_fail_points": ["point1"]}}""")
    skeptic_res = run_sub_agent("Skeptic", skeptic_prompt, {"content": content_str, "audience": audience_str})
    
    # Rational
    rational_prompt = ChatPromptTemplate.from_template("""Evaluate logical consistency and value clarity of this content.
No emotional judgment. Be objective.

CONTENT TO ANALYZE:
{content}

IMPORTANT: You MUST respond with ONLY valid JSON. 
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.

Respond with this exact JSON structure:
{{"logic_gaps": ["gap1", "gap2"], "unclear_value_exchanges": ["exchange1"], "clarity_score": 7}}

The clarity_score must be an integer from 1-10.""")
    rational_res = run_sub_agent("Rational", rational_prompt, {"content": content_str})
    
    # Cultural
    cultural_prompt = ChatPromptTemplate.from_template("""Identify cultural, ethical, or religious risks in this marketing narrative.

CONTENT TO ANALYZE:
{content}

AUDIENCE:
{audience}

IMPORTANT: You MUST respond with ONLY valid JSON. 
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.

Respond with this exact JSON structure:
{{"cultural_risks": ["risk1"], "ethical_red_flags": ["flag1"], "severity": "low"}}

The severity must be exactly one of: "low", "medium", or "high".""")
    cultural_res = run_sub_agent("Cultural", cultural_prompt, {"content": content_str, "audience": audience_str})
    
    # Language
    lang_prompt = ChatPromptTemplate.from_template("""Analyze language precision, ambiguity, and narrative flow.

CONTENT TO ANALYZE:
{content}

IMPORTANT: You MUST respond with ONLY valid JSON. 
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.

Respond with this exact JSON structure:
{{"ambiguous_phrases": ["phrase1"], "buzzwords": ["word1"], "flow_breaks": ["break1"], "rewrite_zones": ["zone1"]}}""")
    lang_res = run_sub_agent("Language", lang_prompt, {"content": content_str})
    
    stress_results = {
        "skeptic": skeptic_res,
        "rational": rational_res,
        "cultural": cultural_res,
        "language": lang_res
    }
    logger.info(f"[OUTPUT] stress_results keys: {list(stress_results.keys())}")
    logger.info("--- [SUCCESS] Stress Test Suite Finished ---")
    
    return {"stress_results": stress_results}

def agent_feedback_synthesis(state: NarrativeState):
    logger.info("--- [START] Agent: Feedback Synthesis ---")
    llm = get_llm()
    parser = get_json_parser()
    
    results = state["stress_results"]
    logger.info(f"[INPUT] stress_results keys: {list(results.keys())}")
    
    prompt_text = """Aggregate all stress test feedback.
Identify blocking issues and faulty upstream agents.
Do not propose fixes.

INPUTS:
Skeptic: {skeptic}
Rational: {rational}
Cultural: {cultural}
Language: {language}

Output JSON Only:
{{
  "overall_health_score": 0,
  "blocking_issues": [],
  "non_blocking_issues": [],
  "faulty_agents": [
    {{ "agent_name": "", "reason": "" }}
  ],
  "stop_condition_met": false
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke(results)
        logger.info(f"[OUTPUT] health_score: {result.get('overall_health_score')}, stop: {result.get('stop_condition_met')}")
        logger.info(f"--- [SUCCESS] Feedback Synthesis Finished ---")
        return {"feedback_report": result}
    except Exception as e:
        logger.error(f"--- [ERROR] Synthesis Failed: {e}")
        return {"feedback_report": {"stop_condition_met": True, "error": str(e)}}

def agent_strategy_orchestrator(state: NarrativeState):
    logger.info("--- [START] Agent: Strategy Orchestrator ---")
    llm = get_llm()
    parser = get_json_parser()
    
    report = state["feedback_report"]
    iteration = state.get("iteration", 0)
    logger.info(f"[INPUT] iteration: {iteration}, health_score: {report.get('overall_health_score')}")
    
    if iteration >= 1:
        logger.info("Max iterations reached.")
        return {
            "orchestrator_decision": {"decision": "finalize"},
            "iteration": iteration + 1
        }
        
    prompt_text = """You are the Strategy Orchestrator.

Decide:
- finalize OR revise
- which agents must rerun
- what they must fix

Max 1 iterations. Current Iteration: {iteration}

FEEDBACK REPORT:
{report}

Output JSON Only:
{{
  "decision": "finalize | revise",
  "agents_to_rerun": [],
  "revision_focus": {{}}
}}

IMPORTANT: You MUST respond with ONLY valid JSON.
DO NOT include ```json ... ``` markdown blocks.
DO NOT include any introductory text.
"""
    prompt = ChatPromptTemplate.from_template(prompt_text)
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke({"report": report, "iteration": iteration})
        logger.info(f"--- [SUCCESS] Orchestrator Decision: {result.get('decision')} ---")
        return {
            "orchestrator_decision": result,
            "iteration": iteration + 1
        }
    except Exception as e:
        logger.error(f"--- [ERROR] Orchestrator Failed: {e}", exc_info=True)
        return {"orchestrator_decision": {"decision": "finalize"}}

# --- ROUTER ---

def router_orchestrator(state: NarrativeState):
    decision = state["orchestrator_decision"].get("decision", "finalize")
    if decision == "revise":
        return "revise"
    return "finalize"

# --- GRAPH CONSTRUCTION ---

def build_graph():
    workflow = StateGraph(NarrativeState)
    
    # Nodes
    workflow.add_node("context_understanding", agent_context_understanding)
    workflow.add_node("audience_persona", agent_audience_persona)
    workflow.add_node("emotion_psychology", agent_emotion_psychology)
    workflow.add_node("trend_analysis", agent_trend_analysis)
    workflow.add_node("competitor_narrative", agent_competitor_narrative)
    
    workflow.add_node("content_generation", agent_content_generation)
    workflow.add_node("stress_test_suite", agent_stress_test_suite)
    workflow.add_node("feedback_synthesis", agent_feedback_synthesis)
    workflow.add_node("strategy_orchestrator", agent_strategy_orchestrator)
    
    # Edges - Foundation (Linear)
    workflow.set_entry_point("context_understanding")
    workflow.add_edge("context_understanding", "audience_persona")
    workflow.add_edge("audience_persona", "emotion_psychology")
    workflow.add_edge("emotion_psychology", "trend_analysis")
    workflow.add_edge("trend_analysis", "competitor_narrative")
    workflow.add_edge("competitor_narrative", "content_generation")
    
    # Loop start
    workflow.add_edge("content_generation", "stress_test_suite")
    workflow.add_edge("stress_test_suite", "feedback_synthesis")
    workflow.add_edge("feedback_synthesis", "strategy_orchestrator")
    
    # Conditional Edge
    workflow.add_conditional_edges(
        "strategy_orchestrator",
        router_orchestrator,
        {
            "finalize": END,
            "revise": "content_generation" # Simplification: The orchestrator logic text says "selective agent rerun", but for this basic graph we loop back to content generation to re-attempt based on new state/feedback implicitly or explicitly if passing focus.
            # To strictly follow "Agents run initially and rerun only if orchestrated", 
            # we would need more complex routing. For this task, looping back to Content Generation 
            # with the revision focus (which ends up in state) is the practical impl.
        }
    )
    
    return workflow.compile()

# --- EXPORTED FUNCTION ---

def run_campaign_pipeline(user_prompt: str, user_id: str = "default"):
    """
    Main entry point for the campaign agent pipeline.
    """
    app = build_graph()
    
    initial_state = {
        "raw_input": {"prompt": user_prompt, "user_id": user_id},
        "iteration": 0
    }
    
    final_state = app.invoke(initial_state)
    return final_state