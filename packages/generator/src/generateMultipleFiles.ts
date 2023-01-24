import { DirectoryHelper, FileWriter } from './classes';
import fs from 'fs';
import { CreateOptions } from './types';
import {
  writeArgTypeFiles,
  writeInputTypeFiles,
  writeModelFiles,
} from './functions';

export const generateMultipleFiles = ({
  extendedDMMF,
  outputPath,
}: CreateOptions) => {
  // If data is present in the directory, delete it.
  // This is necessary to not have old data in the directory e.g.
  // when a model is removed from the schema the old files would still be present.
  // needs to be syncronous because otherwise a race condition occurs
  // when creating new files.

  if (DirectoryHelper.pathOrDirExists(outputPath)) {
    try {
      fs.rmdirSync(outputPath, { recursive: true });
    } catch (err) {
      if (err instanceof Error)
        throw new Error(`Error while deleting old data: ${err.message}`);
    }
  }

  const indexFileWriter = new FileWriter();

  // Create the path specified in the generator output
  indexFileWriter.createPath(`${outputPath}`);

  // Create the index file
  indexFileWriter.createFile(`${outputPath}/index.ts`, ({ writer }) => {
    writer.writeLine(`export * from './modelSchema'`);
    writer.writeLine(
      `export * from './${extendedDMMF.generatorConfig.inputTypePath}'`,
    );
    writer.writeLine(
      `export * from './${extendedDMMF.generatorConfig.outputTypePath}'`,
    );
  });

  // Create the model files
  writeModelFiles({ outputPath, extendedDMMF });

  // Create the input type files
  writeInputTypeFiles({ outputPath, extendedDMMF });

  // Create the arg type files
  writeArgTypeFiles({ outputPath, extendedDMMF });
};
