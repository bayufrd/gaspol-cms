import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const RevenueGeneratorDocModal = ({ show, onHide }) => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      fetchDocumentation();
    }
  }, [show]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      // Fetch dari public folder
      const response = await axios.get('/DOKUMENTASI_REVENUE_GENERATOR.md');
      setMarkdownContent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading documentation:', error);
      setMarkdownContent('# Error\n\nGagal memuat dokumentasi. Pastikan file DOKUMENTASI_REVENUE_GENERATOR.md ada di folder public.');
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show revenue-doc-modal" 
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      onClick={onHide}
    >
      <div 
        className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90%' }}
      >
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-book me-2"></i>
              📚 Dokumentasi Revenue Generator
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '2rem' }}>
            <style>{`
              /* Main Content Styling */
              .revenue-doc-modal .doc-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.7;
                color: #24292e;
                max-width: 100%;
                word-wrap: break-word;
              }
              
              /* Headers */
              .revenue-doc-modal .doc-content h1 {
                color: #24292e;
                font-size: 2rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 3px solid #3498db;
              }
              
              .revenue-doc-modal .doc-content h2 {
                color: #24292e;
                font-size: 1.6rem;
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 1rem;
                padding-bottom: 0.4rem;
                border-bottom: 2px solid #e1e4e8;
              }
              
              .revenue-doc-modal .doc-content h3 {
                color: #24292e;
                font-size: 1.3rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.8rem;
              }
              
              .revenue-doc-modal .doc-content h4 {
                color: #24292e;
                font-size: 1.1rem;
                font-weight: 600;
                margin-top: 1.2rem;
                margin-bottom: 0.7rem;
              }
              
              /* Paragraphs */
              .revenue-doc-modal .doc-content p {
                margin-bottom: 1rem;
                line-height: 1.7;
              }
              
              /* Lists */
              .revenue-doc-modal .doc-content ul, 
              .revenue-doc-modal .doc-content ol {
                padding-left: 2rem;
                margin-bottom: 1rem;
              }
              
              .revenue-doc-modal .doc-content li {
                margin-bottom: 0.5rem;
                line-height: 1.6;
              }
              
              .revenue-doc-modal .doc-content li p {
                margin-bottom: 0.5rem;
              }
              
              .revenue-doc-modal .doc-content ul ul,
              .revenue-doc-modal .doc-content ol ul,
              .revenue-doc-modal .doc-content ul ol,
              .revenue-doc-modal .doc-content ol ol {
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
              }
              
              /* Tables */
              .revenue-doc-modal .doc-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
                background: white;
                display: table;
                max-width: 100%;
              }
              
              /* Table wrapper untuk scroll */
              .revenue-doc-modal .doc-content {
                overflow-x: auto;
              }
              
              .revenue-doc-modal .doc-content table thead {
                background: #0366d6;
              }
              
              .revenue-doc-modal .doc-content table th {
                background: #0366d6;
                color: white;
                padding: 0.75rem;
                text-align: left;
                font-weight: 600;
                border: 1px solid #0366d6;
                white-space: nowrap;
              }
              
              .revenue-doc-modal .doc-content table td {
                padding: 0.75rem;
                border: 1px solid #d0d7de;
                vertical-align: top;
                background: white;
              }
              
              .revenue-doc-modal .doc-content table tbody tr:nth-child(even) {
                background: #f6f8fa;
              }
              
              .revenue-doc-modal .doc-content table tbody tr:hover {
                background: #eef2f7;
              }
              
              /* Code */
              .revenue-doc-modal .doc-content code {
                background: #f6f8fa;
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                font-size: 0.9em;
                color: #24292e;
                border: 1px solid #e1e4e8;
              }
              
              .revenue-doc-modal .doc-content pre {
                background: #f6f8fa;
                padding: 1rem;
                border-radius: 6px;
                overflow-x: auto;
                margin: 1rem 0;
                border: 1px solid #e1e4e8;
              }
              
              .revenue-doc-modal .doc-content pre code {
                background: none;
                color: #24292e;
                padding: 0;
                border: none;
                font-size: 0.85rem;
                line-height: 1.5;
                display: block;
              }
              
              /* Horizontal Rule */
              .revenue-doc-modal .doc-content hr {
                border: none;
                border-top: 2px solid #e1e4e8;
                margin: 1.5rem 0;
              }
              
              /* Emphasis */
              .revenue-doc-modal .doc-content strong {
                font-weight: 600;
                color: #24292e;
              }
              
              .revenue-doc-modal .doc-content em {
                font-style: italic;
              }
              
              /* Links */
              .revenue-doc-modal .doc-content a {
                color: #0366d6;
                text-decoration: none;
              }
              
              .revenue-doc-modal .doc-content a:hover {
                text-decoration: underline;
              }
              
              /* Blockquotes */
              .revenue-doc-modal .doc-content blockquote {
                border-left: 4px solid #dfe2e5;
                padding-left: 1rem;
                margin: 1rem 0;
                color: #6a737d;
              }
              
              .revenue-doc-modal .doc-content blockquote p {
                margin-bottom: 0.5rem;
              }
              
              /* Images */
              .revenue-doc-modal .doc-content img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 1rem 0;
              }
              
              /* Loading Spinner */
              .revenue-doc-modal .loading-spinner {
                text-align: center;
                padding: 3rem;
              }
              
              .revenue-doc-modal .loading-spinner .spinner-border {
                width: 3rem;
                height: 3rem;
              }
              
              /* Scrollbar Styling */
              .revenue-doc-modal .modal-body::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              
              .revenue-doc-modal .modal-body::-webkit-scrollbar-track {
                background: #f1f1f1;
              }
              
              .revenue-doc-modal .modal-body::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
              }
              
              .revenue-doc-modal .modal-body::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
              
              /* Table Responsiveness */
              @media (max-width: 768px) {
                .revenue-doc-modal .doc-content table {
                  font-size: 0.85rem;
                }
                
                .revenue-doc-modal .doc-content table th,
                .revenue-doc-modal .doc-content table td {
                  padding: 0.5rem;
                }
              }
            `}</style>

            {loading ? (
              <div className="loading-spinner">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Memuat dokumentasi...</p>
              </div>
            ) : (
              <div className="doc-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onHide}>
              <i className="bi bi-x-circle me-2"></i>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
