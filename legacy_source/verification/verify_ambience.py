
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Use localhost
        page.goto('http://localhost:8000/index.html')

        # Click the gear icon to open menu
        page.click('#music-toggle')

        # Wait for menu to be visible (not hidden)
        # The toggleMenu removes 'hidden' class.
        page.wait_for_selector('#menu-overlay:not(.hidden)')

        # Take screenshot of the menu
        page.screenshot(path='verification/menu_ambience.png')
        browser.close()

if __name__ == '__main__':
    run()
