import cv2
import numpy as np
import math
import os

def generate_cinematic_msme_hero_image():
    width = 2560
    height = 1440
    output_dir = os.path.join("frontend", "public", "assets", "images")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "msme_hero_cinematic.jpg")
    
    # Base canvas: Warm Ivory tone (BGR: 236, 244, 247)
    img = np.full((height, width, 3), (236, 244, 247), dtype=np.uint8)
    
    # 1. Warm Golden Hour Sunlight Radiance from top-right
    sun_center = (int(width * 0.75), int(height * 0.15))
    for r in range(900, 100, -80):
        alpha = 0.04
        overlay = img.copy()
        cv2.circle(overlay, sun_center, r, (215, 235, 252), -1)
        cv2.addWeighted(overlay, alpha, img, 1.0 - alpha, 0, img)
        
    # 2. Forest Green & Terracotta Subtle Ambient Blobs (Corner Depth)
    fg_overlay = img.copy()
    cv2.circle(fg_overlay, (int(width * 0.15), int(height * 0.25)), 650, (53, 63, 23), -1) # Forest Green
    cv2.addWeighted(fg_overlay, 0.05, img, 0.95, 0, img)
    
    tc_overlay = img.copy()
    cv2.circle(tc_overlay, (int(width * 0.85), int(height * 0.40)), 700, (75, 107, 201), -1) # Terracotta
    cv2.addWeighted(tc_overlay, 0.04, img, 0.96, 0, img)

    # 3. Rich Teak Wood Merchant Counter / Desk Surface in Lower Half
    desk_y = int(height * 0.58)
    desk_overlay = img.copy()
    cv2.rectangle(desk_overlay, (0, desk_y), (width, height), (195, 215, 228), -1)
    
    # Wood grain lines & perspective
    for ly in range(desk_y, height, 45):
        cv2.line(desk_overlay, (0, ly), (width, ly + 25), (180, 200, 215), 1)
    cv2.addWeighted(desk_overlay, 0.65, img, 0.35, 0, img)

    # 4. Classical Indian Ledger Book (Bahi-Khata style in Warm Crimson & Gold binding)
    book_x = int(width * 0.28)
    book_y = int(height * 0.62)
    book_w = 580
    book_h = 380
    
    # Drop shadow under ledger
    shadow = img.copy()
    cv2.rectangle(shadow, (book_x - 20, book_y - 10), (book_x + book_w + 30, book_y + book_h + 30), (140, 155, 165), -1)
    cv2.addWeighted(shadow, 0.25, img, 0.75, 0, img)
    
    # Cover & Pages
    cv2.rectangle(img, (book_x, book_y), (book_x + book_w, book_y + book_h), (45, 52, 142), -1) # Crimson / Bahi-khata cloth red
    cv2.rectangle(img, (book_x + 18, book_y + 16), (book_x + book_w - 18, book_y + book_h - 16), (242, 246, 250), -1) # Cream pages
    
    # Traditional Ruled Red Margin & Lines
    cv2.line(img, (book_x + 120, book_y + 20), (book_x + 120, book_y + book_h - 20), (75, 107, 201), 2)
    for ly in range(book_y + 55, book_y + book_h - 30, 32):
        cv2.line(img, (book_x + 35, ly), (book_x + book_w - 35, ly), (200, 218, 228), 1)

    # 5. Brass Counter Weights & Heritage Pen / Invoices
    cv2.circle(img, (book_x - 110, book_y + 180), 70, (80, 175, 225), -1) # Brass weight
    cv2.circle(img, (book_x - 110, book_y + 180), 55, (95, 190, 240), -1)
    cv2.circle(img, (book_x - 110, book_y + 180), 20, (60, 150, 200), -1)
    
    # Receipts / Invoices neatly stacked
    cv2.rectangle(img, (book_x + book_w + 60, book_y + 60), (book_x + book_w + 260, book_y + 320), (240, 244, 248), -1)
    cv2.rectangle(img, (book_x + book_w + 50, book_y + 80), (book_x + book_w + 250, book_y + 340), (235, 240, 245), -1)

    # 6. Modern Digital QR Standee (The "Beyond Credit" Bridge: Physical Ledger -> Instant UPI DPI)
    qr_x = int(width * 0.65)
    qr_y = int(height * 0.52)
    qr_w = 260
    qr_h = 360
    
    # Standee Acrylic Shadow
    qr_shadow = img.copy()
    cv2.rectangle(qr_shadow, (qr_x - 15, qr_y - 10), (qr_x + qr_w + 20, qr_y + qr_h + 25), (150, 165, 175), -1)
    cv2.addWeighted(qr_shadow, 0.20, img, 0.80, 0, img)
    
    # Forest Green Base Acrylic
    cv2.rectangle(img, (qr_x, qr_y), (qr_x + qr_w, qr_y + qr_h), (53, 63, 23), -1)
    cv2.rectangle(img, (qr_x + 20, qr_y + 25), (qr_x + qr_w - 20, qr_y + qr_h - 45), (255, 255, 255), -1)
    
    # Stylized QR pattern matrix
    for mx in range(qr_x + 45, qr_x + qr_w - 45, 28):
        for my in range(qr_y + 55, qr_y + qr_h - 75, 28):
            if (mx + my) % 56 == 0:
                cv2.rectangle(img, (mx, my), (mx + 20, my + 20), (26, 26, 26), -1)
                
    # Three Corner Position Squares
    cv2.rectangle(img, (qr_x + 45, qr_y + 55), (qr_x + 95, qr_y + 105), (53, 63, 23), 4)
    cv2.rectangle(img, (qr_x + qr_w - 95, qr_y + 55), (qr_x + qr_w - 45, qr_y + 105), (53, 63, 23), 4)
    cv2.rectangle(img, (qr_x + 45, qr_y + qr_h - 125), (qr_x + 95, qr_y + qr_h - 75), (53, 63, 23), 4)

    # Soft ambient glow behind QR (Mint green)
    mint_glow = img.copy()
    cv2.circle(mint_glow, (qr_x + int(qr_w / 2), qr_y + int(qr_h / 2)), 220, (153, 211, 52), -1)
    cv2.addWeighted(mint_glow, 0.12, img, 0.88, 0, img)

    # 7. Subtle Bokeh & Golden Sunlight Dust Particles
    for i in range(45):
        bx = int((math.sin(i * 1.7) * 0.45 + 0.5) * width)
        by = int((math.cos(i * 2.3) * 0.40 + 0.5) * height)
        cv2.circle(img, (bx, by), int(3 + (i % 5)), (255, 255, 255), -1)

    # Save at high quality JPG
    cv2.imwrite(output_path, img, [cv2.IMWRITE_JPEG_QUALITY, 96])
    print(f"Cinematic Hero Image generated successfully at: {output_path}")

if __name__ == "__main__":
    generate_cinematic_msme_hero_image()
