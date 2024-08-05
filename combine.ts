import fs from 'fs/promises';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const SOURCE_DIRS: string[] = [];
let OUTPUT_FILE = './test/dist/all.ts';
let IGNORE_IMPORTS = true;
let IGNORE_EXPORTS = true;
let FILE_EXTENSIONS = ['.ts']; // Default to TypeScript files

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--path=')) {
    SOURCE_DIRS.push(args[i].split('=')[1]);
  } else if (args[i].startsWith('--output=')) {
    OUTPUT_FILE = args[i].split('=')[1];
  } else if (args[i] === '--ignore-imports=false') {
    IGNORE_IMPORTS = false;
  } else if (args[i] === '--ignore-exports=false') {
    IGNORE_EXPORTS = false;
  } else if (args[i].startsWith('--ext=')) {
    FILE_EXTENSIONS = args[i]
      .split('=')[1]
      .split(',')
      .map((ext) => ext.trim());
  }
}

if (SOURCE_DIRS.length === 0) {
  console.error('Error: At least one --path argument must be provided.');
  process.exit(1);
}

enum State {
  INIT = '🚀 Initializing',
  READING_IGNORE = '📖 Reading .ignore',
  PROCESSING_FILES = '🔄 Processing files',
  WRITING_OUTPUT = '💾 Writing output',
  DONE = '✅ Done',
  ERROR = '❌ Error',
}

const globToRegExp = (pattern: string): RegExp => {
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`);
};

const createIgnoreChecker = async (
  sourceDir: string
): Promise<(path: string) => boolean> => {
  const ignorePath = path.join(sourceDir, '.ignore');
  console.log(`${State.READING_IGNORE}: Parsing ${ignorePath}`);
  try {
    const fileContent = await fs.readFile(ignorePath, 'utf-8');
    const patterns = fileContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((pattern) => globToRegExp(pattern));

    return (filePath: string) => {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const fileName = path.basename(normalizedPath);

      return patterns.some(
        (regex) => regex.test(normalizedPath) || regex.test(fileName)
      );
    };
  } catch (error) {
    console.warn(
      `⚠️ Warning: Could not read .ignore file in ${sourceDir}. Proceeding without ignore rules for this directory.`
    );
    return () => false;
  }
};

const removeImportsAndExports = (content: string): string => {
  const importRegex =
    /^import\s+(?:(?:(?:\{[^}]*\}|\*\s+as\s+\w+|[\w,\s]+)\s+from\s+)?['"](?:[@\w\/-]+|\.{1,2}\/[\w\/-]+)['"]|(?:\{[^}]*\}|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+['"](?:[@\w\/-]+|\.{1,2}\/[\w\/-]+)['"]|\*\s+as\s+\w+\s+from\s+['"](?:[@\w\/-]+|\.{1,2}\/[\w\/-]+)['"]);?\s*$/gm;

  const exportRegex =
    /^export\s+(?:\*\s+from\s+['"](?:[@\w\/-]+|\.{1,2}\/[\w\/-]+)['"]|(?:\{[^}]*\}|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+['"](?:[@\w\/-]+|\.{1,2}\/[\w\/-]+)['"]|(?:(?:async\s+)?function|class|const|let|var)\s+\w+|(?:\{[^}]*\}|default|type|interface));?\s*$/gm;

  if (IGNORE_IMPORTS) {
    content = content.replace(importRegex, '');
  }
  if (IGNORE_EXPORTS) {
    content = content.replace(exportRegex, '');
  }
  return content;
};

const combineFiles = async (): Promise<void> => {
  console.log(State.INIT);

  console.log(
    `Import statements will be ${IGNORE_IMPORTS ? 'ignored' : 'included'}.`
  );
  console.log(
    `Export statements will be ${IGNORE_EXPORTS ? 'ignored' : 'included'}.`
  );

  console.log(`File extensions to process: ${FILE_EXTENSIONS.join(', ')}`);

  let combinedContent = '';

  const processDirectory = async (
    directory: string,
    shouldIgnore: (path: string) => boolean
  ): Promise<void> => {
    console.log(`${State.PROCESSING_FILES}: ${directory}`);
    try {
      const items = await fs.readdir(directory, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(directory, item.name);
        const relativePath = path.relative(directory, fullPath);

        if (shouldIgnore(relativePath)) {
          console.log(`Ignoring: ${relativePath}`);
          continue;
        }

        if (item.isDirectory()) {
          await processDirectory(fullPath, shouldIgnore);
        } else if (
          item.isFile() &&
          FILE_EXTENSIONS.includes(path.extname(item.name))
        ) {
          let content = await fs.readFile(fullPath, 'utf8');
          content = removeImportsAndExports(content);
          combinedContent += `// Filename: ${fullPath}\n${content.trim()}\n\n`;
        }
      }
    } catch (error) {
      console.error(
        `${State.ERROR}: Processing directory ${directory}:`,
        error
      );
    }
  };

  try {
    for (const sourceDir of SOURCE_DIRS) {
      const shouldIgnore = await createIgnoreChecker(sourceDir);
      await processDirectory(sourceDir, shouldIgnore);
    }

    console.log(`${State.WRITING_OUTPUT}: ${OUTPUT_FILE}`);
    await fs.writeFile(OUTPUT_FILE, combinedContent);

    const stats = await fs.stat(OUTPUT_FILE);
    const lineCount = combinedContent.split('\n').length;

    console.log(
      `${State.DONE}: Successfully combined all specified files into ${OUTPUT_FILE}`
    );
    console.log(`📊 File Statistics:`);
    console.log(`   - Line Count: ${lineCount}`);
    console.log(`   - File Size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`${State.ERROR}: Writing to ${OUTPUT_FILE}:`, error);
  }
};

// Execute the function
combineFiles();
