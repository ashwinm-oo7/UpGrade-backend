import dotenv from "dotenv";
const http = require("http");
dotenv.config();
const API_BASE = process.env.Backend_URL || "http://localhost:5000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, prefix, message) {
  console.log(`${colors[color]}${prefix} ${message}${colors.reset}`);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  log("cyan", "🚀", "Starting Telegram Login Flow Tests\n");

  try {
    // Test 1: Get token
    log("blue", "📝", "Test 1: GET /api/auth/telegram-login-token");
    const tokenRes = await request("GET", "/api/auth/telegram-login-token");

    if (tokenRes.status !== 200) {
      log("red", "❌", `Expected 200, got ${tokenRes.status}`);
      return;
    }

    const { token, botLink } = tokenRes.body;
    log("green", "✅", "Token generated successfully");
    log("yellow", "🎫", `Token: ${token}`);
    log("yellow", "🤖", `Bot Link: ${botLink}\n`);

    // Test 2: Verify without webhook (should fail)
    log(
      "blue",
      "📝",
      "Test 2: POST /api/auth/telegram-login-verify (before webhook)",
    );
    const verifyEarlyRes = await request(
      "POST",
      "/api/auth/telegram-login-verify",
      { token },
    );

    if (
      verifyEarlyRes.status === 400 &&
      verifyEarlyRes.body.msg === "Not verified yet"
    ) {
      log("green", "✅", 'Correctly returns "Not verified yet"');
    } else {
      log(
        "red",
        "❌",
        `Unexpected response: ${JSON.stringify(verifyEarlyRes.body)}`,
      );
      return;
    }

    log("yellow", "⏳", "Simulating webhook from Telegram...\n");

    // Test 3: Simulate webhook
    log("blue", "📝", "Test 3: POST /auth/telegram-webhook");
    const webhookRes = await request("POST", "/auth/telegram-webhook", {
      message: {
        message_id: 1,
        chat: { id: 123456789 },
        from: { id: 7654321, username: "testuser" },
        text: `/start ${token}`,
      },
    });

    if (webhookRes.status === 200) {
      log("green", "✅", "Webhook returned 200 immediately");
    } else {
      log("red", "❌", `Webhook returned ${webhookRes.status}`);
      return;
    }

    // Give async handler time to process
    log("yellow", "⏳", "Waiting for async webhook processing (1 second)...\n");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 4: Verify after webhook (should succeed)
    log(
      "blue",
      "📝",
      "Test 4: POST /api/auth/telegram-login-verify (after webhook)",
    );
    const verifyRes = await request("POST", "/api/auth/telegram-login-verify", {
      token,
    });

    if (verifyRes.status === 200 && verifyRes.body.accessToken) {
      log("green", "✅", "Login successful!");
      log(
        "yellow",
        "🔑",
        `Access Token: ${verifyRes.body.accessToken.substring(0, 20)}...`,
      );
      log("green", "✨", "\n🎉 All tests passed! Flow is working correctly.");
    } else {
      log("red", "❌", `Verify failed: ${JSON.stringify(verifyRes.body)}`);
      return;
    }
  } catch (error) {
    log("red", "❌", `Error: ${error.message}`);
    log("yellow", "💡", "Make sure server is running: npm start");
  }
}

runTests();
