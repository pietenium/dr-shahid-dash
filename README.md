# OSSEUS — 3D Skeleton Viewer

## Setup

```bash
npm create vite@latest skeleton-viewer -- --template react
cd skeleton-viewer
npm install three
cp SkeletonViewer.jsx src/
cp App.jsx src/
# Place your skeleton.glb inside: public/skeleton.glb
npm run dev
```

## File Structure

```
skeleton-viewer/
├── public/
│   └── skeleton.glb          ← your model goes here
├── src/
│   ├── App.jsx
│   └── SkeletonViewer.jsx
├── index.html
└── package.json
```

## Props

| Prop        | Type    | Default | Description                   |
| ----------- | ------- | ------- | ----------------------------- |
| `showDebug` | boolean | `false` | Shows AxesHelper + GridHelper |

## Features

- ✅ Auto-centers model via bounding **box**
- ✅ Auto-normalizes scale to ~2.2 units tall
- ✅ OrbitControls with smooth damping
- ✅ ACES filmic tone mapping + PCF soft shadows
- ✅ Raycasting: click any bone to highlight + log name
- ✅ Emissive highlight (cyan glow) on selected bone
- ✅ Full window resize handling
- ✅ Clean renderer + geometry + material disposal
- ✅ React StrictMode safe (single init guard via `destroyed` flag)
- ✅ Optional AxesHelper / GridHelper via `showDebug` prop

## Notes

- Works with any `.glb` / `.gltf` model, not just skeletons
- Model scale and centering are fully automatic
- Bone names are logged to console and shown in the UI panel
- All Three.js objects are disposed on component unmount
