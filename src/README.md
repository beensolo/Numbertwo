# Numbertwo
# Three.js FPS Scene with Clickable 3D Model

This project is a custom 3D interactive experience built using Three.js and Vite. It includes:

- Click-and-drag camera movement
- Scroll wheel zoom
- A 3D model with UV mapping
- A clickable 3D model that acts as a button and links to another page
- Responsive layout for desktop and mobile
- Deployment using Vercel with a custom domain

## Technologies Used

- Three.js
- GLTFLoader
- Vite
- Vanilla JavaScript (ES Modules)
- Vercel for deployment

## Live Demo

Visit the deployed site at: https://your-custom-domain.com  
(Replace this link with your actual domain)

## File Structure

public/  
  ptruck.glb                - The 3D model  
  honk1.mp3                 - Optional click sound  
  red_crosshair.png         - Optional asset

src/  
  main.js                   - Main Three.js code  
  style.css                 - Styling and canvas settings

index.html                  - HTML entry point

## Features

- Drag the mouse to rotate the camera
- Use the scroll wheel to zoom in and out (zoom range is clamped)
- The truck model is clickable and redirects to a specified URL
- Model is UV mapped and rendered with lighting
- Works on both mobile and desktop browsers
- Optional loading screen is hidden after the model is loaded

## Development

To run the project locally:

npm install  
npm run dev

To deploy:

git add .  
git commit -m "Deploy"  
git push

Vercel will automatically detect the changes and redeploy.

## Notes

- Ensure 3D models are exported with UV mapping (e.g. from Blender) in .glb format
- All assets should be placed in the /public directory
- Camera movement is clamped to maintain a grounded viewing angle
- Raycasting is used to detect interaction with the truck model

## License

MIT License
