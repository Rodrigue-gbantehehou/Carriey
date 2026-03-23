from pathlib import Path

def test_link_callback():
    base_path = Path("c:/projets/cvtor/backend")
    uris = [
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
        "style.css",
        "/static/logo.png"
    ]
    for uri in uris:
        try:
            result = str(base_path / uri)
            print(f"URI: {uri} -> Result: {result}")
        except Exception as e:
            print(f"URI: {uri} -> Error: {e}")

if __name__ == "__main__":
    test_link_callback()
