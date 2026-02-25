# Troubleshooting Guide

## Debug Checklist for End-to-End Flow

### 1. Authentication Flow

**Verify:**
```bash
# Check backend logs
docker-compose logs backend | grep auth

# Test auth endpoint directly
curl -X POST http://localhost:8000/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data": "YOUR_INIT_DATA"}'
```

**Common Issues:**
- `Invalid Telegram initData`: Check that `TELEGRAM_BOT_TOKEN` is set correctly in `backend/.env`
- `401 Unauthorized`: Verify initData is being passed correctly from frontend
- Token not stored: Check browser localStorage for `auth_token`

**Fix:**
- Ensure `TELEGRAM_BOT_TOKEN` matches the bot token from @BotFather
- Verify `TELEGRAM_BOT_USERNAME` is set (without @)
- Check that frontend is calling `/auth/telegram` with correct payload

### 2. Form Submission Flow

**Verify:**
```bash
# Check form data normalization
# In browser console, check Network tab for POST /requests/
# Verify form_data matches backend schema:
# - goal_text (not "goal")
# - weight_kg, height_cm (not "weight", "height")
# - activity_level (not "fitness_level" for workouts)
```

**Common Issues:**
- `400 Bad Request`: Form data doesn't match backend schema
- `Anti-fraud failed`: Check backend logs for rejection reason
- Missing required fields: Verify form validation

**Fix:**
- Check `frontend/src/utils/formData.ts` - ensure normalization matches backend
- Verify form fields match normalized schema:
  - Supplements: `goal_text`, `age`, `weight_kg`, `height_cm`, `activity_level`, `allergies`, `current_supplements_or_meds`, `budget_tier`
  - Workouts: `goal_text`, `age`, `weight_kg`, `height_cm`, `activity_level`, `equipment`, `days_per_week`, `liked_activities`, `injuries_details`

### 3. Demo Answer Flow

**Verify:**
```bash
# Check request creation
curl -X GET http://localhost:8000/requests/{id}/demo \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Common Issues:**
- `404 Request not found`: Request ID doesn't exist or belongs to different user
- `Demo answer not available`: Request wasn't created successfully
- `requires_payment: true` when it shouldn't be: Check DemoUsage table

**Fix:**
- Verify request was created: Check `requests` table in database
- Check `demo_usage` table - user should have 1 demo per track
- Ensure demo answer was generated: Check `demo_answer` field in request

### 4. Full Answer Flow

**Verify:**
```bash
# Check full answer generation
curl -X POST http://localhost:8000/requests/{id}/full \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Common Issues:**
- `404 Request not found`: Request doesn't exist
- `400 Payment required`: Payment not completed (for MVP, this might be skipped)
- PDF not generated: Check `pdf_storage_path` in backend config

**Fix:**
- For MVP, backend may skip payment check - verify in `backend/app/routers/requests.py`
- Check PDF storage path exists and is writable
- Verify LLM API is working: Check backend logs for LLM errors

### 5. Trainer Referral Flow

**Verify:**
```bash
# Check trainer matching
curl -X GET "http://localhost:8000/trainers/match?request_id={id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check lead creation
curl -X POST http://localhost:8000/trainers/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trainer_id": 1, "request_id": 1}'
```

**Common Issues:**
- `404 No trainers available`: No trainers in database
- `400 Full answer required`: Request doesn't have full_answer yet
- Deep link not working: Check trainer username format

**Fix:**
- Seed trainers in database (see `backend/scripts/seed.py`)
- Ensure request has `full_answer` before matching trainer
- Verify trainer `telegram_username` is correct format (without @)

### 6. Frontend Build Issues

**Verify:**
```bash
# Check TailwindCSS is installed
cd frontend
npm list tailwindcss

# Build frontend
npm run build
```

**Common Issues:**
- `Cannot find module 'tailwindcss'`: Run `npm install` in frontend directory
- Styles not applying: Check `src/index.css` imports Tailwind directives
- Build fails: Check `tailwind.config.js` and `postcss.config.js` exist

**Fix:**
```bash
cd frontend
npm install
npm run build
```

### 7. API Client Issues

**Verify:**
```bash
# Check API base URL
# In browser console:
console.log(import.meta.env.VITE_API_URL)
```

**Common Issues:**
- `Network error`: API URL incorrect or CORS issue
- `401 Unauthorized`: Token not included in request
- `CORS error`: Backend CORS not configured for frontend domain

**Fix:**
- Set `VITE_API_URL` in `.env` or `docker-compose.yml`
- Verify token is stored in localStorage after auth
- Check backend CORS settings in `backend/app/main.py`

### 8. State Machine Issues

**Verify:**
- Check browser console for state transitions
- Verify reducer handles all action types
- Check state type matches expected format

**Common Issues:**
- State doesn't transition: Check reducer switch cases
- Type errors: Verify AppState types match reducer return types
- Navigation broken: Check GO_BACK action handles all states

**Fix:**
- Review `frontend/src/state/appState.ts` - ensure all states handled
- Check `frontend/src/ui/App.tsx` - verify dispatch calls match action types

## Quick Debug Commands

```bash
# View all logs
docker-compose logs -f

# Restart services
docker-compose restart backend frontend

# Check database
docker-compose exec postgres psql -U makemefit -d makemefit -c "SELECT * FROM requests LIMIT 5;"

# Clear Docker cache and rebuild
docker-compose build --no-cache frontend
docker-compose up -d
```

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid Telegram initData` | Wrong bot token | Check `TELEGRAM_BOT_TOKEN` in `.env` |
| `Request rejected by anti-fraud` | Form validation failed | Check form data matches schema |
| `Demo limit reached` | User already used demo | Normal behavior - requires payment |
| `No trainers available` | No trainers in DB | Seed trainers or create manually |
| `CORS error` | Backend CORS misconfigured | Update CORS in `main.py` |

## Testing Locally

1. **Start services:**
   ```bash
   cd infra
   docker-compose up -d
   ```

2. **Check health:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Test in browser:**
   - Open `http://localhost:5173` (if running locally)
   - Or use ngrok/Telegram Mini App URL
   - Open browser DevTools → Network tab
   - Complete flow and check API calls

4. **Verify database:**
   ```bash
   docker-compose exec postgres psql -U makemefit -d makemefit
   # Then run SQL queries to check data
   ```

## Production Debugging

1. **Check logs on VM:**
   ```bash
   cd /opt/makemefit/infra
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **Verify environment:**
   ```bash
   # Check .env file exists
   ls -la /opt/makemefit/backend/.env
   
   # Check API URL
   echo $VITE_API_URL
   ```

3. **Test endpoints:**
   ```bash
   curl https://api.amesin.ru/health
   ```
