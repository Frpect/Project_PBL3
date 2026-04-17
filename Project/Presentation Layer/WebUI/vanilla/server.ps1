$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3456/")
$listener.Start()
Write-Host "Server running on http://localhost:3456"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path "e:\dev2026\Project\Project\Presentation Layer\WebUI\vanilla" $path.Replace("/","\")
    if (Test-Path $file) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file)
        $types = @{
            ".html" = "text/html;charset=utf-8"
            ".css"  = "text/css;charset=utf-8"
            ".js"   = "application/javascript;charset=utf-8"
            ".png"  = "image/png"
            ".jpg"  = "image/jpeg"
            ".svg"  = "image/svg+xml"
        }
        if ($types[$ext]) {
            $ctx.Response.ContentType = $types[$ext]
        } else {
            $ctx.Response.ContentType = "application/octet-stream"
        }
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
}
