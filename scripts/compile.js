import fs from 'fs';
import path from 'path';
import solc from 'solc';

const contractPath = path.resolve('contracts', 'HienSinhGallery.sol');
const source = fs.readFileSync(contractPath, 'utf8');

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const fullPath = path.resolve('node_modules', importPath);
    return { contents: fs.readFileSync(fullPath, 'utf8') };
  }
  return { error: 'File not found' };
}

const input = {
  language: 'Solidity',
  sources: {
    'HienSinhGallery.sol': {
      content: source,
    },
  },
  settings: {
    evmVersion: 'cancun',
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling HienSinhGallery.sol with Solidity 0.8.24...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation errors:', errors);
    process.exit(1);
  }
}

const contract = output.contracts['HienSinhGallery.sol']['HienSinhGallery'];
const artifact = {
  contractName: 'HienSinhGallery',
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};

fs.writeFileSync(
  path.resolve('contracts', 'HienSinhGallery.json'),
  JSON.stringify(artifact, null, 2)
);

console.log('✓ Compilation successful! Artifact saved to contracts/HienSinhGallery.json');
