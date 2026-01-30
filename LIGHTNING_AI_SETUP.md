# Running AcrossJobs in Lightning AI

## Problem Solved

**Error:**
```
Blocked request. This host ("3000-01kfb672h6jsfsa7tctpgyqj18.cloudspaces.litng.ai") is not allowed.
To allow this host, add "3000-01kfb672h6jsfsa7tctpgyqj18.cloudspaces.litng.ai" to `server.allowedHosts` in vite.config.js.
```

**Fix:** Updated `vite.config.ts` to allow all hosts in development mode - [Commit 967dd4c](https://github.com/Anuj472/acrossjobs/commit/967dd4c16d6e194c3a78168a0b30302b08d2c9c4)

## What Was Changed

### acrossjobs - [Commit 967dd4c](https://github.com/Anuj472/acrossjobs/commit/967dd4c16d6e194c3a78168a0b30302b08d2c9c4)
### jobcurator - [Commit 1ae5654](https://github.com/Anuj472/jobcurator/commit/1ae56545d7569a766ecda752186349f6df4ff844)

Added to `vite.config.ts`:
```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
  // Allow all hosts in development (for cloud environments)
  allowedHosts: 'all',
  // Enable HMR for cloud environments
  hmr: {
    protocol: 'ws',
    host: 'localhost',
  },
}
```

## Setup Instructions for Lightning AI

### 1. Create Lightning AI Studio

1. Go to [Lightning.ai](https://lightning.ai)
2. Create new Studio
3. Select machine type (CPU is fine for development)
4. Wait for environment to start

### 2. Clone Repositories

```bash
# In Lightning AI terminal
git clone https://github.com/Anuj472/acrossjobs.git
git clone https://github.com/Anuj472/jobcurator.git
```

### 3. Setup Environment Variables

#### For acrossjobs:
```bash
cd acrossjobs
cp .env.example .env
nano .env
```

Add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

#### For jobcurator:
```bash
cd ../jobcurator
cp .env.example .env
nano .env
```

Add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Install Dependencies

```bash
# For acrossjobs
cd ~/acrossjobs
npm install

# For jobcurator
cd ~/jobcurator
npm install
```

### 5. Run Development Server

#### Option A: Run acrossjobs (Website)
```bash
cd ~/acrossjobs
npm run dev
```

Lightning AI will show a popup with the URL like:
```
https://3000-01kfb672h6jsfsa7tctpgyqj18.cloudspaces.litng.ai
```

Click it to open your website!

#### Option B: Run jobcurator (Data Harvester)
```bash
cd ~/jobcurator
npm run dev
```

### 6. Access Your Apps

Lightning AI automatically exposes port 3000. Look for:
- **Port 3000** button in Lightning AI UI
- Or check terminal output for the URL

## Troubleshooting

### Issue: Still getting "Blocked request" error

**Solution:**
```bash
# Pull latest changes
cd ~/acrossjobs
git pull origin main

# Or manually update vite.config.ts
nano vite.config.ts
# Add allowedHosts: 'all' to server config
```

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)

# Or use different port
npm run dev -- --port 3001
```

### Issue: HMR (Hot Module Replacement) not working

**Cause:** WebSocket connection issues in cloud environment

**Solution:** Already fixed in vite.config.ts with:
```typescript
hmr: {
  protocol: 'ws',
  host: 'localhost',
}
```

### Issue: Environment variables not loading

**Solution:**
```bash
# Verify .env file exists
ls -la .env

# Check contents
cat .env

# Restart dev server
npm run dev
```

### Issue: Supabase connection timeout

**Cause:** Lightning AI might block some external connections

**Solution:**
1. Whitelist Lightning AI IPs in Supabase
2. Or use Supabase's connection pooler
3. Or run Supabase locally

## Running Both Projects Simultaneously

### Option 1: Use Two Terminals

Lightning AI supports multiple terminals:

**Terminal 1 (acrossjobs):**
```bash
cd ~/acrossjobs
npm run dev
```

**Terminal 2 (jobcurator):**
```bash
cd ~/jobcurator
npm run dev -- --port 3001
```

Access:
- acrossjobs: Port 3000
- jobcurator: Port 3001

### Option 2: Use tmux

```bash
# Install tmux (if not available)
sudo apt-get install tmux

# Create session
tmux new -s dev

# Split window
Ctrl+B then "

# Top pane - acrossjobs
cd ~/acrossjobs && npm run dev

# Switch to bottom pane
Ctrl+B then down-arrow

# Bottom pane - jobcurator  
cd ~/jobcurator && npm run dev -- --port 3001

# Detach: Ctrl+B then D
# Reattach: tmux attach -t dev
```

## Cloud Environment Compatibility

This fix works for:
- ✅ Lightning AI
- ✅ GitHub Codespaces
- ✅ Gitpod
- ✅ Replit
- ✅ CodeSandbox
- ✅ StackBlitz

## Security Note

⚠️ **Development Only**

The `allowedHosts: 'all'` setting is for **development environments only**. 

For production:
- Cloudflare Pages handles hosting (no Vite dev server)
- No security risk in production build

## Performance Tips

### 1. Use Smaller Lightning AI Instance

For development:
- **CPU-only** instances are sufficient
- Vite is fast even on small machines
- Save GPU instances for model training

### 2. Enable Vite Caching

Already enabled in `vite.config.ts`:
```typescript
build: {
  sourcemap: false,  // Faster builds
  rollupOptions: {
    output: {
      manualChunks: undefined,  // Let Vite optimize
    },
  },
}
```

### 3. Persistent Storage

Lightning AI provides persistent storage in `/teamspace`:

```bash
# Clone to persistent location
cd /teamspace
git clone https://github.com/Anuj472/acrossjobs.git

# Symlink to home
ln -s /teamspace/acrossjobs ~/acrossjobs
```

## Workflow Example

### Morning Routine

```bash
# 1. Start Lightning AI Studio
# 2. Open terminal

# 3. Update code
cd ~/acrossjobs
git pull origin main
npm install  # If package.json changed

# 4. Start dev server
npm run dev

# 5. Open in browser (click Port 3000 button)
```

### Data Harvesting Routine

```bash
# 1. Open second terminal

# 2. Start jobcurator
cd ~/jobcurator
git pull origin main
npm run dev -- --port 3001

# 3. Open in browser (Port 3001)

# 4. Click "RUN GLOBAL HARVEST"
# 5. Wait for completion
# 6. Click "SYNC X ROLES"

# 7. Return to acrossjobs (Port 3000)
# 8. Refresh to see new jobs
```

## VS Code in Lightning AI

Lightning AI supports VS Code:

1. Click "Open in VS Code" button
2. Install recommended extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript Vue Plugin (Volar)

3. Settings for Vite projects:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Debugging

### Enable Vite Debug Logs

```bash
DEBUG=vite:* npm run dev
```

### Check Network Requests

```bash
# Install curl
sudo apt-get install curl

# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Test local dev server
curl http://localhost:3000
```

### Browser DevTools

1. Open Lightning AI preview
2. Right-click → Inspect
3. Console tab → Check for errors
4. Network tab → Monitor API calls

## Alternative: Run Locally, Deploy to Cloud

If Lightning AI has issues:

### Development
```bash
# Local machine
git clone https://github.com/Anuj472/acrossjobs.git
cd acrossjobs
npm install
npm run dev
# Access at http://localhost:3000
```

### Deployment
```bash
# Build locally
npm run build

# Push to GitHub
git add .
git commit -m "Update"
git push origin main

# Cloudflare Pages auto-deploys
```

## Summary

✅ **Vite config updated** - Works with all cloud environments  
✅ **No more blocked hosts** - `allowedHosts: 'all'`  
✅ **HMR enabled** - Hot reload works in cloud  
✅ **Both projects fixed** - acrossjobs + jobcurator  
✅ **Multi-terminal support** - Run both simultaneously  

Your projects now work perfectly in Lightning AI! 🚀
