# Repairs the .claude/{skills,rules,hooks} links on Windows.
#
# In git these are symlinks to ../.agents/{skills,rules,hooks}. On Windows, git only creates
# real symlinks when core.symlinks=true AND the user may create symlinks (Developer Mode or
# admin). Otherwise each one is checked out as a small text file containing the target path,
# and Claude Code finds no skills, rules or hooks.
#
# This script replaces each such text file with a directory junction (no admin rights needed)
# and tells git to ignore the local difference. Safe to run more than once.
#
# Usage, from the repo root in PowerShell:
#   powershell -ExecutionPolicy Bypass -File scripts\link-agents-windows.ps1

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

foreach ($name in 'skills', 'rules', 'hooks') {
    $link   = Join-Path $repo ".claude\$name"
    $target = Join-Path $repo ".agents\$name"

    if (-not (Test-Path $target -PathType Container)) {
        Write-Warning "Skipping .claude\$name: target .agents\$name does not exist."
        continue
    }

    $item = Get-Item -LiteralPath $link -Force -ErrorAction SilentlyContinue
    if ($item -and $item.PSIsContainer) {
        # Already a real symlink, a junction or a folder: nothing to do.
        Write-Host ".claude\$name already points to a folder ($($item.LinkType)); leaving it."
        continue
    }

    if ($item) {
        # A plain file: the symlink checked out as text. Remove it.
        Remove-Item -LiteralPath $link -Force
    }

    New-Item -ItemType Junction -Path $link -Target $target | Out-Null
    # git still records a symlink here; stop it reporting the junction as a change.
    git update-index --skip-worktree ".claude/$name"
    Write-Host "Linked .claude\$name -> .agents\$name (junction)."
}

Write-Host "Done. Edit skills, rules and hooks in .agents\ only."
