<#
.SYNOPSIS
    Publishes all three Travel Planner services, assembles a Service Fabric application
    package, and deploys it to the local 1-node dev cluster.

.DESCRIPTION
    No .sfproj / Visual Studio required. This does by hand what a .sfproj's Build+Deploy
    targets would otherwise do, using plain `dotnet publish` and the ServiceFabricSDK
    PowerShell module (installed with the SDK). Safe to re-run: an existing application
    instance/type is removed first (simplest workflow for local dev, matching the
    "remove and redeploy" pattern documented in docs/architecture.md).

.PARAMETER Configuration
    Build configuration to publish. Defaults to Debug for local dev.
#>
param(
    [string]$Configuration = "Debug"
)

$ErrorActionPreference = "Stop"

# The ServiceFabric PowerShell module's cmdlets (Connect-ServiceFabricCluster etc.) P/Invoke into
# FabricCommon.dll, which isn't on PATH by default even after SDK/runtime install - only a shell
# started fresh after install tends to pick it up. Add it explicitly so this script works from any
# shell.
$fabricCodePath = "C:\Program Files\Microsoft Service Fabric\bin\Fabric\Fabric.Code"
if ((Test-Path $fabricCodePath) -and ($env:Path -notlike "*$fabricCodePath*")) {
    $env:Path = "$fabricCodePath;$env:Path"
}
Import-Module ServiceFabric -Force

$backendRoot = Split-Path -Parent $PSScriptRoot
$appPackageRoot = Join-Path $backendRoot "ApplicationPackageRoot"
$applicationTypeName = "TravelPlannerAppType"
$applicationTypeVersion = "1.0.0"
$applicationName = "fabric:/TravelPlannerApp"

$services = @(
    @{ Project = "Identity.Service"; Pkg = "Identity.ServicePkg" },
    @{ Project = "TripPlanning.Service"; Pkg = "TripPlanning.ServicePkg" },
    @{ Project = "Sharing.Service"; Pkg = "Sharing.ServicePkg" }
)

Write-Host "=== 1. Publishing services ($Configuration) ===" -ForegroundColor Cyan
foreach ($svc in $services) {
    $projectPath = Join-Path $backendRoot "src\$($svc.Project)\$($svc.Project).csproj"
    $codeOut = Join-Path $appPackageRoot "$($svc.Pkg)\Code"

    if (Test-Path $codeOut) {
        Remove-Item $codeOut -Recurse -Force
    }

    Write-Host "  Publishing $($svc.Project) -> $codeOut"
    dotnet publish $projectPath -c $Configuration -o $codeOut --self-contained false
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet publish failed for $($svc.Project)"
    }
}

Write-Host "=== 2. Connecting to local Service Fabric cluster ===" -ForegroundColor Cyan
Connect-ServiceFabricCluster | Out-Null

Write-Host "=== 3. Removing any existing application/type (clean redeploy) ===" -ForegroundColor Cyan
$existingApp = Get-ServiceFabricApplication -ApplicationName $applicationName -ErrorAction SilentlyContinue
if ($existingApp) {
    Write-Host "  Removing existing application $applicationName"
    Remove-ServiceFabricApplication -ApplicationName $applicationName -Force | Out-Null
}
$existingType = Get-ServiceFabricApplicationType -ApplicationTypeName $applicationTypeName -ErrorAction SilentlyContinue
if ($existingType) {
    Write-Host "  Unregistering existing application type $applicationTypeName $applicationTypeVersion"
    Unregister-ServiceFabricApplicationType -ApplicationTypeName $applicationTypeName -ApplicationTypeVersion $applicationTypeVersion -Force | Out-Null
}

Write-Host "=== 4. Copying application package to the cluster's image store ===" -ForegroundColor Cyan
Copy-ServiceFabricApplicationPackage -ApplicationPackagePath $appPackageRoot -ApplicationPackagePathInImageStore $applicationTypeName

Write-Host "=== 5. Registering application type ===" -ForegroundColor Cyan
Register-ServiceFabricApplicationType -ApplicationPathInImageStore $applicationTypeName

Write-Host "=== 6. Creating application instance ===" -ForegroundColor Cyan
New-ServiceFabricApplication -ApplicationName $applicationName -ApplicationTypeName $applicationTypeName -ApplicationTypeVersion $applicationTypeVersion

Write-Host ""
Write-Host "Deployed. Check Service Fabric Explorer: http://localhost:19080" -ForegroundColor Green
Write-Host "Services are reachable through the reverse proxy at:" -ForegroundColor Green
Write-Host "  http://localhost:19081/TravelPlannerApp/IdentityService/api/health"
Write-Host "  http://localhost:19081/TravelPlannerApp/TripPlanningService/api/health"
Write-Host "  http://localhost:19081/TravelPlannerApp/SharingService/api/health"
