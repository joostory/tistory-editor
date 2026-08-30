#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "🔨 Building development binary..."
cargo build

APP_DIR="$DIR/target/debug/TistoryEditorDev.app"
MACOS_DIR="$APP_DIR/Contents/MacOS"
RESOURCES_DIR="$APP_DIR/Contents/Resources"

mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

echo "📦 Creating development app bundle at: $APP_DIR"
cp "$DIR/target/debug/tistory-editor" "$MACOS_DIR/tistory-editor"

cat << 'EOF' > "$APP_DIR/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>tistory-editor</string>
    <key>CFBundleIdentifier</key>
    <string>net.joostory.tistory-editor.gpui</string>
    <key>CFBundleName</key>
    <string>TistoryEditor (GPUI Dev)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>Tistory Editor Callback</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>tistory-editor</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
EOF

echo "🔗 Registering tistory-editor:// scheme to development app in LaunchServices..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DIR"

echo "✅ Registered! You can now open $APP_DIR or continue running cargo run."
