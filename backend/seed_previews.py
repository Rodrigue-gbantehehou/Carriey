from database import SessionLocal
from models.template import Template

def update_previews():
    db = SessionLocal()
    try:
        # Mapping templates to generated high-quality previews
        modern_templates = ['moderne', 'creatif', 'tokyo', 'abidjan', 'dakar', 'rodrigue']
        pro_templates = ['professional', 'classique']
        
        counts = 0
        for slug in modern_templates:
            t = db.query(Template).filter(Template.slug == slug).first()
            if t:
                t.preview_image = '/images/cv_minimal.png'
                counts += 1
        
        for slug in pro_templates:
            t = db.query(Template).filter(Template.slug == slug).first()
            if t:
                t.preview_image = '/images/cv_modern.png'
                counts += 1
        
        db.commit()
        print(f"Updated {counts} templates with preview images.")
    except Exception as e:
        db.rollback()
        print(f"Error during update: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_previews()
