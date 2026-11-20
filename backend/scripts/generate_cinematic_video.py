import cv2
import numpy as np
import math
import os

def create_cinematic_msme_video():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 10
    total_frames = fps * duration_sec
    output_path = os.path.join("frontend", "public", "assets", "video", "msme_cinematic_story.mp4")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Try mp4v codec which is standard and universally supported by cv2
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Color palette
    # Warm Ivory: (236, 244, 247) in BGR
    # Forest Green: (53, 63, 23) in BGR
    # Terracotta: (75, 107, 201) in BGR
    # Charcoal: (26, 26, 26) in BGR
    # Gold/Warm light: (120, 200, 245) in BGR
    
    for frame_idx in range(total_frames):
        t = frame_idx / total_frames # 0.0 -> 1.0
        
        # Base canvas: Warm Ivory with subtle vignette
        frame = np.full((height, width, 3), (236, 244, 247), dtype=np.uint8)
        
        # Camera zoom simulation (scale 1.0 -> 1.25)
        zoom = 1.0 + 0.25 * t
        
        # Determine 4 storyboard phases:
        # Phase 1: 0 - 0.25 (Ledger, Calculator, Foundation)
        # Phase 2: 0.25 - 0.50 (UPI QR & Transaction Activity)
        # Phase 3: 0.50 - 0.75 (Shop Operations & Inventory)
        # Phase 4: 0.75 - 1.0 (Flourishing Enterprise Growth)
        
        # 1. Warm morning sunlight beam shifting across table
        sun_x = int(width * (0.3 + 0.4 * t))
        sun_y = int(height * (0.2 + 0.2 * t))
        cv2.circle(frame, (sun_x, sun_y), int(350 * zoom), (220, 238, 250), -1)
        
        # 2. Isometric wooden merchant desk surface
        desk_y = int(height * 0.45)
        cv2.rectangle(frame, (0, desk_y), (width, height), (210, 225, 235), -1)
        
        # Draw wooden grain lines on desk
        for line_offset in range(0, height - desk_y, 40):
            ly = desk_y + line_offset
            cv2.line(frame, (0, ly), (width, ly + int(20 * math.sin(t * 3))), (195, 215, 225), 1)

        # 3. Dynamic Storyboard Stage Rendering
        if t < 0.28:
            # Phase 1: Merchant Ledger & Daily Invoices
            alpha = min(1.0, (0.28 - t) / 0.08)
            overlay = frame.copy()
            
            # Ledger Book Cover & Lined Pages
            book_x = int(width * 0.35 - t * 80)
            book_y = int(height * 0.52 - t * 40)
            cv2.rectangle(overlay, (book_x, book_y), (book_x + 360, book_y + 240), (45, 55, 130), -1)
            cv2.rectangle(overlay, (book_x + 10, book_y + 10), (book_x + 350, book_y + 230), (245, 248, 250), -1)
            
            # Ledger ruled lines
            for r in range(book_y + 35, book_y + 215, 25):
                cv2.line(overlay, (book_x + 30, r), (book_x + 330, r), (180, 200, 215), 1)
                
            # Ruled margin line (Red/Terracotta)
            cv2.line(overlay, (book_x + 85, book_y + 15), (book_x + 85, book_y + 225), (75, 107, 201), 2)
            
            # Invoices / Brass weights
            cv2.rectangle(overlay, (book_x + 390, book_y + 60), (book_x + 520, book_y + 220), (235, 240, 245), -1)
            cv2.circle(overlay, (book_x - 70, book_y + 120), 45, (60, 160, 210), -1)
            
            cv2.addWeighted(overlay, 0.85 * alpha, frame, 1.0 - 0.85 * alpha, 0, frame)

        if 0.18 < t < 0.58:
            # Phase 2: UPI Standee, Scanner Soundbox & Flow Signals
            p2_factor = math.sin((t - 0.18) / 0.40 * math.pi)
            overlay = frame.copy()
            
            qr_x = int(width * 0.50 - (t - 0.25) * 120)
            qr_y = int(height * 0.42)
            
            # UPI Soundbox Standee
            cv2.rectangle(overlay, (qr_x, qr_y), (qr_x + 180, qr_y + 250), (53, 63, 23), -1)
            cv2.rectangle(overlay, (qr_x + 15, qr_y + 20), (qr_x + 165, qr_y + 170), (255, 255, 255), -1)
            
            # QR pattern mock
            for qrx in range(qr_x + 35, qr_x + 145, 20):
                for qry in range(qr_y + 40, qr_y + 150, 20):
                    if (qrx + qry) % 40 == 0:
                        cv2.rectangle(overlay, (qrx, qry), (qrx + 14, qry + 14), (26, 26, 26), -1)
                        
            # Ambient transaction ripple waves (Mint/Emerald pulses)
            pulse_radius = int(80 + 120 * math.fmod(t * 8, 1.0))
            cv2.circle(overlay, (qr_x + 90, qr_y + 95), pulse_radius, (153, 211, 52), 2)
            
            cv2.addWeighted(overlay, 0.80 * p2_factor, frame, 1.0 - 0.80 * p2_factor, 0, frame)

        if 0.45 < t < 0.82:
            # Phase 3: Store Shelves, Artisan Weaving / Kirana Footfall
            p3_factor = math.sin((t - 0.45) / 0.37 * math.pi)
            overlay = frame.copy()
            
            # Storefront background shelving units
            for shelf_y in range(120, int(desk_y - 20), 75):
                cv2.line(overlay, (80, shelf_y), (width - 80, shelf_y), (140, 160, 175), 8)
                # Jars / Fabric bolts on shelves
                for item_x in range(120, width - 120, 90):
                    cv2.rectangle(overlay, (item_x, shelf_y - 50), (item_x + 45, shelf_y), (75, 107, 201), -1)
                    
            cv2.addWeighted(overlay, 0.75 * p3_factor, frame, 1.0 - 0.75 * p3_factor, 0, frame)

        if t > 0.65:
            # Phase 4: Bustling Market Arch & Flourishing Growth Panorama
            p4_factor = min(1.0, (t - 0.65) / 0.25)
            overlay = frame.copy()
            
            # Flourishing Market Pillars / Archway
            cv2.rectangle(overlay, (60, 40), (140, height), (53, 63, 23), -1)
            cv2.rectangle(overlay, (width - 140, 40), (width - 60, height), (53, 63, 23), -1)
            cv2.line(overlay, (60, 80), (width - 60, 80), (53, 63, 23), 12)
            
            # Golden hour sunlight rays expanding across the frame
            for ray_i in range(-3, 4):
                ray_angle = math.radians(25 * ray_i)
                end_x = int(width / 2 + math.sin(ray_angle) * width)
                end_y = int(height)
                cv2.line(overlay, (int(width / 2), 0), (end_x, end_y), (180, 230, 255), 4)
                
            cv2.addWeighted(overlay, 0.85 * p4_factor, frame, 1.0 - 0.85 * p4_factor, 0, frame)

        # 4. Cinematic Soft Vignette & Film Blur
        # Soft atmospheric color wash in brand colors
        color_wash = np.zeros_like(frame)
        color_wash[:, :] = (236, 244, 247) # Warm Ivory
        cv2.addWeighted(frame, 0.90, color_wash, 0.10, 0, frame)
        
        # Subtle dust/light particle motes
        for p_idx in range(18):
            px = int((math.sin(p_idx * 1.5 + t * 4) * 0.45 + 0.5) * width)
            py = int((math.cos(p_idx * 2.1 + t * 3) * 0.40 + 0.5) * height)
            cv2.circle(frame, (px, py), 2, (255, 255, 255), -1)
            
        out.write(frame)
        
    out.release()
    print(f"Successfully generated cinematic background video at: {output_path}")

if __name__ == "__main__":
    create_cinematic_msme_video()
