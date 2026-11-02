import os
from PIL import Image

def generate_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "public")
    src_dir = os.path.join(base_dir, "src")
    
    # 1. Use the ultra high-resolution master emblem (338x305) from Header/samalogo.png
    header_logo_path = os.path.join(src_dir, "components", "Header", "samalogo.png")
    if not os.path.exists(header_logo_path):
        raise FileNotFoundError(f"Header logo not found at {header_logo_path}")
        
    hl = Image.open(header_logo_path).convert("RGBA")
    # Crop the exact emblem on the left (first 338px width)
    emblem_raw = hl.crop((0, 0, 338, 305))
    emblem_crop = emblem_raw.crop(emblem_raw.getbbox())
    ew, eh = emblem_crop.size
    print(f"[Brand Icons] Master emblem dimensions: {ew}x{eh}")
    
    # Helper to generate centered square icon with generous padding so the gear is NEVER cut off
    def create_square_icon(size, padding_ratio=0.15, bg_color=None):
        if bg_color:
            canvas = Image.new("RGBA", (size, size), bg_color)
        else:
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            
        avail_w = int(size * (1 - 2 * padding_ratio))
        avail_h = int(size * (1 - 2 * padding_ratio))
        
        scale = min(avail_w / ew, avail_h / eh)
        nw, nh = int(ew * scale), int(eh * scale)
        
        scaled_emblem = emblem_crop.resize((nw, nh), Image.Resampling.LANCZOS)
        pos_x = (size - nw) // 2
        pos_y = (size - nh) // 2
        
        canvas.paste(scaled_emblem, (pos_x, pos_y), scaled_emblem)
        return canvas

    # Generate icons of various standard sizes with generous breathing margins
    icon_16 = create_square_icon(16, padding_ratio=0.12)
    icon_32 = create_square_icon(32, padding_ratio=0.15)
    icon_48 = create_square_icon(48, padding_ratio=0.15)
    icon_180_touch = create_square_icon(180, padding_ratio=0.16, bg_color=(251, 250, 247, 255)) # #FBFAF7 brand background
    icon_192 = create_square_icon(192, padding_ratio=0.15)
    icon_512 = create_square_icon(512, padding_ratio=0.15)

    # 2. Save PNGs to public/ with both standard and cache-busting filenames
    def save_all(icon, filenames):
        for name in filenames:
            icon.save(os.path.join(public_dir, name), format="PNG")

    save_all(icon_16, ["favicon-16x16.png", "favicon-v2-16x16.png", "sama-favicon-16x16.png", "sama-favicon-v2-16x16.png"])
    save_all(icon_32, ["favicon-32x32.png", "favicon.png", "favicon-v2-32x32.png", "sama-favicon-32x32.png", "sama-favicon-v2-32x32.png"])
    save_all(icon_48, ["favicon-48x48.png", "favicon-v2-48x48.png", "sama-favicon-48x48.png", "sama-favicon-v2-48x48.png"])
    save_all(icon_180_touch, ["apple-touch-icon.png", "apple-touch-icon-v2.png", "sama-apple-touch-icon.png", "sama-apple-touch-icon-v2.png"])
    save_all(icon_192, ["logo192.png", "logo192-v2.png", "sama-logo-192.png", "sama-logo-v2-192.png"])
    save_all(icon_512, ["logo512.png", "logo512-v2.png", "sama-logo-512.png", "sama-logo-v2-512.png", "samalogo.png"])
    
    # Save multi-size favicon.ico (16, 32, 48) with full gear padding
    ico_master = create_square_icon(256, padding_ratio=0.15)
    for name in ["favicon.ico", "favicon-v2.ico", "sama-favicon.ico", "sama-favicon-v2.ico"]:
        ico_master.save(os.path.join(public_dir, name), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    print("[Brand Icons] Generated perfectly-padded icons (leaf + complete gear) with cache-busting v2 URLs.")

    # 3. Ensure full horizontal logo (Emblem + sama wordmark) in brand colors is consistent across components
    assets_logo_path = os.path.join(src_dir, "assets", "samalogo.png")
    img_logo_path = os.path.join(public_dir, "img", "logo.png")
    
    hl.save(assets_logo_path, format="PNG")
    target_logo = hl.resize((297, 88), Image.Resampling.LANCZOS)
    target_logo.save(img_logo_path, format="PNG")
    print("[Brand Icons] Synchronized header, assets, and public/img logos.")

if __name__ == "__main__":
    generate_icons()
