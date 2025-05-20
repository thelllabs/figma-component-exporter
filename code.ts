/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 300, height: 120 });

interface ComponentData {
  name: string;
  url: string;
  variants?: ComponentData[];
}

function getPageComponents(): ComponentData[] {
  const components: ComponentData[] = [];
  const currentPage = figma.currentPage;
  
  const documentId = figma.fileKey;
  console.log('File Key:', documentId);

  function isMainComponent(node: ComponentNode | ComponentSetNode): boolean {
    return node.type === "COMPONENT" && !node.parent?.type.includes("COMPONENT");
  }

  function isComponentSet(node: BaseNode): node is ComponentSetNode {
    return node.type === "COMPONENT_SET";
  }

  function getComponentUrl(node: BaseNode): string {
    const formattedNodeId = node.id.replace(':', '-');
    const fileName = figma.root.name.replace(/\s+/g, '-');
    if (!documentId) {
      console.warn('File key is undefined. Make sure enablePrivatePluginApi is set to true in manifest.json');
      return `https://www.figma.com/design/${fileName}?node-id=${formattedNodeId}`;
    }
    return `https://www.figma.com/design/${documentId}/${fileName}?node-id=${formattedNodeId}`;
  }

  function processComponent(node: ComponentNode | ComponentSetNode): ComponentData | null {
    if (node.type === "COMPONENT") {
      return {
        name: node.name,
        url: getComponentUrl(node)
      };
    }
    return null;
  }

  function processComponentSet(componentSet: ComponentSetNode): ComponentData {
    const mainData: ComponentData = {
      name: componentSet.name,
      url: getComponentUrl(componentSet),
      variants: []
    };

    for (const child of componentSet.children) {
      if (child.type === "COMPONENT") {
        mainData.variants!.push({
          name: child.name,
          url: getComponentUrl(child)
        });
      }
    }

    return mainData;
  }

  function traverse(node: BaseNode) {
    if (isComponentSet(node)) {
      components.push(processComponentSet(node));
    } else if (node.type === "COMPONENT" && isMainComponent(node)) {
      const componentData = processComponent(node);
      if (componentData) {
        components.push(componentData);
      }
    }

    if ("children" in node) {
      for (const child of node.children) {
        if (child.type !== "COMPONENT" || isMainComponent(child)) {
          traverse(child);
        }
      }
    }
  }

  traverse(currentPage);
  return components;
}

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === 'export-components') {
    const components = getPageComponents();
    figma.ui.postMessage({ 
      type: 'export-result',
      components 
    });
  }
}; 