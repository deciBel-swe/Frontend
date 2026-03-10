# Root app directory
$root = "src/app"

# Create directories
$dirs = @(
    "$root",
    "$root/(feed)/discover",
    "$root/(feed)/charts",
    "$root/(feed)/feed",

    "$root/(search)/search/sets",
    "$root/(search)/search/albums",
    "$root/(search)/search/people",
    "$root/(search)/search/sounds",

    "$root/(you)/you/library",
    "$root/(you)/you/likes",
    "$root/(you)/you/sets",
    "$root/(you)/you/albums",
    "$root/(you)/you/following",
    "$root/(you)/you/history",
    "$root/(you)/you/stations",
    "$root/(you)/you/insights",
    "$root/(you)/people",

    "$root/(social)/messages/[messageId]",
    "$root/(social)/notifications",

    "$root/(creator)/artists/distribution",
    "$root/(creator)/artists/vinyl",
    "$root/(creator)/upload",
    "$root/(creator)/(checkout)/artist",

    "$root/settings/content",
    "$root/settings/notifications",
    "$root/settings/privacy",
    "$root/settings/advertising",
    "$root/settings/two-factor",

    "$root/[username]/tracks",
    "$root/[username]/albums",
    "$root/[username]/sets",
    "$root/[username]/reposts",
    "$root/[username]/popular-tracks",
    "$root/[username]/[trackSlug]",

    "$root/(legal)/pages/[slug]",
    "$root/download",
    "$root/signin"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

foreach ($file in $files) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
    }
}

Write-Host "✅ Folder structure created successfully."