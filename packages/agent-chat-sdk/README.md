# aplus-agent-chat

Framework-agnostic Agent Chat Web Component for Aplus business agents. The package does not depend on `@aplus-frontend/ui`.

## Usage

```html
<script type="module">
  import 'aplus-agent-chat';
</script>

<aplus-agent-chat
  base-url="https://api.example.com"
  token="your-secret-token"
  auth-type="secret"
  supplier="yurex"
></aplus-agent-chat>
```

## Dynamic token

```js
const element = document.querySelector('aplus-agent-chat');
element.setTokenProvider(() => localStorage.getItem('agent-token'));
```

## Attributes

- `base-url`: API base URL.
- `chat-api`: chat endpoint, default `/agent/chat`.
- `auth-type`: `jwt` or `secret`.
- `token`: static token.
- `supplier`: tenant supplier code.
- `participant-id`: current participant id.
- `channel`: session channel.
- `conversation-type`: session conversation type.
- `assistant-name`, `user-label`, `history-title`, `empty-title`, `empty-description`: display options.
