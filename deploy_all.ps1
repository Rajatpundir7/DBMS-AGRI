<#
deploy_all.ps1

Usage:
  - Set environment variables (in PowerShell session) before running:
      $env:VERCEL_TOKEN = '<your_vercel_token>'
      $env:RENDER_API_KEY = '<your_render_api_key>'     # optional
      $env:MONGODB_URI = '<your_mongo_uri>'            # optional (for Render env)
      $env:JWT_SECRET = '<your_jwt_secret>'            # optional (for Render env)
      $env:MANDI_API_KEY = '<mandi_key>'               # optional

  - Run:
      powershell -ExecutionPolicy Bypass -File .\deploy_all.ps1

Notes:
  - The script will deploy the frontend using Vercel CLI and the provided VERCEL_TOKEN.
  - It will attempt a best-effort Render API call to create a backend web service using the repo and the `backend` root if RENDER_API_KEY is set.
  - Creating a Render service via API may require additional permissions; if it fails, follow the Render dashboard steps printed by the script.
  - This script does not store secrets in files and reads tokens from environment variables only.
#>

function Write-Ok($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# 1) Preconditions
Write-Host "Starting automated deploy helper..."
$cwd = Get-Location
# Check git remote
try {
    $origin = git remote get-url origin 2>$null
} catch {
    $origin = $null
}
if (-not $origin) {
    Write-Warn "No remote 'origin' found. Please ensure this repo has a GitHub remote pointing to your repository."
} else {
    Write-Ok "Git remote origin: $origin"
}

# 2) Vercel deploy (frontend)
if (-not $env:VERCEL_TOKEN) {
    Write-Warn "Environment variable VERCEL_TOKEN is not set. Frontend deploy will be skipped."
} else {
    Write-Host "\nDeploying frontend to Vercel..."
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Warn "Vercel CLI not found. Installing globally (may require admin rights)..."
        npm install -g vercel
        if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
            Write-Err "Vercel CLI install failed. Install manually from https://vercel.com/download and retry."
            exit 1
        }
    }

    Push-Location -Path "frontend"
    try {
        # run vercel and capture output
        $vercelArgs = "--token $env:VERCEL_TOKEN --prod --confirm"
        Write-Host "Running: vercel $vercelArgs"
        $out = vercel $vercelArgs 2>&1
        $out | ForEach-Object { Write-Host $_ }

        # try to parse the URL from output (best effort)
        $match = ($out | Select-String -Pattern 'https?://[\w\.-]+\.vercel\.app' -AllMatches).Matches
        if ($match.Count -gt 0) {
            $vercelUrl = $match[0].Value
            Write-Ok "Frontend deployed to: $vercelUrl"
        } else {
            Write-Warn "Could not parse Vercel URL from CLI output. Check vercel dashboard or the output above."
        }
    } catch {
        Write-Err "Vercel deploy failed: $_"
    } finally {
        Pop-Location
    }
}

# 3) Render backend deploy (best-effort using Render API)
if (-not $env:RENDER_API_KEY) {
    Write-Warn "Environment variable RENDER_API_KEY not set. Skipping Render API deploy attempt."
    Write-Host "Follow the Render dashboard steps to create a new Web Service using repo: $origin"
    Write-Host " - Root directory: backend"
    Write-Host " - Build command: npm install"
    Write-Host " - Start command: npm run start"
    Write-Host " - Add env vars: MONGODB_URI, JWT_SECRET, MANDI_API_KEY (if used)"
} else {
    Write-Host "\nAttempting to create/update Render service via API (best-effort)..."

    if (-not $origin) {
        Write-Err "Cannot determine repository origin URL. Render API requires repo info. Aborting Render API call."
    } else {
        # derive repo slug like owner/name from git remote url
        $repoSlug = $null
        if ($origin -match 'github.com[:/](?<slug>[^/]+/[^/.]+)') { $repoSlug = $Matches['slug'] }
        if (-not $repoSlug) { Write-Warn "Could not parse GitHub repo slug from origin: $origin" }

        $serviceName = "kisan-sewa-kendra-backend"
        $payload = @{
            name = $serviceName
            repository = @{ provider = "github"; name = $repoSlug }
            branch = "main"
            root = "backend"
            env = "node"
            buildCommand = "npm install"
            startCommand = "npm run start"
            autoDeploy = $true
        }

        # include env vars if provided
        $envVars = @()
        if ($env:MONGODB_URI) { $envVars += @{key='MONGODB_URI'; value=$env:MONGODB_URI} }
        if ($env:JWT_SECRET) { $envVars += @{key='JWT_SECRET'; value=$env:JWT_SECRET} }
        if ($env:MANDI_API_KEY) { $envVars += @{key='MANDI_API_KEY'; value=$env:MANDI_API_KEY} }
        if ($envVars.Count -gt 0) { $payload.envVars = $envVars }

        $json = $payload | ConvertTo-Json -Depth 6

        $headers = @{ Authorization = "Bearer $env:RENDER_API_KEY"; 'Content-Type' = 'application/json' }
        $url = 'https://api.render.com/v1/services'
        try {
            Write-Host "POST $url`n$json"
            $resp = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $json -ErrorAction Stop
            Write-Ok "Render API response received. Service may have been created/queued."
            Write-Host (ConvertTo-Json $resp -Depth 4)
            if ($resp.service && $resp.service.liveUrl) { Write-Ok "Backend live URL: $($resp.service.liveUrl)" }
        } catch {
            Write-Err "Render API call failed: $_.Exception.Message"
            Write-Host "If this fails, create the service via the Render dashboard: https://dashboard.render.com/blueprint/new"
        }
    }
}

Write-Host "\nFinished. If Vercel and Render reported success, open the provided URLs on your mobile." 
Write-Host "If any step failed, copy the output above and share it so I can help diagnose." 

# End of script
