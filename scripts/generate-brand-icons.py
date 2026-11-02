import os
from PIL import Image

def generate_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "public")
    src_dir = os.path.join(base_dir, "src")
    
    # 1. Use the high-resolution master emblem from samalogo.png
    master_emblem_path = os.path.join(public_dir, "samalogo.png")
    if not os.path.exists(master_emblem_path):
        raise FileNotFoundError(f"Master emblem not found at {master_emblem_path}")
        
    master = Image.open(master_emblem_path).convert("RGBA")
    bbox = master.getbbox()
    emblem_crop = master.crop(bbox)
    
    # Helper to generate centered square icon with specified padding ratio
    def create_square_icon(size, padding_ratio=0.08, bg_color=None):
        if bg_color:
            canvas = Image.new("RGBA", (size, size), bg_color)
        else:
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            
        avail_w = int(size * (1 - 2 * padding_ratio))
        avail_h = int(size * (1 - 2 * padding_ratio))
        
        ew, eh = emblem_crop.size
        scale = min(avail_w / ew, avail_h / eh)
        nw, nh = int(ew * scale), int(eh * scale)
        
        scaled_emblem = emblem_crop.resize((nw, nh), Image.Resampling.LANCZOS)
        pos_x = (size - nw) // 2
        pos_y = (size - nh) // 2
        
        canvas.paste(scaled_emblem, (pos_x, pos_y), scaled_emblem)
        return canvas

    # Generate icons of various standard sizes
    icon_16 = create_square_icon(16, padding_ratio=0.04)
    icon_32 = create_square_icon(32, padding_ratio=0.06)
    icon_48 = create_square_icon(48, padding_ratio=0.08)
    icon_180_touch = create_square_icon(180, padding_ratio=0.12, bg_color=(251, 250, 247, 255)) # #FBFAF7 brand background for iOS
    icon_192 = create_square_icon(192, padding_ratio=0.10)
    icon_512 = create_square_icon(512, padding_ratio=0.10)

    # 2. Save individual PNGs to public/ (both standard and cache-busting brand names)
    for p in [os.path.join(public_dir, "favicon-16x16.png"), os.path.join(public_dir, "sama-favicon-16x16.png")]:
        icon_16.save(p, format="PNG")
    for p in [os.path.join(public_dir, "favicon-32x32.png"), os.path.join(public_dir, "favicon.png"), os.path.join(public_dir, "sama-favicon-32x32.png")]:
        icon_32.save(p, format="PNG")
    for p in [os.path.join(public_dir, "favicon-48x48.png"), os.path.join(public_dir, "sama-favicon-48x48.png")]:
        icon_48.save(p, format="PNG")
    for p in [os.path.join(public_dir, "apple-touch-icon.png"), os.path.join(public_dir, "sama-apple-touch-icon.png")]:
        icon_180_touch.save(p, format="PNG")
    for p in [os.path.join(public_dir, "logo192.png"), os.path.join(public_dir, "sama-logo-192.png")]:
        icon_192.save(p, format="PNG")
    for p in [os.path.join(public_dir, "logo512.png"), os.path.join(public_dir, "sama-logo-512.png"), os.path.join(public_dir, "samalogo.png")]:
        icon_512.save(p, format="PNG")
    
    # Save multi-size favicon.ico (containing 16x16, 32x32, 48x48)
    ico_master = create_square_icon(256, padding_ratio=0.08)
    for p in [os.path.join(public_dir, "favicon.ico"), os.path.join(public_dir, "sama-favicon.ico")]:
        ico_master.save(p, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    print("[Brand Icons] Generated public favicon.ico, sama-favicon.ico, 16/32/48/180/192/512 icons successfully.")

    # 3. Ensure full horizontal logo (Emblem + sama wordmark) in brand colors is consistent across components
    # We already have high-res 1030x305 in components/Header/samalogo.png with #9C9265 & #5C785A
    header_logo_path = os.path.join(src_dir, "components", "Header", "samalogo.png")
    assets_logo_path = os.path.join(src_dir, "assets", "samalogo.png")
    img_logo_path = os.path.join(public_dir, "img", "logo.png")
    
    if os.path.exists(header_logo_path):
        header_im = Image.open(header_logo_path).convert("RGBA")
        # Sync to assets
        header_im.save(assets_logo_path, format="PNG")
        # Ensure public/img/logo.png is crisp 297x88 version of the official brand logo
        target_logo = header_im.resize((297, 88), Image.Resampling.LANCZOS)
        target_logo.save(img_logo_path, format="PNG")
        print("[Brand Icons] Synchronized header, assets, and public/img logos with official branding.")

if __name__ == "__main__":
    generate_icons()

