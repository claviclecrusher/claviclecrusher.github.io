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
  ".json" = "application/json; charset=utf-8"
  ".mp3"  = "audio/mpeg"
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
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
