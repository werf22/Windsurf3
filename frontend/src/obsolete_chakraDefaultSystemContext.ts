// Default SystemContext object for ChakraProvider (Chakra UI v3 workaround)
const defaultSystemContext = {
  $$chakra: true,
  _config: {},
  _global: [],
  utility: {},
  // Patch: conditions as an array with includes method
  conditions: [],
  tokens: {},
  breakpoints: {},
  properties: new Set(),
  isValidProperty: () => true,
  normalizeValue: (v: any) => v,
  splitCssProps: (props: any) => [props, {}],
  getTokenCss: () => ({}),
  getGlobalCss: () => ({}),
  getPreflightCss: () => ({}),
  css: () => ({}),
  cva: () => ({}),
  sva: () => ({}),
  getRecipe: () => ({}),
  getSlotRecipe: () => ({}),
  isRecipe: () => false,
  isSlotRecipe: () => false,
  hasRecipe: () => false,
  token: () => ({}),
  layers: { wrap: () => ({}), names: [], atRule: "" },
  // Patch: cvaRecipe with variantKeys array for Chakra UI v3 compatibility
  cvaRecipe: { variantKeys: [] },
};

export default defaultSystemContext;
