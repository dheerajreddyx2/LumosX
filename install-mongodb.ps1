# Quick MongoDB Installation Script
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host " MongoDB Installation for LMS Project" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Warning: This will download ~755 MB" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Do you want to proceed? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "📥 Installing MongoDB..." -ForegroundColor Green
    winget install MongoDB.Server --accept-package-agreements --accept-source-agreements
    
    Write-Host ""
    Write-Host "🚀 Starting MongoDB service..." -ForegroundColor Green
    Start-Service MongoDB -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "✅ MongoDB installed and started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Your .env file is already configured for local MongoDB" -ForegroundColor Cyan
    Write-Host "   Connection: mongodb://localhost:27017/lms-database" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. cd backend" -ForegroundColor White
    Write-Host "   2. npm start" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Installation cancelled" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Use MongoDB Atlas (free cloud database)" -ForegroundColor Cyan
    Write-Host "   See: backend\START_BACKEND_GUIDE.txt" -ForegroundColor Gray
    Write-Host ""
}

