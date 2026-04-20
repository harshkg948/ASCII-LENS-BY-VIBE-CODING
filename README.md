<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b6b38a9d-33e5-4140-8ad5-1b25a4c16a0b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# ASCII Lens (ASCII.CAM) 🎥✨

ASCII Lens is a full-stack React application that transforms your live webcam feed into dynamic **terminal-style ASCII art** in real-time. It blends retro aesthetics with modern browser APIs to create a futuristic diagnostic display experience.

## 🚀 Features

* 🎥 Real-time webcam to ASCII conversion
* 🖥️ Multiple glyph modes:

  * Standard
  * Blocks
  * Binary
  * Minimal Dots
* 🎛️ Adjustable controls:

  * Density
  * Contrast
  * Brightness
* ⚡ Smooth rendering using `requestAnimationFrame()`
* 💚 Retro terminal-inspired UI
* 📱 Responsive layout

## 🛠️ Tech Stack

* React.js
* Tailwind CSS
* JavaScript
* HTML5 Canvas API
* Web Camera API (`getUserMedia`)

## ⚙️ How It Works

1. Accesses your webcam using `getUserMedia()`
2. Draws frames onto a hidden canvas
3. Reads pixel brightness using `getImageData()`
4. Maps brightness values to ASCII characters
5. Renders animated ASCII output in real-time

## 📦 Installation

```bash
git clone https://github.com/yourusername/ascii-lens.git
cd ascii-lens
npm install
npm run dev
```

## 🌐 Usage

1. Allow camera permissions
2. Adjust density / contrast / brightness
3. Switch glyph styles
4. Enjoy your live ASCII feed 😎

## 📸 Preview

Add screenshots / GIF here.

## 💡 Future Improvements

* 🎨 Color ASCII mode
* 📷 Snapshot / recording export
* 🌙 More themes
* 🔊 Audio reactive mode
* ⚡ Web Worker optimization

## 🤝 Contributing

Pull requests are welcome. Ideas and feedback are appreciated.

## 📄 License

MIT License

---

Built with creativity, frontend engineering, and vibe coding energy ⚡
