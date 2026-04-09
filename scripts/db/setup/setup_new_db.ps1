param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl,

  [string]$Schema = "sama_ops",
  [string]$Workbook = "Dev Laptop Data.xlsx",

  [switch]$Reset,
  [switch]$Truncate,
  [switch]$SkipBootstrap,
  [switch]$SkipSeed,

  [string[]]$ExtraWorkbook,
  [switch]$ExtraReset,
  [switch]$ExtraTruncate
)

$scriptPath = Join-Path $PSScriptRoot "setup_new_db.py"

$argsList = @(
  $scriptPath,
  "--database-url", $DatabaseUrl,
  "--schema", $Schema,
  "--workbook", $Workbook
)

if ($Reset) { $argsList += "--reset" }
if ($Truncate) { $argsList += "--truncate" }
if ($SkipBootstrap) { $argsList += "--skip-bootstrap" }
if ($SkipSeed) { $argsList += "--skip-seed" }
if ($ExtraReset) { $argsList += "--extra-reset" }
if ($ExtraTruncate) { $argsList += "--extra-truncate" }

if ($ExtraWorkbook) {
  foreach ($wb in $ExtraWorkbook) {
    $argsList += "--extra-workbook"
    $argsList += $wb
  }
}

python @argsList
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
