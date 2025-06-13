import fs from 'fs';
import { minify } from "terser";
import remapping, { EncodedSourceMap } from "@ampproject/remapping";
import { mergeScopeMaps } from "tc39-proposal-scope-mapping/src/mergeScopeMaps";
import { encode } from '@chrome-devtools/source-map-scopes-codec';

export async function build() {
  const originalSource = fs.readFileSync(__dirname + "/original.js", "utf8");

  const { code: intermediateSource, map: sourceMap1 } = await minify(
    { "original.js": originalSource },
    {
      compress: true,
      mangle: true,
      sourceMap: {
        scopes: true,
        asObject: true,
      }
    }
  );

  const { code: generatedSource, map: sourceMap2 } = await minify(
    { "intermediate.js": intermediateSource! },
    {
      compress: {
        toplevel: true,
      },
      mangle: true,
      sourceMap: {
        scopes: true,
        asObject: true,
      },
    }
  );

  const sourceMap = remapping(sourceMap2 as EncodedSourceMap, file => {
    if (file === "intermediate.js") {
      return sourceMap1 as EncodedSourceMap;
    }
  });
  const { originalScopes, generatedRanges } = mergeScopeMaps([sourceMap1 as any], sourceMap2 as any);
  const { names, scopes } = encode({ scopes: originalScopes, ranges: generatedRanges }, sourceMap as any);
  const sourceMapWithScopes = { ...sourceMap, names, scopes };

  fs.writeFileSync(__dirname + "/generated.js", `${generatedSource}\n//# sourceMappingURL=generated.js.map`);
  fs.writeFileSync(__dirname + "/generated.js.map", JSON.stringify(sourceMapWithScopes));
}
