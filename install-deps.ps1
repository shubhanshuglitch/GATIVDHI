# Install all dependencies for GATIVIDHI
Write-Host "=== GATIVIDHI — Installing Dependencies ===" -ForegroundColor Cyan

# ML Service
Write-Host "`n[1/3] Installing ML Service (Python)..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\ml-service"
pip install -r requirements.txt

# Backend
Write-Host "`n[2/3] Installing Backend (Node.js)..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
npm install

# Frontend
Write-Host "`n[3/3] Installing Frontend (React)..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
npm install

Set-Location -Path $PSScriptRoot
Write-Host "`n=== All dependencies installed! ===" -ForegroundColor Green
Write-Host "Run '.\start-all.ps1' to start all services" -ForegroundColor Cyan
