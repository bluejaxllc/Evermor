import requests
from bs4 import BeautifulSoup
import re

def extract_contacts(url):
    print(f"Scraping {url} for contact information...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
        
        # Simple regex for emails and phone numbers
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
        phones = set(re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
        
        return {
            "url": url,
            "emails": list(emails),
            "phones": list(phones)
        }
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return {"url": url, "emails": [], "phones": [], "error": str(e)}

def main():
    # Target URLs related to Chuck Norris's family foundation and representation
    targets = [
        "https://www.kickstartkids.org/contact-us", # Foundation co-chaired by his wife, Gena Norris
        "https://www.linkentertainment.com/contact", # LINK Entertainment (Manager: Erik Kritzer)
        "https://chucknorrismorningkick.com/contact" # Business inquiries (Morning Kick)
    ]
    
    results = []
    for target in targets:
        result = extract_contacts(target)
        results.append(result)
        
    print("\n--- Scraping Results ---")
    for res in results:
        print(f"\nWebsite: {res['url']}")
        if res.get("error"):
            print(f"Error: {res['error']}")
        else:
            print(f"Emails found: {', '.join(res['emails']) if res['emails'] else 'None'}")
            print(f"Phones found: {', '.join(res['phones']) if res['phones'] else 'None'}")

if __name__ == "__main__":
    main()
