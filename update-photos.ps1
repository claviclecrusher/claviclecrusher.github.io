# =============================================================================
#  사진 목록 갱신 스크립트
#
#  wedding/assets/img/ 폴더를 훑어서 manifest.json 을 다시 만듭니다.
#  사진을 넣거나 뺀 뒤 이 스크립트만 실행하면 청첩장에 그대로 반영됩니다.
#
#  사용법 (wedding-invitation 폴더에서):
#     powershell -NoProfile -ExecutionPolicy Bypass -File update-photos.ps1
# =============================================================================

param(
  [string]$Root = "wedding"
)

$ErrorActionPreference = "Stop"

# 스크립트 위치 기준으로 경로를 잡아, 어디서 실행하든 동작하게 한다
$base    = Split-Path -Parent $MyInvocation.MyCommand.Path
$imgDir  = Join-Path $base "$Root/assets/img"
$galDir  = Join-Path $imgDir "gallery"
$outFile = Join-Path $imgDir "manifest.json"

if (-not (Test-Path $imgDir)) {
  Write-Host "[오류] 사진 폴더를 찾을 수 없습니다: $imgDir" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path $galDir)) {
  New-Item -ItemType Directory -Path $galDir | Out-Null
  Write-Host "[안내] gallery 폴더를 새로 만들었습니다." -ForegroundColor Yellow
}

# 브라우저가 표시할 수 있는 형식만
$webExt   = @(".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg")
# 아이폰 기본 형식 등 — 브라우저가 못 여는 것들
$badExt   = @(".heic", ".heif", ".tif", ".tiff", ".bmp", ".raw", ".dng", ".cr2", ".nef")

# "사진2" 가 "사진10" 보다 앞에 오도록 숫자를 0 으로 채워 정렬한다
function Get-SortKey([string]$name) {
  return [regex]::Replace($name.ToLower(), '\d+', { param($m) $m.Value.PadLeft(10, '0') })
}

function Format-Size([long]$bytes) {
  if ($bytes -ge 1MB) { return "{0:N1}MB" -f ($bytes / 1MB) }
  return "{0:N0}KB" -f ($bytes / 1KB)
}

# ── 표지 사진: assets/img/cover.* ────────────────────────────────────────────
$cover = Get-ChildItem -Path $imgDir -File |
         Where-Object { $_.BaseName -eq "cover" -and $webExt -contains $_.Extension.ToLower() } |
         Select-Object -First 1

$coverPath = $null
if ($cover) {
  $coverPath = "assets/img/" + $cover.Name
  Write-Host ("표지  : {0}  ({1})" -f $cover.Name, (Format-Size $cover.Length)) -ForegroundColor Cyan
} else {
  Write-Host "표지  : 없음 — assets/img/ 에 cover.jpg 를 넣어주세요" -ForegroundColor Yellow
}

# ── 갤러리 사진: assets/img/gallery/ 안의 모든 이미지 ────────────────────────
$all = Get-ChildItem -Path $galDir -File
$photos = $all | Where-Object { $webExt -contains $_.Extension.ToLower() } |
          Sort-Object { Get-SortKey $_.Name }

$gallery = @()
$totalBytes = 0
foreach ($p in $photos) {
  $gallery += "assets/img/gallery/" + $p.Name
  $totalBytes += $p.Length
  $size = Format-Size $p.Length
  if ($p.Length -gt 500KB) {
    Write-Host ("  + {0}  ({1})  ← 용량이 큽니다. 300KB 이하 권장" -f $p.Name, $size) -ForegroundColor Yellow
  } else {
    Write-Host ("  + {0}  ({1})" -f $p.Name, $size)
  }
}

# ── 브라우저가 못 여는 형식 경고 ─────────────────────────────────────────────
$skipped = $all | Where-Object { $badExt -contains $_.Extension.ToLower() }
foreach ($s in $skipped) {
  Write-Host ("  ! {0} 는 브라우저가 열지 못해 건너뜁니다. jpg 로 변환해 주세요." -f $s.Name) -ForegroundColor Red
}

# ── manifest.json 쓰기 (BOM 없는 UTF-8 이어야 브라우저가 읽습니다) ───────────
$manifest = [ordered]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  cover       = $coverPath
  gallery     = $gallery
}
$json = $manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($outFile, $json, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("갤러리 {0}장, 합계 {1}" -f $gallery.Count, (Format-Size $totalBytes)) -ForegroundColor Green
Write-Host ("기록됨: {0}" -f $outFile) -ForegroundColor Green
Write-Host ""
Write-Host '웹에 반영하려면:  git add -A; git commit -m "사진 교체"; git push'
