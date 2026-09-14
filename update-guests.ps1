# =============================================================================
#  하객 명단 → 해시 변환 스크립트
#
#  guests.txt (평문, 커밋 안 됨) 를 읽어
#  wedding/assets/guests.json (해시만) 을 만듭니다.
#
#  이렇게 하면 GitHub 에 올라가는 건 해시뿐이라
#  소스를 봐도 명단을 읽을 수 없습니다.
#
#  사용법 (wedding-invitation 폴더에서):
#     powershell -NoProfile -ExecutionPolicy Bypass -File update-guests.ps1
# =============================================================================

param(
  [string]$Root = "wedding"
)

$ErrorActionPreference = "Stop"

$base    = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcFile = Join-Path $base "guests.txt"
$outFile = Join-Path $base "$Root/assets/guests.json"

# 반복 횟수. 높을수록 이름을 역산하기 어려워지지만 입장도 느려집니다.
# 10만 = 이 PC 기준 약 0.2초. 하객은 한 번만 겪습니다.
$ITERATIONS = 100000

if (-not (Test-Path $srcFile)) {
  Write-Host "[오류] guests.txt 가 없습니다: $srcFile" -ForegroundColor Red
  Write-Host "       한 줄에 한 명씩 적은 파일을 만들어 주세요." -ForegroundColor Red
  exit 1
}

# ── 평문 명단 읽기 ───────────────────────────────────────────────────────────
$lines = Get-Content $srcFile -Encoding UTF8
$names = @()
foreach ($line in $lines) {
  $t = $line.Trim()
  if ($t -eq "" -or $t.StartsWith("#")) { continue }
  $names += $t
}

if ($names.Count -eq 0) {
  Write-Host "[오류] guests.txt 에 이름이 하나도 없습니다." -ForegroundColor Red
  exit 1
}

# ── 이름 정규화: 공백 제거 + 소문자 (main.js 와 규칙이 같아야 합니다) ────────
function Normalize([string]$s) {
  return ($s -replace '\s', '').ToLowerInvariant()
}

# ── 소금(salt): 미리 계산해 둔 표로 역산하는 걸 막습니다 ─────────────────────
#  이미 만들어 둔 파일이 있으면 소금을 재사용해야 기존 해시와 맞습니다.
$salt = $null
if (Test-Path $outFile) {
  try {
    $old = Get-Content $outFile -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($old.salt) { $salt = $old.salt }
  } catch { }
}
if (-not $salt) {
  $bytes = New-Object byte[] 16
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $salt = [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
  Write-Host "소금을 새로 만들었습니다. (바뀌면 모든 해시가 달라집니다)" -ForegroundColor Yellow
}
$saltBytes = [System.Text.Encoding]::UTF8.GetBytes($salt)

# ── 해시 계산 ────────────────────────────────────────────────────────────────
function Get-Hash([string]$name) {
  $k = New-Object System.Security.Cryptography.Rfc2898DeriveBytes(
        $name, $saltBytes, $ITERATIONS,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256)
  try   { return [BitConverter]::ToString($k.GetBytes(32)).Replace("-", "").ToLower() }
  finally { $k.Dispose() }
}

$seen    = @{}
$hashes  = @()
$dupes   = @()

foreach ($n in $names) {
  $norm = Normalize $n
  if ($seen.ContainsKey($norm)) { $dupes += $n; continue }
  $seen[$norm] = $true
  $hashes += (Get-Hash $norm)
  Write-Host ("  + {0}" -f $n)
}

foreach ($d in $dupes) {
  Write-Host ("  ! {0} 는 중복이라 건너뜁니다." -f $d) -ForegroundColor Yellow
}

# ── guests.json 쓰기 (BOM 없는 UTF-8) ────────────────────────────────────────
$data = [ordered]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  algorithm   = "PBKDF2-SHA256"
  iterations  = $ITERATIONS
  salt        = $salt
  hashes      = $hashes
}
$json = $data | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($outFile, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("하객 {0}명의 해시를 기록했습니다." -f $hashes.Count) -ForegroundColor Green
Write-Host ("  {0}" -f $outFile) -ForegroundColor Green
Write-Host ""
Write-Host "guests.txt 는 .gitignore 에 있어 올라가지 않습니다. 이 PC 에 보관하세요." -ForegroundColor Cyan
Write-Host '웹에 반영하려면:  git add -A; git commit -m "명단 갱신"; git push'
