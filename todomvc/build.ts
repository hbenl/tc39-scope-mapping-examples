import fs from 'fs';
import { minify } from "terser";
import remapping, { EncodedSourceMap } from "@ampproject/remapping";
import { mergeScopeMaps } from "tc39-proposal-scope-mapping/src/mergeScopeMaps";
import { encode, GeneratedRange, Position } from '@chrome-devtools/source-map-scopes-codec';

// This example was taken from https://github.com/tastejs/todomvc/tree/gh-pages/examples/javascript-es5

export async function build() {
  const files = ["base.js", "helpers.js", "store.js", "model.js", "template.js", "view.js", "controller.js", "app.js"];
  const originalSources: Record<string, string> = {};
  for (const file of files) {
    originalSources[`../src/${file}`] = fs.readFileSync(__dirname + "/src/" + file, "utf8");
  }

  const { code: intermediateSource, map: sourceMap1 } = await minify(
    originalSources,
    {
      compress: false,
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
      compress: true,
      mangle: false,
      sourceMap: {
        scopes: true,
        asObject: true,
      }
    }
  );

  const sourceMap = remapping(sourceMap2 as EncodedSourceMap, file => {
    if (file === "intermediate.js") {
      return sourceMap1 as EncodedSourceMap;
    }
  });
  const { originalScopes, generatedRanges } = mergeScopeMaps([sourceMap1 as any], sourceMap2 as any);
  // TODO fix mergeScopeMaps to output sorted ranges
  sortByStartLocation(generatedRanges);
  const { names, scopes } = encode({ scopes: originalScopes, ranges: generatedRanges }, sourceMap as any);
  const sourceMapWithScopes = { ...sourceMap, names, scopes };

  fs.writeFileSync(__dirname + "/static/generated.js", `${generatedSource}\n//# sourceMappingURL=generated.js.map`);
  fs.writeFileSync(__dirname + "/static/generated.js.map", JSON.stringify(sourceMapWithScopes));
}

function sortByStartLocation(generatedRanges: GeneratedRange[]) {
  generatedRanges.sort((range1, range2) => comparePositions(range1.start, range2.start));
  for (const range of generatedRanges) {
    sortByStartLocation(range.children);
  }
}

export function isBefore(loc1: Position, loc2: Position) {
  if (loc1.line < loc2.line) {
    return true;
  } else if (loc1.line > loc2.line) {
    return false;
  } else {
    return loc1.column < loc2.column;
  }
}

export function comparePositions(loc1: Position, loc2: Position) {
  if (isBefore(loc1, loc2)) {
    return -1;
  } else if (isBefore(loc2, loc1)) {
    return 1;
  } else {
    return 0;
  }
}
