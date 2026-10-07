## ADDED Requirements

### Requirement: Agent order tools render restricted A2UI cards
The FastAPI Business Agent SHALL compile supported read-only DS-order results into restricted A2UI v0.9 cards and SHALL emit them only in the final result after deterministic concise text. Commands SHALL use a local allowlisted catalog.

#### Scenario: View order detail
- **WHEN** the Agent calls `get_ds_order`
- **THEN** the tool-result stage contains no card and the final stream emits concise text followed by the detail card and completion

#### Scenario: Request an order write operation
- **WHEN** the user asks to audit, reject or cancel an order
- **THEN** the model queries the latest order state and the user performs the write through the card form because no order write tool is registered

### Requirement: Card form actions update persisted card state
The FastAPI action endpoint SHALL bind an action to the Bearer user, tenant and persisted conversation surface before executing the DS-order state transition.

#### Scenario: Cancel an eligible order
- **WHEN** the user submits cancellation with a reason from the card's persistent inline form
- **THEN** the service updates the order and appends a data-model update to the original card

#### Scenario: Reopen history
- **WHEN** the user reloads the conversation after an action
- **THEN** the card renders the updated order state
