/** Rspack 样式侧效导入；配合 tsconfig allowArbitraryExtensions */
declare module '*.css' {
  const href: string;
  export default href;
}

declare module '*.scss' {
  const href: string;
  export default href;
}
