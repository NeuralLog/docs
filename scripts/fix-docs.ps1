# fix-docs.ps1 - Wrapper for fix-docs.js
# Usage: .\fix-docs.ps1 [repository-path] [options]

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsScript = Join-Path $scriptPath "fix-docs.js"

node $jsScript $args
