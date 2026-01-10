# Agent API Definitions

This directory contains extracted Agent API definitions from the `docs/api.html` documentation file.

## Files

- `agent-apis.json` - JSON format API definitions
- `agent-apis.ts` - TypeScript definitions with types

## Extraction

The APIs are extracted using the script `scripts/extract-agent-apis.js`. To re-extract:

```bash
node scripts/extract-agent-apis.js
```

## API Structure

Each API definition includes:

- `id` - Operation ID (e.g., "get_agents")
- `name` - Human-readable name (e.g., "Get Agents")
- `description` - API description
- `method` - HTTP method (get, post, put, patch, delete)
- `path` - API endpoint path (e.g., "/agents")
- `parameters` - Query, path, and header parameters
- `requestBody` - Request body schema (if applicable)
- `responses` - Response status codes and descriptions
- `authorization` - Authorization type (e.g., "HTTPBearer")

## Extracted APIs

The following Agent APIs have been extracted:

1. **Get Agents** - `GET /agents` - Retrieve all agents owned by the user
2. **Get Agent** - `GET /agents/{agent_id}` - Get a single agent by ID or slug
3. **Archive Agent** - `PUT /agents/{agent_id}/archive` - Archive an agent
4. **Activate Agent** - `PUT /agents/{agent_id}/active` - Activate (unarchive) an agent
5. **Get Agent Tasks** - `GET /agents/{agent_id}/tasks` - Get all tasks for an agent
6. **Create Agent Task** - `POST /agents/{agent_id}/tasks` - Add a new task to an agent
7. **Update Agent Task** - `PATCH /agents/{agent_id}/tasks/{task_id}` - Update an agent task
8. **Delete Agent Task** - `DELETE /agents/{agent_id}/tasks/{task_id}` - Delete an agent task
9. **Get Agent Task Log** - `GET /agents/{agent_id}/tasks/{task_id}/log` - Get task log

## Usage

### TypeScript

```typescript
import { agentAPIs, AgentAPI } from './api/agent-apis';

// Access all APIs
console.log(agentAPIs);

// Find a specific API
const getAgentsAPI = agentAPIs.find(api => api.id === 'get_agents');
```

### JSON

```javascript
const agentAPIs = require('./api/agent-apis.json');

console.log(agentAPIs.apis);
```

