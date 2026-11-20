# UDYOGA Cinematic Hero Video Asset Specification

To complete the cinematic video parallax background scroll-reveal in the Hero section, place the continuous MP4 video asset at:
`frontend/public/assets/video/msme_cinematic_story.mp4`

## Storyboard Progression (Continuous 10-15s Footage)
1. **0% – 20%: Financial Foundation**
   - Close-up shot of a small merchant ledger book, bills/invoices, brass counter scale, or digital calculator illuminated with warm morning sunlight.
   - Camera begins a smooth cinematic push-in.
2. **20% – 45%: Financial Activity**
   - Camera travels across the merchant desk revealing daily shop records, bills, and a UPI QR standee.
   - Natural shallow depth of field.
3. **45% – 75%: Business Operations**
   - Reveal an Indian micro-enterprise owner (artisan, textile merchant, or retail kirana owner) attending to operations, goods, and transactions.
   - Cinematic slow-motion dolly track through the store environment.
4. **75% – 100%: Business Growth & Vibrant Commerce**
   - Wide cinematic shot of a bustling Indian marketplace / business establishment bathed in warm natural lighting, fading gently into the warm ivory tone.

## Technical Requirements
- **Format**: MP4 (H.264 or H.265 / AV1) + optional WebM.
- **Resolution**: 1920x1080 (1080p) or 2560x1440.
- **Frame Rate**: 30fps or 60fps (smooth keyframes for scroll scrubbing).
- **Audio**: Muted / None (audio track removed to save bandwidth).
- **Target Size**: < 8MB with CRF 22-26 for ultra-fast instant web streaming.
- **Keyframe Interval**: 1 keyframe every 0.5s (`-g 15` in ffmpeg) for frame-accurate bidirectional scrubbing.
