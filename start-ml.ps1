# Phishing Detection ML Service Startup Script
# This uses the specific path to your Python installation found at C:\Users\Acer\AppData\Local\Programs\Python\Python313\python.exe
$PYTHON_EXE = "C:\Users\Acer\AppData\Local\Programs\Python\Python313\python.exe"
$ML_DIR = "c:\Users\Acer\OneDrive\Desktop\Project01\ml-service"

if (Test-Path $PYTHON_EXE) {
    Set-Location $ML_DIR
    Write-Host "--- Starting ML Service ---" -ForegroundColor Green
    & $PYTHON_EXE main.py
} else {
    Write-Error "Python not found at $PYTHON_EXE. Please check the path."
}
