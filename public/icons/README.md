# PWA Icon Placeholders

## Required Icons

The PWA requires the following icon sizes:
- icon-192x192.png
- icon-256x256.png
- icon-512x512.png
- icon-maskable.png (512x512 with safe zone)

## Temporary Solution

Until proper icons are created, you can:

1. **Use an online icon generator:**
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

2. **Create simple placeholder icons:**
   - Use any image editor
   - Create 512x512 PNG with your logo/icon
   - Resize to other required sizes

3. **Quick command-line solution (if ImageMagick installed):**
   ```cmd
   convert logo.png -resize 192x192 icon-192x192.png
   convert logo.png -resize 256x256 icon-256x256.png
   convert logo.png -resize 512x512 icon-512x512.png
   convert logo.png -resize 512x512 icon-maskable.png
   ```

## For Development

The app will work without icons, but the PWA installation will look better with them.

## Recommended Design

- Use the 🗑️ emoji or fly-tipping related imagery
- LBBD branding/colors
- Clear, simple design that works at all sizes
- Maskable icons should have important content in the center "safe zone"
