import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def create_clinical_sample(filename: str, grade: int, title: str):
    """
    Generate realistic clinical DFU sample image representation.
    """
    w, h = 600, 600
    # Skin tone background
    base_color = np.array([215, 185, 160], dtype=np.float32)
    noise = np.random.normal(0, 8, (h, w, 3)).astype(np.float32)
    skin = np.clip(base_color + noise, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(skin, mode="RGB")
    draw = ImageDraw.Draw(img)
    
    cx, cy = 300, 300
    
    if grade == 1:
        # Grade 1: Superficial Ulcer (shallow pink/red base with mild erythema)
        # Erythema halo
        halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(halo)
        h_draw.ellipse([cx-120, cy-110, cx+120, cy+110], fill=(220, 100, 110, 110))
        halo = halo.filter(ImageFilter.GaussianBlur(25))
        img.paste(Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB"))
        
        # Ulcer center
        u_draw = ImageDraw.Draw(img)
        u_draw.ellipse([cx-60, cy-55, cx+60, cy+55], fill=(190, 45, 55))
        u_draw.ellipse([cx-45, cy-40, cx+45, cy+40], fill=(215, 65, 75))
        # Edge ring
        u_draw.ellipse([cx-62, cy-57, cx+62, cy+57], outline=(235, 215, 180), width=4)
        
    elif grade == 2:
        # Grade 2: Deep Ulcer penetrating to tendon (hyperkeratotic callous ring, deep red base, pale tendon center)
        halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(halo)
        h_draw.ellipse([cx-140, cy-130, cx+140, cy+130], fill=(230, 80, 90, 140))
        halo = halo.filter(ImageFilter.GaussianBlur(30))
        img.paste(Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB"))
        
        # Callus margin
        u_draw = ImageDraw.Draw(img)
        u_draw.ellipse([cx-90, cy-80, cx+90, cy+80], fill=(230, 210, 160))
        u_draw.ellipse([cx-75, cy-65, cx+75, cy+65], fill=(160, 30, 40))
        u_draw.ellipse([cx-50, cy-40, cx+50, cy+40], fill=(130, 20, 30))
        # Tendon/capsule pale center
        u_draw.ellipse([cx-25, cy-20, cx+25, cy+20], fill=(220, 215, 190))
        
    elif grade == 3:
        # Grade 3: Deep Ulcer with Osteitis / Abscess (ragged borders, purulent yellow slough, deep cavity)
        halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(halo)
        h_draw.ellipse([cx-160, cy-150, cx+160, cy+150], fill=(240, 60, 70, 160))
        halo = halo.filter(ImageFilter.GaussianBlur(35))
        img.paste(Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB"))
        
        u_draw = ImageDraw.Draw(img)
        u_draw.ellipse([cx-110, cy-100, cx+110, cy+100], fill=(130, 20, 30))
        u_draw.ellipse([cx-80, cy-70, cx+80, cy+70], fill=(70, 10, 15))
        # Yellow purulent slough deposits
        u_draw.ellipse([cx-60, cy-50, cx-10, cy-10], fill=(200, 180, 80))
        u_draw.ellipse([cx+10, cy-20, cx+50, cy+30], fill=(210, 190, 90))
        u_draw.ellipse([cx-30, cy+10, cx+20, cy+50], fill=(180, 160, 70))
        
    elif grade == 4:
        # Grade 4: Localized Gangrene / Necrosis (Black necrotic eschar, cyanotic ischemic perimeter)
        halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        h_draw = ImageDraw.Draw(halo)
        h_draw.ellipse([cx-170, cy-160, cx+170, cy+160], fill=(120, 60, 80, 160))
        halo = halo.filter(ImageFilter.GaussianBlur(30))
        img.paste(Image.alpha_composite(img.convert("RGBA"), halo).convert("RGB"))
        
        u_draw = ImageDraw.Draw(img)
        u_draw.ellipse([cx-120, cy-110, cx+120, cy+110], fill=(80, 30, 40))
        # Black necrotic eschar center
        u_draw.ellipse([cx-90, cy-80, cx+90, cy+80], fill=(20, 18, 22))
        u_draw.ellipse([cx-60, cy-50, cx+60, cy+50], fill=(10, 8, 12))
        # Crack lines in dry eschar
        u_draw.line([cx-40, cy-40, cx+40, cy+30], fill=(45, 30, 35), width=3)
        u_draw.line([cx-30, cy+20, cx+35, cy-20], fill=(45, 30, 35), width=2)
        
    img = img.filter(ImageFilter.SMOOTH_MORE)
    
    # Add subtle watermark label
    w_draw = ImageDraw.Draw(img)
    w_draw.text((20, 20), f"DFU-AI Clinical Sample - Wagner {title}", fill=(240, 240, 250))
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, "JPEG", quality=95)
    print(f"Saved sample: {filename}")

if __name__ == "__main__":
    sample_dir = os.path.join(os.path.dirname(__file__), "static", "samples")
    create_clinical_sample(os.path.join(sample_dir, "sample_grade1.jpg"), 1, "Grade 1 (Superficial)")
    create_clinical_sample(os.path.join(sample_dir, "sample_grade2.jpg"), 2, "Grade 2 (Deep to Tendon)")
    create_clinical_sample(os.path.join(sample_dir, "sample_grade3.jpg"), 3, "Grade 3 (Osteitis / Abscess)")
    create_clinical_sample(os.path.join(sample_dir, "sample_grade4.jpg"), 4, "Grade 4 (Localized Gangrene)")
