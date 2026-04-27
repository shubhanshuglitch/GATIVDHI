# Start all GATIVIDHI services
Write-Host "=== GATIVIDHI — Starting All Services ===" -ForegroundColor Cyan

# ML Service
Write-Host "`n[1/3] Starting ML Service on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -WorkingDirectory "$PSScriptRoot\ml-service" -WindowStyle Normal

Start-Sleep -Seconds 2

# Backend
Write-Host "[2/3] Starting Backend on port 5000..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal

Start-Sleep -Seconds 2

# Frontend
Write-Host "[3/3] Starting Frontend on port 5173..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "`n=== All services started! ===" -ForegroundColor Green
Write-Host "Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "ML Service: http://localhost:8000" -ForegroundColor White
