# Math

A responsive mathematics website with a safe expression calculator, algebra and geometry lessons, and a searchable formula library. Built with HTML, CSS, and JavaScript; no build or dependencies required. Fonts enhance the design when Google Fonts is available, with local fallbacks otherwise.

## Develop locally

From the repository directory, run `python3 -m http.server 8000` and open the server in your browser. Edit `index.html`, `style.css`, and `script.js` directly.

Calculator supports parentheses, +, −, ×, ÷, right-associative powers (`2^3^2`), `sqrt(...)`, `pi`, and postfix percentages (`25%` = 0.25). Use explicit multiplication, such as `2*pi`. Enter calculates; Escape clears. Percentages are literal hundredths: `200+10%` = 200.1.

## Publish with GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Deploy website to GitHub Pages → Run workflow**, choose `main`, and run it. Future pushes to `main` deploy automatically.
4. If GitHub asks for environment approval, approve the `github-pages` deployment.

Once deployment succeeds, the site is available at **https://bobichiyanartur-sudo.github.io/math/**.

The workflow publishes only the three website files, with no build process. GitHub Pages must be enabled in repository settings before the workflow can deploy.
