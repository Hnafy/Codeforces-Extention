# Hnafy Extension

A simple Chrome/Edge extension that automatically saves the current Codeforces problem code and fills it on the submit page.

---

# Features

- Automatically detects the problem code from Codeforces problem pages.
- Saves the problem code locally in the browser.
- Auto-fills the problem code field on the submit page.

---

# Installation Guide

## 1. Download the Extension

Download or clone the `Hnafy` folder to your computer.

---

## 2. Open Extensions Page

### Google Chrome

Open:

```text
chrome://extensions

```
## 3. Enable Developer Mode

Enable:

```text
Developer mode
```

You can find it in the top-right corner of the extensions page.

---

## 4. Load the Extension

Click:

```text
Load unpacked
```

Then select the `Hnafy` folder.

---

# How to Use

## Step 1

Open any Codeforces problem page.

Example:

```text
https://codeforces.com/problemset/problem/4/A
```

The extension will automatically save the problem code:

```text
4A
```

---

## Step 2

Open the submit page:

```text
https://codeforces.com/problemset/submit
```

The problem code input field will be filled automatically.

---

# Browser Support

- Google Chrome
- Microsoft Edge
- Any Chromium-based browser

---

# Permissions Used

```json
"permissions": ["storage"]
```

This permission is used only to save the latest Codeforces problem code locally in the browser.

---

# Notes

- The extension works locally without publishing it to the Chrome Web Store.
- No personal data is collected.
- The extension works only on Codeforces pages.
```