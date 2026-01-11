import uuid
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI()

# In-memory storage
issues: Dict[str, Dict[str, Any]] = {}
comments: Dict[str, List[Dict[str, Any]]] = {}
transitions: Dict[str, List[Dict[str, Any]]] = {} # Mock transitions available
# Seed some default transitions
default_transitions = [
    {"id": "11", "name": "To Do", "to": {"name": "To Do", "id": "1", "statusCategory": {"id": 2, "key": "new", "colorName": "blue-gray", "name": "To Do"}}},
    {"id": "21", "name": "In Progress", "to": {"name": "In Progress", "id": "3", "statusCategory": {"id": 4, "key": "indeterminate", "colorName": "yellow", "name": "In Progress"}}},
    {"id": "31", "name": "Done", "to": {"name": "Done", "id": "10002", "statusCategory": {"id": 3, "key": "done", "colorName": "green", "name": "Done"}}},
]

class IssueFields(BaseModel):
    summary: Optional[str] = None
    description: Optional[Any] = None  # str for v2, ADF dict for v3
    issuetype: Optional[Dict[str, Any]] = None
    project: Optional[Dict[str, Any]] = None

class IssueCreate(BaseModel):
    fields: IssueFields

class IssueUpdate(BaseModel):
    fields: Optional[IssueFields] = None
    update: Optional[Dict[str, Any]] = None

class CommentCreate(BaseModel):
    body: Any  # str for v2, ADF dict for v3

class Transition(BaseModel):
    transition: Dict[str, Any]

@app.post("/rest/api/2/issue")
@app.post("/rest/api/3/issue")
async def create_issue(issue: IssueCreate):
    key = f"TEST-{len(issues) + 1}"
    new_issue = {
        "id": str(len(issues) + 1),
        "key": key,
        "self": f"http://localhost:8000/rest/api/2/issue/{key}",
        "fields": {
            "summary": issue.fields.summary,
            "description": issue.fields.description,
            "issuetype": issue.fields.issuetype or {"name": "Task"},
            "project": issue.fields.project or {"key": "TEST"},
            "status": {"name": "To Do", "id": "1", "statusCategory": {"id": 2, "key": "new", "colorName": "blue-gray", "name": "To Do"}},
            "comment": {"comments": [], "total": 0}
        }
    }
    issues[key] = new_issue
    # Store by ID as well for easier lookup
    issues[new_issue["id"]] = new_issue
    return new_issue

@app.get("/rest/api/2/issue/{issueIdOrKey}")
@app.get("/rest/api/3/issue/{issueIdOrKey}")
async def get_issue(issueIdOrKey: str):
    if issueIdOrKey not in issues:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issues[issueIdOrKey]

@app.put("/rest/api/2/issue/{issueIdOrKey}")
@app.put("/rest/api/3/issue/{issueIdOrKey}")
async def update_issue(issueIdOrKey: str, update: IssueUpdate):
    if issueIdOrKey not in issues:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue = issues[issueIdOrKey]
    
    # Handle fields update
    if update.fields:
        if update.fields.summary:
            issue["fields"]["summary"] = update.fields.summary
        if update.fields.description:
            issue["fields"]["description"] = update.fields.description
    
    # Handle 'update' dictionary if needed (simple implementation for now)
    
    return Response(status_code=204)

@app.post("/rest/api/2/issue/{issueIdOrKey}/comment")
@app.post("/rest/api/3/issue/{issueIdOrKey}/comment")
async def add_comment(issueIdOrKey: str, comment: CommentCreate):
    if issueIdOrKey not in issues:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    new_comment = {
        "id": str(uuid.uuid4()),
        "body": comment.body,
        "author": {"name": "user", "displayName": "User"},
        "created": "2023-01-01T12:00:00.000+0000"
    }
    
    issue = issues[issueIdOrKey]
    # In a real app this would be more complex, but for mock, just appending to fields
    # Note: JIRA structure for comments in retrieval is 'fields.comment.comments'
    if "comment" not in issue["fields"]:
         issue["fields"]["comment"] = {"comments": [], "total": 0}
         
    issue["fields"]["comment"]["comments"].append(new_comment)
    issue["fields"]["comment"]["total"] = len(issue["fields"]["comment"]["comments"])
    
    return new_comment

@app.post("/rest/api/2/issue/{issueIdOrKey}/transitions")
@app.post("/rest/api/3/issue/{issueIdOrKey}/transitions")
async def transition_issue(issueIdOrKey: str, transition: Transition):
    if issueIdOrKey not in issues:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    issue = issues[issueIdOrKey]
    target_transition_id = transition.transition.get("id")
    
    # Find target status based on transition ID
    target_status = None
    for t in default_transitions:
        if t["id"] == target_transition_id:
            target_status = t["to"]
            break
            
    if not target_status:
         raise HTTPException(status_code=400, detail="Invalid transition ID")

    issue["fields"]["status"] = target_status
    return Response(status_code=204)

@app.get("/rest/api/2/issue/{issueIdOrKey}/transitions")
@app.get("/rest/api/3/issue/{issueIdOrKey}/transitions")
async def get_transitions(issueIdOrKey: str):
     if issueIdOrKey not in issues:
        raise HTTPException(status_code=404, detail="Issue not found")
     
     return {"transitions": default_transitions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
