import { useState, useEffect, FormEvent, DragEvent } from 'react';
import { 
  OfflineStorage 
} from '../lib/database';
import { useDbChange } from '../lib/useDbChange';
import { 
  CloudDocument 
} from '../types';
import { 
  FileText, 
  Trash2, 
  CloudLightning, 
  Upload, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  BrainCircuit,
  Database,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';

interface FileLockerProps {
  ownerId: string;
}

export default function FileLocker({ ownerId }: FileLockerProps) {
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [editorTitle, setEditorTitle] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [editorType, setEditorType] = useState<'note' | 'document'>("note");
  
  // Drag and drop / file selector visual state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string>("");

  const dbChange = useDbChange();

  useEffect(() => {
    setDocuments(OfflineStorage.getDocuments());
  }, [dbChange]);

  const handleCreateDocument = (e: FormEvent) => {
    e.preventDefault();
    if (!editorTitle || !editorContent) return;

    const isOnline = OfflineStorage.getOnlineMode();
    const newDoc: CloudDocument = {
      id: `doc_custom_${Date.now()}`,
      title: editorTitle.endsWith(".note") || editorTitle.endsWith(".doc") 
        ? editorTitle 
        : `${editorTitle}.${editorType === 'note' ? 'note' : 'doc'}`,
      content: editorContent,
      fileType: editorType,
      size: `${(editorContent.length / 1024).toFixed(1)} KB`,
      ownerId: ownerId,
      createdAt: new Date().toISOString(),
      synced: isOnline // Marked synced if online, otherwise false!
    };

    const updated = [newDoc, ...documents];
    OfflineStorage.setDocuments(updated);
    setDocuments(updated);
    setEditorTitle("");
    setEditorContent("");

    // Add alert notification trigger
    const notifs = OfflineStorage.getNotifications();
    notifs.unshift({
      id: `notif_doc_${Date.now()}`,
      title: 'Cloud Locker saved',
      message: `"${newDoc.title}" registered successfully ${isOnline ? 'and synced to server.' : 'offline-first (pending connection sync).'}`,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    });
    OfflineStorage.setNotifications(notifs);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm("Are you sure you want to delete this cloud document? This action is local-first irrevocable.")) {
      const updated = documents.filter(d => d.id !== docId);
      OfflineStorage.setDocuments(updated);
      setDocuments(updated);
    }
  };

  // Mock upload trigger matching custom drag/drop instructions
  const handleMockUpload = (fileName: string, type: 'note' | 'document' | 'pdf' | 'spreadsheet') => {
    const isOnline = OfflineStorage.getOnlineMode();
    const mockContents = `Uploaded file draft structure metadata. Core analysis references for topic studies. Binary sync tracks active.`;
    const newDoc: CloudDocument = {
      id: `doc_upload_${Date.now()}`,
      title: fileName,
      content: mockContents,
      fileType: type,
      size: `${(Math.random() * 5 + 1).toFixed(1)} KB`,
      ownerId: ownerId,
      createdAt: new Date().toISOString(),
      synced: isOnline
    };

    const updated = [newDoc, ...documents];
    OfflineStorage.setDocuments(updated);
    setDocuments(updated);
    setLastUploadedFileName(fileName);
    setTimeout(() => setLastUploadedFileName(""), 3500);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate drop extraction
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const name = files[0].name;
      const extension = name.split('.').pop() || '';
      let type: any = 'document';
      if (['xlsx', 'csv'].includes(extension)) type = 'spreadsheet';
      if (['pdf'].includes(extension)) type = 'pdf';
      
      handleMockUpload(name, type);
    } else {
      // default simulation
      handleMockUpload("double_slit_calculus.pdf", "pdf");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Dynamic Text Editor drafting portal (Left Column 1/3) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
          <Database className="h-5 w-5" id="editor-locker-icon" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Draft Course Notes</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-4">Author study summaries. Edits are buffered offline-first, sync activates once connected online.</p>

        <form onSubmit={handleCreateDocument} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">NOTE TITLE</label>
            <input 
              type="text" 
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              placeholder="Planck Equation Derivatives.note" 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">DOCUMENT TYPE</label>
              <select 
                value={editorType}
                onChange={(e) => setEditorType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="note">Course Note (.note)</option>
                <option value="document">Homework Doc (.doc)</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <span className="text-[9px] font-mono text-slate-400 leading-tight">Saves as local caching node prior to secure sync.</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-slate-400 block mb-1">NOTE MARKDOWN CONTENTS</label>
            <textarea 
              rows={6}
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder={`Planck frequency state values:
h = 6.626e-34 J s
E = h * nu
Calculate continuous wave dual limits upon collisions...`} 
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Commit to Cloud Locker
          </button>
        </form>
      </div>

      {/* Cloud documents grid + Drag and drop (Right Column 2/3) */}
      <div className="space-y-6 lg:col-span-2">
        {/* Drag and drop simulated file uploader */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-violet-500 bg-violet-50/20' 
              : 'border-slate-350 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-450 dark:border-slate-800 dark:bg-slate-950/40'
          }`}
          onClick={() => handleMockUpload("bell_states_superposition.pdf", "pdf")}
        >
          <Upload className={`mx-auto h-8 w-8 mb-2 transition-transform duration-300 ${isDragging ? 'scale-110 text-violet-500' : 'text-slate-400'}`} />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isDragging ? 'Drop Draft Sheets here' : 'Drag & Drop Course Syllabus sheets or Upload'}
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Supports PDF slides, word docs, or matrices sheets. Max 5MB. Click card to simulate mock file select.</p>
          
          {lastUploadedFileName && (
            <div className="mt-2.5 text-xs font-bold text-emerald-600">
              Successfully injected {lastUploadedFileName}! Metadata synched.
            </div>
          )}
        </div>

        {/* List of active clouds documents */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Cloud Storage Inventory</h3>
          <p className="text-xs text-slate-500 mb-4">All syllabus notes synced below can be attached directly inside secure Teacher DMs.</p>

          <div className="grid gap-4 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4.5 hover:border-slate-200 transition-all shadow-sm dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <div className="rounded bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                      {doc.fileType === 'spreadsheet' ? <FileSpreadsheet className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="rounded p-1 text-slate-400 hover:text-rose-500"
                      title="Prune document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h4 className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={doc.title}>
                    {doc.title}
                  </h4>
                  <p className="mt-1 text-[10px] font-mono text-slate-400">Size: {doc.size}</p>
                  
                  <blockquote className="mt-2 text-[10px] leading-relaxed text-slate-500 italic bg-slate-50/50 p-2 rounded truncate dark:bg-slate-900">
                    {doc.content}
                  </blockquote>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-850">
                  <div className="flex items-center gap-1 text-[9px] font-mono font-medium">
                    {doc.synced ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Synced to Cloud</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-amber-600">Buffered Local Offline</span>
                      </>
                    )}
                  </div>
                  
                  <span className="text-[9px] font-mono text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
