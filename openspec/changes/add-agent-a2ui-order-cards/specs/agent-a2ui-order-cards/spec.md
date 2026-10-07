## ADDED Requirements

### Requirement: Agent order tools render restricted A2UI cards
The FastAPI Business Agent SHALL emit and persist a `data-a2ui` part after supported DS-order tool results. Commands SHALL use A2UI v0.9 and a local allowlisted catalog.

#### Scenario: View order detail
- **WHEN** the Agent calls `get_ds_order`
- **THEN** the stream emits an ordered detail-card part after the tool result and history replays it

### Requirement: Confirmed card actions update persisted card state
The FastAPI action endpoint SHALL bind an action to the Bearer user, tenant and persisted conversation surface before executing the DS-order state transition.

#### Scenario: Cancel an eligible order
- **WHEN** the user confirms cancellation with a reason
- **THEN** the service updates the order and appends a data-model update to the original card

#### Scenario: Reopen history
- **WHEN** the user reloads the conversation after an action
- **THEN** the card renders the updated order state
