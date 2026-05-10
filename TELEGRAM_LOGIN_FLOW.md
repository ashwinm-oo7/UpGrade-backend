# Telegram Login Flow - Complete Guide

## Backend Changes Made ✅

### 1. **Auth Route: `/telegram-login-token`** (GET)
- **Fixed**: Added `verified: false` flag during token creation
- **Added**: Debug logging to track token generation
- **Log Output**:
  ```
  🎫 Token generated: <token>
  📦 Current tokens: [list of token keys]
  ```

### 2. **Telegram Webhook: `/auth/telegram-webhook`** (POST)
- **Verified**: Returns `res.sendStatus(200)` **immediately** before async processing
- **Enhanced**: Complete logging of webhook lifecycle
- **Flow**:
  1. Receives Telegram message
  2. Responds with 200 instantly (no delays)
  3. Processes async in background
  4. Extracts username and payload from message
  5. Saves user to DB
  6. Marks token as verified if payload exists
- **Log Output**:
  ```
  🔥 TELEGRAM WEBHOOK HIT
  📨 Webhook body: {...}
  📩 Message received from: @username ChatId: 123456
  🔑 Extracted payload: <token>
  ✅ TOKEN FOUND! Marking as verified...
  🎉 TOKEN VERIFIED!
  ```

### 3. **Auth Route: `/telegram-login-verify`** (POST)
- **Enhanced**: Detailed error handling and logging
- **Checks**:
  1. Token exists in request ✅
  2. Token exists in global storage ✅
  3. Token is marked as verified ✅
  4. Finds or creates user ✅
  5. Generates JWT ✅
  6. Cleans up token ✅
- **Log Output**:
  ```
  🔍 Verify endpoint called with token: <token>
  📦 Available tokens: [...]
  ✅ Token found. Record: {...}
  ✨ Token verified! Username: @user ChatId: 123456
  👤 Creating new user: @user
  ✅ User ready: <userId>
  🎉 Login success for user: @user
  ```

## Frontend Implementation (Required) 📱

### Step 1: Get Token
```javascript
const response = await fetch('/api/auth/telegram-login-token');
const { token, botLink } = await response.json();
```

### Step 2: Open Telegram
```javascript
window.open(botLink, '_blank');
```

### Step 3: Poll for Verification
```javascript
let pollCount = 0;
const maxPolls = 30; // 60 seconds with 2s interval

const pollInterval = setInterval(async () => {
  pollCount++;
  try {
    const verifyResponse = await fetch('/api/auth/telegram-login-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await verifyResponse.json();

    if (verifyResponse.ok) {
      // ✅ Success!
      clearInterval(pollInterval);
      localStorage.setItem('accessToken', data.accessToken);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      console.log(`Poll ${pollCount}: Not verified yet - ${data.msg}`);
    }
  } catch (error) {
    console.error('Poll error:', error);
  }

  // Stop after max attempts
  if (pollCount >= maxPolls) {
    clearInterval(pollInterval);
    alert('Verification timeout. Please try again.');
  }
}, 2000);
```

## Testing Checklist ✔️

### 1. Check Server Logs
```bash
npm start
# Should show:
# ✅ Server running on port 5000
# ✅ MongoDB connected successfully
```

### 2. Test Token Generation
```bash
curl -X GET http://localhost:5000/api/auth/telegram-login-token

# Expected:
# {
#   "token": "abc123...",
#   "botLink": "https://t.me/MauryaTechBot?start=abc123..."
# }

# Server log should show:
# 🎫 Token generated: abc123...
# 📦 Current tokens: ["abc123..."]
```

### 3. Test Webhook (Simulate Telegram)
```bash
curl -X POST http://localhost:5000/auth/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "message_id": 1,
      "chat": { "id": 123456 },
      "from": { "id": 7654321, "username": "testuser" },
      "text": "/start abc123..."
    }
  }'

# Expected response: 200

# Server log should show:
# 🔥 TELEGRAM WEBHOOK HIT
# ✅ TOKEN FOUND! Marking as verified...
# 🎉 TOKEN VERIFIED!
```

