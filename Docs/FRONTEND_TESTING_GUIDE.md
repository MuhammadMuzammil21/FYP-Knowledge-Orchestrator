# Frontend Testing Guide: AI Voice Knowledge Orchestrator

This guide provides step-by-step instructions to test all features implemented in the latest sprint. It covers the end-to-end flow from account creation to automated mention notifications.

---

## 1. Prerequisites & Environment Setup

Before testing, ensure your local environment is correctly configured:

### 1.1 Database Migration
Run the migration script to apply new tables and columns:
```bash
cd backend && python3 migrate_sprint.py
```

### 1.2 Backend Config
Check your `.env` file:
- `CORS_ORIGINS` must include your frontend URL (e.g., `http://localhost:3000`).
- `EMAIL_ENABLED=false` (unless you have SMTP configured).

### 1.3 Start Services
- **Backend:** `python3 -m app.main`
- **Worker:** `celery -A workers.celery_app worker --loglevel=info`
- **Redis/Postgres/Neo4j** must be running.

---

## 2. Authentication & Session Management (F1)

### 2.1 Create a New Account
1. Navigate to the `/signup` page.
2. Fill in **Name**, **Email**, and **Password**.
3. **Technical Check:** Open the browser's **Network Tab**.
   - Verify the `/signup` response contains `access_token` and `refresh_token`.
   - Verify the response includes a `Set-Cookie` header for `harbaat_refresh` (`HttpOnly`, `SameSite=Lax`).

### 2.2 Token Refresh & Expiry
1. The access token is set to 15 minutes. To test refresh without waiting:
   - Delete the `access_token` from your app state/localStorage (but keep the cookie).
   - Perform a navigate/refresh. The frontend should call `POST /api/auth/refresh`.
2. **Technical Check:** Ensure the new `access_token` is valid and the refresh cookie is rotated (new value in cookie).

### 2.3 Session Management
1. Navigate to **User Settings > Active Sessions**.
2. Verify the list of active devices/browsers appears.
3. Click **"Revoke"** on a different session (or create a second login in Incognito to see it).
4. **Verification:** The revoked session should be forcefully logged out on its next API call.

---

## 3. Voice Identity Registration (F4)

### 3.1 Registering Your Voice
1. Navigate to **User Settings > Voice Identity**.
2. Upload a clear audio clip of your voice (30–60 seconds, `.wav` or `.mp3`).
3. Verify the status changes to **"Pending"**.
4. Wait for the Celery worker to finish. Refresh the page.
5. **Verification:** Status should change to **"Ready"**.
   - **Backend Check:** The audio file should disappear from `backend/uploads/voice_clips` (privacy check).
   - **DB Check:** A record should exist in `user_voice_profiles` and `known_speakers`.

---

## 4. Meeting Processing & Entity Linking (F2)

### 4.1 Meeting Upload
1. Go to a **Project** and click **Upload Meeting**.
2. Upload an audio file containing speakers (one should be the user you just registered).
3. Wait for processing (ASR → Cleanup → Insights).

### 4.2 Auto-Linking Verification
1. Once processing is complete, open the meeting.
2. Check the **Speaker Management** panel.
3. **Verification:** The speaker mapping for your voice should automatically show your **Name** and have a `linked_user_id` pointing to your account.
   - **Neo4j Check:** Run `MATCH (p:Person {name: "Your Name"}) RETURN p`. It should have a `user_id` property.

### 4.3 Manual Speaker Linking
1. Pick an unidentified speaker (e.g., `SPEAKER_01`).
2. Click the **"Link User"** button (or the edit icon).
3. Select a team member from the dropdown.
4. **Verification:** The speaker label should update to the user's name globally in that meeting's transcript.

---

## 5. Mention Notifications (F4)

### 5.1 Triggering a Mention
1. Log in as **User A**.
2. Upload a meeting to a project where **User B** (an absent team member) is mentioned by name in the conversation.
3. Wait for the **"Insights"** stage to finish.

### 5.2 Notification Delivery
1. Log in as **User B**.
2. Look at the navigation bar's **Bell Icon**.
3. **Verification:** A red badge should appear with the unread count.
4. Click the icon to open the **Notification Panel**.
5. **Verification:** You should see: *"You were mentioned in 'Project X / Meeting Y'"*.
6. Click the notification. It should navigate you to the meeting and mark itself as **Read**.

### 5.3 Notification Preferences
1. Navigate to **Settings > Notifications**.
2. Toggle **"Notify on Mention"** to **Off**.
3. Trigger another mention for this user.
4. **Verification:** No notification should be generated.

---

## 6. Email Delivery (F3 Scaffold)

Since `EMAIL_ENABLED=false` is default, we verify the logic via logs:

1. Trigger a signup, password reset, or mention notification.
2. Check the **Backend Console Logs**.
3. **Verification:** Look for lines starting with `[EmailService] EMAIL_ENABLED=false`.
   - It should print the `To`, `Subject`, and `Body` placeholder.
   - Example: `[EmailService] ... skipping send to=bob@example.com subject='Verify your Harbaat account'`

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS Errors** | Ensure `FRONTEND_BASE_URL` in `.env` matches your browser URL exactly (ports matter). |
| **Notifications not appearing** | Ensure the Celery worker is running and the user you are mentioning is actually a member of the project's Team. |
| **Voice Matching Fail** | If the "Ready" state is never reached, check worker logs for WhisperX errors or GPU out-of-memory. |
