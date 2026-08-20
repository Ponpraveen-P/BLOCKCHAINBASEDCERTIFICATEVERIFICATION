import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Database, 
  Search, 
  Cpu, 
  Clock, 
  Link as LinkIcon, 
  ShieldCheck,
  RefreshCw,
  Award,
  Layers,
  Fingerprint
} from 'lucide-react';
import ExplorerChain from '../components/3D/ExplorerChain';
import { blockchainService } from '../services/api';

const BlockchainExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlockchain = async () => {
    try {
      setLoading(true);
      const data = await blockchainService.getChain();
      setBlocks(data);
      // Auto-select the latest block to show details initially
      if (data.length > 0) {
        setSelectedBlock(data[data.length - 1]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blockchain ledger blocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchain();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyber-cyan animate-pulse">
        Connecting to blockchain ledger network...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Blockchain Ledger Explorer</h1>
          <p className="text-xs text-cyber-muted mt-1">Audit blocks, proof-of-work hashes, and node chains in real-time</p>
        </div>
        <button
          onClick={fetchBlockchain}
          className="p-2 bg-cyber-panel border border-cyber-border rounded-lg text-gray-300 hover:text-cyber-cyan hover:border-cyber-cyan transition-all"
          title="Reload ledger blocks"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* 3D Chain Visualization Component */}
      <ExplorerChain 
        blocks={blocks} 
        selectedBlock={selectedBlock} 
        onSelectBlock={(b) => setSelectedBlock(b)} 
      />

      {/* Block Details Inspector */}
      {selectedBlock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata details */}
          <div className="glass-panel p-6 lg:col-span-2 space-y-5 border border-cyber-border">
            <div className="flex justify-between items-center pb-4 border-b border-cyber-border">
              <h3 className="font-display font-bold text-md text-white flex items-center">
                <Database className="mr-2 h-4 w-4 text-cyber-cyan" />
                Block #{selectedBlock.index} Details
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                selectedBlock.index === 0
                  ? 'bg-amber-500 bg-opacity-10 text-amber-400 border-amber-500 border-opacity-20'
                  : 'bg-cyber-blue bg-opacity-10 text-cyber-cyan border-cyber-blue border-opacity-20'
              }`}>
                {selectedBlock.index === 0 ? 'GENESIS BLOCK' : 'STANDARD BLOCK'}
              </span>
            </div>

            {/* Hashes and links */}
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-black bg-opacity-30 rounded-lg border border-cyber-border">
                <p className="text-cyber-muted text-[10px] uppercase font-semibold tracking-wider flex items-center mb-1">
                  <Fingerprint className="mr-1.5 h-3.5 w-3.5 text-cyber-cyan" />
                  Block Hash (SHA-256)
                </p>
                <p className="text-white break-all text-[11px]">{selectedBlock.hash}</p>
              </div>

              <div className="p-3 bg-black bg-opacity-30 rounded-lg border border-cyber-border">
                <p className="text-cyber-muted text-[10px] uppercase font-semibold tracking-wider flex items-center mb-1">
                  <LinkIcon className="mr-1.5 h-3.5 w-3.5 text-cyber-blue" />
                  Previous Block Hash
                </p>
                <p className="text-gray-400 break-all text-[11px]">{selectedBlock.previousHash}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black bg-opacity-30 rounded-lg border border-cyber-border">
                  <p className="text-cyber-muted text-[10px] uppercase font-semibold tracking-wider flex items-center mb-1">
                    <Cpu className="mr-1.5 h-3.5 w-3.5 text-cyber-cyan" />
                    Mining Nonce
                  </p>
                  <p className="text-white text-md font-bold font-display">{selectedBlock.nonce}</p>
                </div>
                <div className="p-3 bg-black bg-opacity-30 rounded-lg border border-cyber-border">
                  <p className="text-cyber-muted text-[10px] uppercase font-semibold tracking-wider flex items-center mb-1">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-cyber-blue" />
                    Timestamp Mined
                  </p>
                  <p className="text-white text-sm">
                    {new Date(selectedBlock.timestamp).toLocaleDateString('en-IN')} {new Date(selectedBlock.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mined transactions details */}
          <div className="glass-panel p-6 border border-cyber-border flex flex-col">
            <h3 className="font-display font-bold text-white text-md pb-4 border-b border-cyber-border mb-4 flex items-center">
              <Award className="mr-2 h-4 w-4 text-cyber-cyan" />
              Mined Ledger Transactions
            </h3>

            {/* List certificates transaction */}
            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 pr-1">
              {selectedBlock.index === 0 ? (
                <div className="text-center py-8 text-cyber-muted text-xs">
                  Genesis Transaction: System Initialized.
                </div>
              ) : selectedBlock.data && selectedBlock.data.length > 0 ? (
                selectedBlock.data.map((tx, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-cyber-border bg-black bg-opacity-25 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white truncate max-w-[120px]">{tx.studentName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-cyber-blue bg-opacity-10 text-cyber-cyan text-[9px] font-mono">{tx.certificateId}</span>
                    </div>
                    <p className="text-cyber-muted text-[10px] truncate">{tx.course}</p>
                    
                    <div className="pt-2 border-t border-cyber-border border-opacity-30 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyber-muted">PDF Hash:</span>
                      <span className="text-cyber-cyan" title={tx.pdfHash}>{tx.pdfHash.slice(0, 12)}...</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-cyber-muted text-xs">
                  No transaction data inside block.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
