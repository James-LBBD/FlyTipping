# Troubleshooting Package Installation

## Common Issues and Fixes

## Issue 1: React 19 peer dependency conflict with react-leaflet
**Fixed:** Downgraded to React 18.3.1 (stable and compatible with all packages)

react-leaflet doesn't support React 19 yet, so we use React 18 which works perfectly with Next.js 15.

### Issue 2: @azure/openai version conflict
**Solution:** Updated package.json to use beta version that's compatible with @azure/identity

### Issue 2: React 19 compatibility
**Solution:** Locked to exact versions (removed ^ prefix)

### Issue 3: Node version mismatch
**Solution:** Ensure you're using Node.js 18+ or 20+
```cmd
node --version
```
If needed, install Node.js 20 LTS from: https://nodejs.org/

### Issue 4: npm cache issues
**Solution:** Clear cache and retry
```cmd
npm cache clean --force
npm install
```

### Issue 5: Package conflicts
**Solution:** Delete node_modules and package-lock.json
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue 6: Network/registry issues
**Solution:** Use different registry or clear SSL
```cmd
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
npm install
```

## Alternative: Use Yarn
If npm continues to fail, try Yarn:
```cmd
npm install -g yarn
yarn install
```

## Minimal Installation
If all else fails, install only core packages first:
```cmd
npm install next@15.1.4 react@19.0.0 react-dom@19.0.0 typescript@5.7.2
npm install @azure/identity@4.5.0
npm install tailwindcss@3.4.17 postcss@8.4.49 autoprefixer@10.4.20 --save-dev
```

Then add the rest:
```cmd
npm install leaflet@1.9.4 react-leaflet@4.2.1 sharp@0.33.5 exifr@7.1.3
npm install @types/node@22.10.2 @types/react@19.0.1 @types/react-dom@19.0.2 --save-dev
```

## Updated package.json
The package.json has been updated with:
- Exact version numbers (no ^ or ~)
- Compatible Azure OpenAI beta version
- Added browser-image-compression
- Added overrides for dependency resolution

Try running setup.bat again or:
```cmd
npm install
```
