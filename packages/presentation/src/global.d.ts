declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const url: string;
  export default url;
}