### 4. Test Verify Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/telegram-login-verify \
  -H "Content-Type: application/json" \
  -d '{ "token": "abc123..." }'

# Expected if verified:
# {
#   "msg": "Login success",
#   "accessToken": "eyJhbGc..."
# }

# Server log should show:
# 🔍 Verify endpoint called with token: abc123...
# ✅ Token found. Record: {...}
# ✨ Token verified! Username: @testuser ChatId: 123456
# 🎉 Login success for user: @testuser
```

## Common Issues & Fixes 🔧

### Issue: "Not verified yet" Error
**Cause**: Webhook didn't hit or token wasn't marked verified

**Fixes**:
1. Verify webhook URL is correct in Telegram Bot settings:
   - Should be: `https://<ngrok-url>/auth/telegram-webhook`
   - Or: `https://<render-url>/auth/telegram-webhook`
2. Check server logs for "🔥 TELEGRAM WEBHOOK HIT"
3. Verify token format matches (no extra quotes)

### Issue: "Token not found" Error
**Cause**: Token was generated but frontend sent wrong token

**Fixes**:
1. Copy token exactly from response
2. Don't modify or encode the token
3. Check frontend console for token value

### Issue: Webhook Timeout
**Cause**: `res.sendStatus()` being called inside async handler

**Verification**: ✅ Fixed in code - response is sent **before** handleTelegram()

### Issue: User Not Created
**Cause**: Invalid username format

**Verification**: ✅ Fixed - defaults to `tg_<chatId>` if username missing

## Environment Variables Required ⚙️

```env
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
MONGO_URI=your_mongo_uri
MONGO_USERNAME=your_user
MONGO_PASSWORD=your_pass
dbName=your_db
NODE_ENV=development
PORT=5000
```

## Webhook URL Configuration 📡

### For Local Testing (ngrok)
```bash
# Terminal 1: Start tunnel
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# In Telegram Bot Settings (via BotFather):
# /setwebhook https://abc123.ngrok.io/auth/telegram-webhook
```

### For Production (Render/Vercel)
```bash
# In Telegram Bot Settings (via BotFather):
# /setwebhook https://your-domain.com/auth/telegram-webhook
```

## Log Analysis 📊

### Successful Flow
```
🎫 Token generated: abc123def456
📦 Current tokens: ["abc123def456"]
🔥 TELEGRAM WEBHOOK HIT
📨 Webhook body: {...}
📩 Message received from: @myuser ChatId: 123456
🔑 Extracted payload: abc123def456
✅ TOKEN FOUND! Marking as verified...
🎉 TOKEN VERIFIED!
✨ Token data: {createdAt:..., verified:true, chatId:123456, username:@myuser}
🔍 Verify endpoint called with token: abc123def456
📦 Available tokens: ["abc123def456"]
✅ Token found. Record: {createdAt:..., verified:true, ...}
✨ Token verified! Username: @myuser ChatId: 123456
✅ User ready: 507f1f77bcf86cd799439011
🎉 Login success for user: @myuser
```

### Issue: Token Not Being Verified
```
🎫 Token generated: abc123def456
🔥 TELEGRAM WEBHOOK HIT
❌ No message field in webhook  // ← Problem detected
```

### Issue: Webhook Not Hitting
```
🎫 Token generated: abc123def456
📦 Current tokens: ["abc123def456"]
🔍 Verify endpoint called with token: abc123def456
📦 Available tokens: ["abc123def456"]
✅ Token found. Record: {createdAt:..., verified:false}  // ← Still false!
❌ Token not verified yet: abc123def456
```

## Next Steps 🚀

1. ✅ Backend fixed - redeploy
2. ⏳ Update frontend with polling logic
3. 🧪 Test with curl commands above
4. 📱 Test full flow with actual Telegram
5. 🐛 Check server logs for debug info
6. 📡 Verify webhook URL in bot settings

---

**Questions?** Check `/auth/telegram-webhook` logs - they show exactly what's happening!
