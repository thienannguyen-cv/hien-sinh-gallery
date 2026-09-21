import paths from '../../generated/release/publicDocumentPaths.json';
import commitsRaw from '../../generated/release/publicDocumentCommits.json';
import { RELEASE_COORDINATES } from '../../generated/release/releaseCoordinates';

const documentCommits = commitsRaw as Record<string, string>;

interface DocGroup {
  title: string;
  viPath: string;
  enPath?: string;
}

const primaryDocs: DocGroup[] = [
  { title: 'Work Ontology', viPath: 'WORK-ONTOLOGY.md', enPath: 'WORK-ONTOLOGY.en.md' },
  { title: 'Legal Terms', viPath: 'LEGAL-TERMS.md', enPath: 'LEGAL-TERMS.en.md' },
  { title: 'Transaction Disclosure', viPath: 'TRANSACTION-DISCLOSURE.md', enPath: 'TRANSACTION-DISCLOSURE.en.md' },
  { title: 'Security Audit Disclosure', viPath: 'SECURITY-AUDIT-DISCLOSURE.md', enPath: 'SECURITY-AUDIT-DISCLOSURE.en.md' },
  { title: 'Acquisition & Retrieval', viPath: 'ACQUISITION-RETRIEVAL.md' },
  { title: 'Transfer & Succession', viPath: 'SUCCESSION-PROCEDURE.md' },
  { title: 'Independent Operation', viPath: 'INDEPENDENT-OPERATION.md', enPath: 'INDEPENDENT-OPERATION.en.md' },
  { title: 'Verification Procedure', viPath: 'VERIFY.md', enPath: 'VERIFY.en.md' },
  { title: 'Provenance & Lineage', viPath: 'PROVENANCE.md', enPath: 'PROVENANCE.en.md' },
  { title: 'Stewardship Charter', viPath: 'STEWARDSHIP-CHARTER.md', enPath: 'STEWARDSHIP-CHARTER.en.md' },
  { title: 'Complete Package Schedule', viPath: 'SCHEDULE-COMPLETE.md', enPath: 'SCHEDULE-COMPLETE.en.md' },
  { title: 'Frame Package Schedule', viPath: 'SCHEDULE-FRAME.md', enPath: 'SCHEDULE-FRAME.en.md' },
  { title: 'Ontological Observation Log', viPath: 'ONTOLOGICAL-OBSERVATION-LOG.md', enPath: 'ONTOLOGICAL-OBSERVATION-LOG.en.md' },
];

const fileUrl = (path: string) => {
  const commit = documentCommits[path] || 'main';
  return `${RELEASE_COORDINATES.publicRepoBaseUrl}/blob/${commit}/00_PUBLIC/${path.split('/').map(encodeURIComponent).join('/')}`;
};

const shortHash = (path: string) => {
  const full = documentCommits[path];
  return full ? full.slice(0, 7) : 'pinned';
};

export function PublicDocuments() {
  return (
    <section aria-label="Public release documents" style={{ marginTop: 24 }}>
      <h3 className="t-mono-label">PUBLIC DOCUMENTS</h3>
      <p>
        All canonical ontology and legal authority documents are held in Vietnamese (marked [Canonical VI]), accompanied by English access renderings. Each link below resolves to its immutable, file-level commit permalink.
      </p>
      <ul style={{ paddingLeft: 18, lineHeight: 1.9, listStyleType: 'disc' }}>
        {primaryDocs.map(doc => (
          <li key={doc.viPath}>
            <span style={{ fontWeight: 500 }}>{doc.title}: </span>
            <a href={fileUrl(doc.viPath)} target="_blank" rel="noopener noreferrer" title={`Commit ${shortHash(doc.viPath)}`}>
              Canonical VI <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({shortHash(doc.viPath)})</span>
            </a>
            {doc.enPath && (
              <>
                <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                <a href={fileUrl(doc.enPath)} target="_blank" rel="noopener noreferrer" title={`Commit ${shortHash(doc.enPath)}`}>
                  Access EN <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({shortHash(doc.enPath)})</span>
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      <details>
        <summary style={{ cursor: 'pointer', margin: '12px 0' }}>All public files ({paths.length})</summary>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, overflowWrap: 'anywhere' }}>
          {paths.map(path => (
            <li key={path}>
              <a href={fileUrl(path)} target="_blank" rel="noopener noreferrer">
                {path}
              </a>
              {documentCommits[path] && (
                <span style={{ opacity: 0.5, fontSize: '0.85em', marginLeft: 6 }}>
                  ({shortHash(path)})
                </span>
              )}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

