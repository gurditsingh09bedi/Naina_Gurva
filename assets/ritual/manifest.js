/* "The Ritual" scroll film. Each scene is one sprite sheet of 36 frames (6 x 6).
   -d = desktop (16:9 frames), -m = phone (9:16 frames cropped on the subject).
   Footage: Mixkit free stock video licence. */
window.RITUAL = {
  cols: 6, rows: 6, count: 36,
  desk: { fw: 800, fh: 450 },
  mob: { fw: 360, fh: 640 },
  chapters: [1, 2, 3, 4, 5, 6].map((n) => ({ d: "assets/ritual/c" + n + "-d.jpg", m: "assets/ritual/c" + n + "-m.jpg" }))
};
