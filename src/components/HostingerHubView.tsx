import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  Server,
  Download,
  FileCode,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FolderTree,
  Database
} from 'lucide-react';

export const HostingerHubView: React.FC = () => {
  const [files, setFiles] = useState<{ path: string; name: string; size: number }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('database/database.sql');
  const [fileContent, setFileContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<{ path: string; name: string; size: number }[]>('/api/hostinger-files')
      .then(res => {
        setFiles(res);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setLoading(true);
      apiRequest<{ content: string }>(`/api/hostinger-file-content?file=${encodeURIComponent(selectedFile)}`)
        .then(res => setFileContent(res.content))
        .catch(() => setFileContent('// File content unavailable'))
        .finally(() => setLoading(false));
    }
  }, [selectedFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-3">
              <Server className="w-3.5 h-3.5" />
              <span>Production Hostinger / cPanel PHP 8+ Package</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Hostinger Deployment & Source Code Hub</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Download the entire ready-to-deploy PHP + MySQL codebase as a single ZIP archive, or inspect and copy individual production files with prepared statements and multi-tenant isolation.
            </p>
          </div>

          <a
            href="/api/download-hostinger-zip"
            download="smart-school-management-hostinger.zip"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download All PHP Source (.ZIP)</span>
          </a>
        </div>
      </div>

      {/* Step-by-Step Hostinger Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Database className="w-4 h-4 text-blue-600" />
          10-Step Hostinger Deployment Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
            <div>
              <strong className="text-slate-900 block">Create MySQL Database in Hostinger</strong>
              <span className="text-slate-500">Go to hPanel &rarr; Databases &rarr; Create Database (e.g. <code>u123456789_school</code>).</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
            <div>
              <strong className="text-slate-900 block">Import <code>database.sql</code> via phpMyAdmin</strong>
              <span className="text-slate-500">Click phpMyAdmin in hPanel, open your DB and import <code>database.sql</code>.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
            <div>
              <strong className="text-slate-900 block">Upload files to <code>public_html</code></strong>
              <span className="text-slate-500">Extract the downloaded ZIP directly into your Hostinger <code>public_html/</code> directory.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
            <div>
              <strong className="text-slate-900 block">Update <code>config/database.php</code></strong>
              <span className="text-slate-500">Set <code>DB_NAME</code>, <code>DB_USER</code>, and <code>DB_PASS</code> created in Step 1.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">5</span>
            <div>
              <strong className="text-slate-900 block">Set Folder Permissions (<code>chmod 755</code>)</strong>
              <span className="text-slate-500">Ensure the <code>uploads/</code> directory has write permissions for image uploads.</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">6</span>
            <div>
              <strong className="text-slate-900 block">Enable Free SSL / HTTPS</strong>
              <span className="text-slate-500">In hPanel Security, activate SSL to secure sessions across devices.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Inspector & File Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Production Code Inspector</h3>
            <span className="text-slate-400 text-xs">({files.length} release files)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Content!' : 'Copy Active File'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
          {/* File Explorer Tree */}
          <div className="border-r border-slate-100 bg-slate-50 p-2 overflow-y-auto max-h-[550px] space-y-0.5 text-xs font-mono">
            {files.map(f => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f.path)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                  selectedFile === f.path
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.path}</span>
                </div>
                <span className={`text-[10px] shrink-0 ml-1 ${selectedFile === f.path ? 'text-blue-100' : 'text-slate-400'}`}>
                  {Math.round(f.size / 1024)}K
                </span>
              </button>
            ))}
          </div>

          {/* Syntax Code Viewer */}
          <div className="md:col-span-3 bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[550px]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 mb-2 border-b border-slate-800">
              <span>{selectedFile}</span>
              <span>UTF-8 • Prepared Statement Guarded</span>
            </div>
            {loading ? (
              <div className="text-slate-500 py-8 text-center">Loading file content...</div>
            ) : (
              <pre className="whitespace-pre">{fileContent}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
