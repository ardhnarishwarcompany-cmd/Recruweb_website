New-Item -ItemType Directory -Path "C:\Users\nitin\Desktop\Recruweb Website Updated\New folder\dist-clean" -Force | Out-Null
$source = "C:\Users\nitin\Desktop\Recruweb Website Updated\New folder\dist"
$dest = "C:\Users\nitin\Desktop\Recruweb Website Updated\New folder\dist-clean"
Get-ChildItem $source -Recurse | ForEach-Object {
    if ($_.Name -ne "nul") {
        $destPath = $_.FullName.Replace($source, $dest)
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        } else {
            $destDir = Split-Path $destPath -Parent
            if (!(Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $_.FullName -Destination $destPath -Force
        }
    }
}
Compress-Archive -Path "C:\Users\nitin\Desktop\Recruweb Website Updated\New folder\dist-clean" -DestinationPath "C:\Users\nitin\Desktop\Recruweb Website Updated\New folder\Recruweb-Deployment.zip" -Force
