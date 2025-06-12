(async () => {
  for (const folder of ["terser-mangle-and-compress", "terser-compress-twice"]) {
    const { build } = await import(`./${folder}/build.js`);
    await build();
  }
})();