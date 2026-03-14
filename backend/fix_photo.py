import os
import re

TEMPLATE_DIR = r"c:\projets\cvtor\backend\templates"

# The logic I inserted earlier was:
# {% set photo_section = template.sections | selectattr('type', 'equalto', 'photo') | list %}
#       {% set is_photo_enabled = photo_section[0].enabled if photo_section else true %}
#       {% if data.profile.photo and is_photo_enabled %}

def fix_templates():
    print("Fixing photo visibility logic in all templates...")
    for root, dirs, files in os.walk(TEMPLATE_DIR):
        for file in files:
            if file == "template.jinja2":
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # 1. Reverse the previous patch conditionally
                content = content.replace(" and is_photo_enabled %}", " %}")
                
                # 2. We want to wrap the whole photo block.
                # Since the block structure varies a bit per template, we can look for the photo set block.
                
                # Let's find the assignment we added:
                marker = "{% set is_photo_enabled = photo_section[0].enabled if photo_section else true %}\n"
                
                if marker in content:
                    # We will insert `      {% if is_photo_enabled %}\n` right after the marker
                    # And we need to find the matching `{% endif %}` that comes after the `{% else %}` block.
                    # Since parsing Jinja by regex is tricky, let's do template specific replacements
                    pass

                # Actually, a simpler approach is to apply the exact replacement for each of the 7 templates since they are just a few.
                
                print(f"Loaded {file_path}")

if __name__ == "__main__":
    fix_templates()
