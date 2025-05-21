/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 320, height: 400 });

interface ComponentData {
  name: string;
  url: string;
  variants?: ComponentData[];
}

function getComponentUrl(node: BaseNode): string {
  const formattedNodeId = node.id.replace(':', '-');
  const fileName = figma.root.name.replace(/\s+/g, '-');
  return `https://www.figma.com/design/${figma.fileKey}/${fileName}?node-id=${formattedNodeId}`;
}

function getPageComponents(): ComponentData[] {
  const components: ComponentData[] = [];
  const currentPage = figma.currentPage;

  function isMainComponent(node: ComponentNode | ComponentSetNode): boolean {
    return node.type === "COMPONENT" && !node.parent?.type.includes("COMPONENT");
  }

  function isComponentSet(node: BaseNode): node is ComponentSetNode {
    return node.type === "COMPONENT_SET";
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

function getFirstLevelLayers(): ComponentData[] {
  const layers: ComponentData[] = [];
  const currentPage = figma.currentPage;

  currentPage.children.forEach(node => {
    layers.push({
      name: node.name,
      url: getComponentUrl(node)
    });
  });

  return layers;
}

figma.ui.onmessage = async (msg: { type: string; exportType: string }) => {
  if (msg.type === 'export-components') {
    const components = msg.exportType === 'components' 
      ? getPageComponents()
      : getFirstLevelLayers();

    figma.ui.postMessage({ 
      type: 'export-result',
      components 
    });
  }
}; 