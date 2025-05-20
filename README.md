# Figma Component URL Exporter

A Figma plugin that exports all components from the current page along with their URLs. The plugin organizes components hierarchically, showing main components with their variants, and generates proper Figma URLs for each component.

## Features

- Exports components from the current page only
- Organizes components hierarchically (main components with their variants)
- Generates proper Figma URLs for each component
- Provides an easy-to-use copy to clipboard functionality
- Shows the number of components found

## Installation

1. Clone this repository
```bash
git clone https://github.com/thelllabs/figma-component-exporter.git
```

2. Install dependencies
```bash
pnpm install
```

3. Build the plugin
```bash
pnpm run build
```

## Usage

1. In Figma, go to Plugins > Development > Import plugin from manifest...
2. Select the manifest.json file from this repository
3. Run the plugin from Figma's plugin menu
4. Click "Export Components" to scan the current page
5. Use the "Copy to Clipboard" button to copy the JSON data

## Output Format

The plugin generates JSON in the following format:
```json
[
  {
    "name": "Component Name",
    "url": "https://www.figma.com/design/FILE_KEY/FILE_NAME?node-id=NODE_ID",
    "variants": [
      {
        "name": "Variant Name",
        "url": "https://www.figma.com/design/FILE_KEY/FILE_NAME?node-id=VARIANT_NODE_ID"
      }
    ]
  }
]
```

## Development

- The plugin is built with TypeScript
- Uses pnpm for package management
- Includes automatic watch mode for development (`pnpm run watch`)

## Requirements

- This plugin requires private plugin API access (`enablePrivatePluginApi: true` in manifest.json)
- Figma desktop app or Figma web in a modern browser
- Node.js and pnpm for development 