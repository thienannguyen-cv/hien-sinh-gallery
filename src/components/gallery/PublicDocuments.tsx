import paths from '../../generated/release/publicDocumentPaths.json';
import { RELEASE_COORDINATES } from '../../generated/release/releaseCoordinates';

const primary = [
  ['WORK-ONTOLOGY.md', 'Work ontology · VI'],
  ['WORK-ONTOLOGY.en.md', 'Work ontology · EN'],
  ['ACQUISITION-RETRIEVAL.md', 'Acquisition and retrieval'],
  ['SUCCESSION-PROCEDURE.md', 'Transfer and succession'],
  ['INDEPENDENT-OPERATION.md', 'Independent operation · VI'],
  ['INDEPENDENT-OPERATION.en.md', 'Independent operation · EN'],
];
const fileUrl = (path: string) => `${RELEASE_COORDINATES.publicRepoBaseUrl}/blob/main/00_PUBLIC/${path.split('/').map(encodeURIComponent).join('/')}`;

export function PublicDocuments() {
  return (
    <section aria-label="Public release documents" style={{ marginTop: 24 }}>
      <h3 className="t-mono-label">PUBLIC DOCUMENTS</h3>
      <p>Read the shared documents directly in the public repository. Package downloads contain the materials specific to your token.</p>
      <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
        {primary.map(([path, label]) => <li key={path}><a href={fileUrl(path)} target="_blank" rel="noopener noreferrer">{label}</a></li>)}
      </ul>
      <details>
        <summary style={{ cursor: 'pointer', margin: '12px 0' }}>All public files ({paths.length})</summary>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, overflowWrap: 'anywhere' }}>
          {paths.map(path => <li key={path}><a href={fileUrl(path)} target="_blank" rel="noopener noreferrer">{path}</a></li>)}
        </ul>
      </details>
    </section>
  );
}
