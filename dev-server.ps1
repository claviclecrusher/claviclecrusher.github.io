param(
  [string]$Root = ".",
  [int]$Port = 5599
)

$Root = (Resolve-Path $Root).Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "serving $Root at http://localhost:$Port/"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".avif" = "image/avif"
  ".gif"  = "image/gif"
  ".ico"  = "image/x-icon"
  ".json" = "application/json; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
  ".mp3"  = "audio/mpeg"
  ".m4a"  = "audio/mp4"
  ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()

    # 이 서버는 한 번에 한 요청만 처리한다. keep-alive 를 켜두면 브라우저가
    # 연결을 붙잡고 있어 갤러리처럼 이미지를 여러 장 동시에 부를 때 멈춘다.
    $ctx.Response.KeepAlive = $false
    # 수정한 내용이 바로 보이도록 캐시도 끈다
    $ctx.Response.Headers.Add("Cache-Control", "no-store")

    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $path = Join-Path $Root $rel
    if (Test-Path $path -PathType Container) { $path = Join-Path $path "index.html" }

    if (Test-Path $path -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" })
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "200 $rel"
    } else {
      $ctx.Response.StatusCode = 404
      Write-Host "404 $rel"
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    Write-Host "ERR $_"
  }
}
