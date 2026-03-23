import os
import sys
from google import genai
from google.genai import types

# Resolve paths relative to this script's directory
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_HERO_PATH = os.path.join(_SCRIPT_DIR, "hero.png")
_PHILOSOPHY_PATH = os.path.join(_SCRIPT_DIR, "philosophy.png")


def main() -> None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("API KEY IS MISSING IN PYTHON!")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    print("Starting Hero Image Generation with Nano Banana Pro...")
    try:
        hero_response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=["A hyper-realistic, 8k resolution, cinematic architectural photography of a breathtaking modern mausoleum interior dedicated to a legendary martial artist. Sun-drenched sanctuary with clean geometric lines, a subtle glowing turquoise glass dojo aesthetic, and warm Texas-stone pastels. Lots of negative space, serene, forward-looking, high-end museum or luxury tech aesthetic. No text or people. Aspect ratio 16:9."],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )
        if not hero_response.parts:
            print("Warning: Hero image generation returned no parts.")
        else:
            saved = False
            for part in hero_response.parts:
                if part.inline_data is not None:
                    image = part.as_image()
                    try:
                        image.save(_HERO_PATH)
                        print(f"Hero image saved to {_HERO_PATH}")
                        saved = True
                    except OSError as e:
                        print(f"Failed to save hero image: {e}")
            if not saved:
                print("Warning: No image data found in hero response.")
    except Exception as e:
        print(f"Failed hero: {e}")

    print("Starting Philosophy Image Generation with Nano Banana Pro...")
    try:
        phil_response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=["A hyper-realistic, 8k resolution, architectural abstract photography of a sleek, luminescent sanctuary wall. Clean whites, deep charcoal, and a warm Texas sunset lighting blending with pale mint. Glassmorphism, premium aesthetic, calming and monumental. Subtle martial arts minimalism. No text or people, lots of negative space for text overlay. Aspect ratio 16:9."],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )
        if not phil_response.parts:
            print("Warning: Philosophy image generation returned no parts.")
        else:
            saved = False
            for part in phil_response.parts:
                if part.inline_data is not None:
                    image = part.as_image()
                    try:
                        image.save(_PHILOSOPHY_PATH)
                        print(f"Philosophy image saved to {_PHILOSOPHY_PATH}")
                        saved = True
                    except OSError as e:
                        print(f"Failed to save philosophy image: {e}")
            if not saved:
                print("Warning: No image data found in philosophy response.")
    except Exception as e:
        print(f"Failed phil: {e}")

    print("Done!")


if __name__ == "__main__":
    main()
