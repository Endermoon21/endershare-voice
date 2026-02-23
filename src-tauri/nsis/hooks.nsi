!macro NSIS_HOOK_POSTINSTALL
  ; Copy WebView2Loader.dll from resources to install root
  CopyFiles "$INSTDIR\resources\WebView2Loader.dll" "$INSTDIR\WebView2Loader.dll"
!macroend
