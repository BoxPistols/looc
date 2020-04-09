import type { extractInterfaces } from "tsx-ray";

type Interfaces = ReturnType<typeof extractInterfaces>;

export const getPropTypesByComponent = (componentName: string) => (
  interfaces: Interfaces
) => {
  const propTypes = `${componentName}Props`;
  return interfaces[propTypes];
};
