# Publish To GitHub

The projects are committed locally and ready to publish.

## Option A: Publish The Whole Portfolio Repo

Create an empty GitHub repository, then run:

```bash
git remote add origin https://github.com/zjj-0419/ai-fullstack-projects.git
git branch -M main
git push -u origin main
```

## Option B: Publish Each Project Separately

Create three empty repositories:

- `viceme-skill-forge`
- `ai-interview-copilot`
- `voice-product-analytics`

Then copy each folder into its own repository and push with the same commands.

## Notes

- `node_modules` and `dist` are intentionally ignored.
- Run `npm install` inside each project after cloning.
- Run `npm run build` to verify production builds.
